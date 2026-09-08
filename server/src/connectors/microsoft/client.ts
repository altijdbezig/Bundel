/**
 * Een dunne laag om Microsoft Graph.
 *
 * Meer dan drie dingen doet hij niet:
 *
 *   1. Het access token vernieuwen voordat het verloopt, en opnieuw als Graph
 *      alsnog 401 zegt. De nieuwe tokens gaan versleuteld naar de opslag.
 *   2. Wachten en het nog eens proberen bij 429, met de tijd die Microsoft zelf
 *      in `Retry-After` meegeeft.
 *   3. Merken dat de toestemming is ingetrokken. Dan wordt de status `revoked`
 *      en stopt het. Opnieuw proberen heeft dan geen zin: de gebruiker moet
 *      zelf opnieuw koppelen.
 *
 * Niets hierin gooit. Elke aanroep geeft een `GraphResult` terug.
 *
 * Er staat met opzet geen enkele log-regel in dit bestand. Een token loggen,
 * ook maar de eerste tekens ervan, is een token dat je moet intrekken. De
 * Authorization-header wordt per aanroep opgebouwd en nergens bewaard.
 */

import { decryptOptional, decryptToken, encryptOptional, encryptToken } from '../../crypto/tokens.ts'
import type { Connection, ConnectionStatus, SyncFailure, TokenStore } from '../types.ts'
import { GRAPH_BASE_URL, isExpiring, REFRESH_SKEW_MS, refreshTokens } from './auth.ts'
import type { MicrosoftConfig, TokenSet } from './auth.ts'

type Fetch = typeof globalThis.fetch
type Env = Record<string, string | undefined>

export type { TokenStore, TokenUpdate } from '../types.ts'

export type GraphResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: SyncFailure }

export interface GraphClientOptions {
  readonly config: MicrosoftConfig
  readonly tokens: TokenSet
  readonly store?: TokenStore
  readonly fetch?: Fetch
  readonly now?: () => Date
  /** Wachten tussen twee pogingen. Een test zet hier iets neer dat niet wacht. */
  readonly sleep?: (ms: number) => Promise<void>
  /** Waar de sleutel voor het versleutelen vandaan komt. */
  readonly env?: Env
  /** Hoe vaak we het bij 429 of een storing nog eens proberen. */
  readonly maxRetries?: number
  readonly skewMs?: number
  readonly baseUrl?: string
}

export interface GraphClient {
  get<T>(path: string, init?: RequestInit): Promise<GraphResult<T>>
  /** De tokens zoals ze nu zijn, dus met een eventuele refresh erin verwerkt. */
  tokens(): TokenSet
  status(): ConnectionStatus
}

/** Langer dan dit wachten we nooit op een `Retry-After`. */
const MAX_RETRY_AFTER_MS = 60_000
const DEFAULT_RETRY_MS = 1_000
const DEFAULT_MAX_RETRIES = 3

const revokedFailure = (): SyncFailure => ({
  code: 'auth',
  message: 'de koppeling met Microsoft is ingetrokken, opnieuw koppelen is nodig',
  retryable: false,
  status: 'revoked',
})

/**
 * De tokens van een rij uit `connections` bruikbaar maken. Ze staan daar
 * versleuteld, dus hier gaan ze een keer door `crypto/tokens.ts` heen.
 * Dit is de enige plek waar ze leesbaar worden, en ze blijven in het geheugen.
 */
export function tokensFromConnection(
  connection: Pick<Connection, 'accessToken' | 'refreshToken' | 'tokenExpiresAt' | 'scopes'>,
): TokenSet {
  return {
    accessToken: connection.accessToken,
    refreshToken: connection.refreshToken,
    expiresAt: connection.tokenExpiresAt ?? new Date(0),
    scopes: connection.scopes,
  }
}

/** Zelfde, maar dan rechtstreeks van de versleutelde kolommen. */
export function decryptTokens(
  row: {
    accessTokenEncrypted: string
    refreshTokenEncrypted: string | null
    tokenExpiresAt: Date | null
    scopes: readonly string[]
  },
  env: Env = process.env,
): TokenSet {
  return {
    accessToken: decryptToken(row.accessTokenEncrypted, env),
    refreshToken: decryptOptional(row.refreshTokenEncrypted, env),
    expiresAt: row.tokenExpiresAt ?? new Date(0),
    scopes: row.scopes,
  }
}

/**
 * `Retry-After` is een aantal seconden of een datum. Allebei komen voor,
 * dus allebei worden gelezen. Staat er niets bruikbaars, dan een vaste wachttijd.
 */
export function retryAfterMs(header: string | null, now: Date): number {
  if (!header) return DEFAULT_RETRY_MS

  const seconds = Number(header)
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS)
  }

  const until = Date.parse(header)
  if (Number.isNaN(until)) return DEFAULT_RETRY_MS
  return Math.min(Math.max(until - now.getTime(), 0), MAX_RETRY_AFTER_MS)
}

/** Haalt de foutcode uit een antwoord van Graph. Nooit de hele body. */
async function graphErrorCode(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { code?: string } }
    return body?.error?.code ?? `http_${response.status}`
  } catch {
    return `http_${response.status}`
  }
}

export function createGraphClient(options: GraphClientOptions): GraphClient {
  const fetchImpl = options.fetch ?? globalThis.fetch
  const now = options.now ?? (() => new Date())
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)))
  const env = options.env ?? process.env
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
  const skewMs = options.skewMs ?? REFRESH_SKEW_MS
  const baseUrl = options.baseUrl ?? GRAPH_BASE_URL

  let tokens = options.tokens
  let status: ConnectionStatus = 'active'

  async function remember(next: TokenSet): Promise<void> {
    tokens = next
    if (!options.store) return
    /* Versleutelen gebeurt hier, dus wat de opslag te zien krijgt is nooit
       leesbaar. Zie `crypto/tokens.ts`. */
    await options.store.save({
      accessTokenEncrypted: encryptToken(next.accessToken, env),
      refreshTokenEncrypted: encryptOptional(next.refreshToken, env),
      tokenExpiresAt: next.expiresAt,
      scopes: next.scopes,
      status: 'active',
    })
  }

  async function markRevoked(message: string): Promise<void> {
    status = 'revoked'
    if (options.store) await options.store.setStatus('revoked', message)
  }

  /** Haalt een nieuw access token. Mislukt dat door de gebruiker, dan stopt het hier. */
  async function refresh(): Promise<SyncFailure | null> {
    if (!tokens.refreshToken) {
      const failure = revokedFailure()
      await markRevoked(failure.message)
      return failure
    }

    const result = await refreshTokens(tokens.refreshToken, options.config, { fetch: fetchImpl, now })
    if (result.ok) {
      /* Microsoft stuurt niet altijd een nieuw refresh token mee. Dan blijft
         het oude geldig, dus dat houden we aan. */
      await remember({ ...result.tokens, refreshToken: result.tokens.refreshToken ?? tokens.refreshToken })
      return null
    }

    if (result.error.code === 'auth') {
      await markRevoked(result.error.message)
      return revokedFailure()
    }
    return result.error
  }

  async function ensureFresh(): Promise<SyncFailure | null> {
    if (!isExpiring(tokens.expiresAt, now(), skewMs)) return null
    return refresh()
  }

  async function request<T>(path: string, init: RequestInit, attempt: number, refreshed: boolean): Promise<GraphResult<T>> {
    if (status === 'revoked') return { ok: false, error: revokedFailure() }

    const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`

    let response: Response
    try {
      response = await fetchImpl(url, {
        ...init,
        headers: {
          ...(init.headers as Record<string, string> | undefined),
          Authorization: `Bearer ${tokens.accessToken}`,
          Accept: 'application/json',
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'onbekende fout'
      return { ok: false, error: { code: 'unavailable', message: `Graph niet bereikbaar: ${message}`, retryable: true } }
    }

    if (response.status === 401) {
      /* Een keer vernieuwen en het nog eens proberen. Blijft het 401, dan
         accepteert Microsoft ons niet meer en is de toestemming weg. */
      if (refreshed) {
        const failure = revokedFailure()
        await markRevoked(failure.message)
        return { ok: false, error: failure }
      }
      const failure = await refresh()
      if (failure) return { ok: false, error: failure }
      return request<T>(path, init, attempt, true)
    }

    if (response.status === 403) {
      const code = await graphErrorCode(response)
      return {
        ok: false,
        error: {
          code: 'auth',
          message: `Graph geeft geen toegang (${code}), de beheerder moet de app goedkeuren`,
          retryable: false,
        },
      }
    }

    if (response.status === 429) {
      if (attempt >= maxRetries) {
        return { ok: false, error: { code: 'rate_limited', message: 'Graph blijft ons tegenhouden', retryable: true } }
      }
      await sleep(retryAfterMs(response.headers.get('Retry-After'), now()))
      return request<T>(path, init, attempt + 1, refreshed)
    }

    if (response.status >= 500) {
      if (attempt >= maxRetries) {
        return {
          ok: false,
          error: { code: 'unavailable', message: `Graph blijft een fout geven (${response.status})`, retryable: true },
        }
      }
      await sleep(DEFAULT_RETRY_MS * (attempt + 1))
      return request<T>(path, init, attempt + 1, refreshed)
    }

    if (!response.ok) {
      const code = await graphErrorCode(response)
      return { ok: false, error: { code: 'unexpected', message: `Graph gaf een fout terug (${code})`, retryable: false } }
    }

    try {
      return { ok: true, data: (await response.json()) as T }
    } catch {
      return { ok: false, error: { code: 'unexpected', message: 'Graph gaf geen leesbaar antwoord', retryable: false } }
    }
  }

  return {
    async get<T>(path: string, init: RequestInit = {}): Promise<GraphResult<T>> {
      if (status === 'revoked') return { ok: false, error: revokedFailure() }

      const failure = await ensureFresh()
      if (failure) return { ok: false, error: failure }

      return request<T>(path, { ...init, method: 'GET' }, 0, false)
    },
    tokens: () => tokens,
    status: () => status,
  }
}
