/**
 * Inloggen bij Microsoft Entra, en het beheer van de tokens die daaruit komen.
 *
 * De flow is authorization code met PKCE. In het kort:
 *
 *   1. `buildAuthorizationUrl()` stuurt de gebruiker naar Microsoft, met een
 *      `code_challenge` die hoort bij een `code_verifier` die alleen wij hebben.
 *   2. Microsoft stuurt hem terug naar de redirect met een `code`.
 *   3. `exchangeCode()` wisselt die code plus de `code_verifier` in voor een
 *      access token en een refresh token.
 *   4. `refreshTokens()` haalt later een nieuw access token op zonder dat de
 *      gebruiker er iets van merkt.
 *
 * PKCE is er tegen het onderscheppen van de code. Zonder de `code_verifier` is
 * een onderschepte code niets waard. Het hoort bij een publieke client, maar
 * ook met een client secret erbij is het gratis extra zekerheid, dus het staat
 * er altijd op.
 *
 * Niets in dit bestand gooit in het aanroeppad. Alles geeft een `TokenResult`
 * terug, dus mislukken is onderdeel van het antwoord. `readConfig()` is de
 * uitzondering: die gooit wel, maar wordt alleen bij het opstarten aangeroepen
 * en de connector vangt hem af.
 *
 * Er komt hier nergens een token in een foutmelding of in een log terecht,
 * ook niet afgekort. Een token dat ergens is opgeschreven is een token dat je
 * moet intrekken.
 */

import { createHash, randomBytes } from 'node:crypto'
import type { SyncFailure } from '../types.ts'

/**
 * De rechten die we vragen. Zo min mogelijk, en allemaal alleen lezen.
 * De uitleg per scope staat in `server/README.md`.
 */
export const SCOPES: readonly string[] = [
  'openid',
  'profile',
  'offline_access',
  'User.Read',
  'Team.ReadBasic.All',
  'Channel.ReadBasic.All',
  'ChannelMessage.Read.All',
]

export const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0'

const LOGIN_HOST = 'https://login.microsoftonline.com'

/** Zoveel voor het verlopen halen we alvast een nieuw token. */
export const REFRESH_SKEW_MS = 5 * 60 * 1000

export interface MicrosoftConfig {
  readonly tenantId: string
  readonly clientId: string
  readonly clientSecret: string
  readonly redirectUri: string
}

export interface TokenSet {
  readonly accessToken: string
  readonly refreshToken: string | null
  readonly expiresAt: Date
  readonly scopes: readonly string[]
}

export type TokenResult =
  | { readonly ok: true; readonly tokens: TokenSet }
  | { readonly ok: false; readonly error: SyncFailure }

export interface PkcePair {
  readonly verifier: string
  readonly challenge: string
  readonly method: 'S256'
}

type Env = Record<string, string | undefined>
type Fetch = typeof globalThis.fetch

export const CONFIG_ENV = {
  tenantId: 'MICROSOFT_TENANT_ID',
  clientId: 'MICROSOFT_CLIENT_ID',
  clientSecret: 'MICROSOFT_CLIENT_SECRET',
  redirectUri: 'MICROSOFT_REDIRECT_URI',
} as const

/** Leest de app-registratie uit de omgeving. Gooit als er iets ontbreekt. */
export function readConfig(env: Env = process.env): MicrosoftConfig {
  const missing = Object.values(CONFIG_ENV).filter((name) => !env[name])
  if (missing.length > 0) {
    throw new Error(`Bundel: ${missing.join(', ')} ontbreekt`)
  }
  return {
    tenantId: env[CONFIG_ENV.tenantId] as string,
    clientId: env[CONFIG_ENV.clientId] as string,
    clientSecret: env[CONFIG_ENV.clientSecret] as string,
    redirectUri: env[CONFIG_ENV.redirectUri] as string,
  }
}

export function authorizeEndpoint(config: MicrosoftConfig): string {
  return `${LOGIN_HOST}/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/authorize`
}

export function tokenEndpoint(config: MicrosoftConfig): string {
  return `${LOGIN_HOST}/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/token`
}

/**
 * Een `code_verifier` met de bijbehorende `code_challenge`.
 * De verifier bewaar je bij de sessie tot de gebruiker terugkomt. Hij mag
 * nergens anders heen, want daarmee valt de code in te wisselen.
 */
export function createPkcePair(): PkcePair {
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge, method: 'S256' }
}

/** Losse waarde tegen CSRF op de redirect. Controleer hem bij terugkomst. */
export function createState(): string {
  return randomBytes(16).toString('base64url')
}

export interface AuthorizationRequest {
  readonly state: string
  readonly codeChallenge: string
  /** Vult het inlogscherm alvast in. Optioneel, en nooit verplicht. */
  readonly loginHint?: string
  readonly scopes?: readonly string[]
}

/** Bouwt de URL waar de gebruiker naartoe gaat om toestemming te geven. */
export function buildAuthorizationUrl(request: AuthorizationRequest, config: MicrosoftConfig): string {
  const url = new URL(authorizeEndpoint(config))
  const params = url.searchParams

  params.set('client_id', config.clientId)
  params.set('response_type', 'code')
  params.set('redirect_uri', config.redirectUri)
  params.set('response_mode', 'query')
  params.set('scope', (request.scopes ?? SCOPES).join(' '))
  params.set('state', request.state)
  params.set('code_challenge', request.codeChallenge)
  params.set('code_challenge_method', 'S256')
  if (request.loginHint) params.set('login_hint', request.loginHint)

  return url.toString()
}

/**
 * Wat Microsoft terugstuurt als het misgaat. `invalid_grant` is de
 * belangrijkste: de toestemming is ingetrokken of het token is vervallen.
 * Daarna heeft opnieuw proberen geen zin, de gebruiker moet opnieuw koppelen.
 */
const CONSENT_GONE = new Set([
  'invalid_grant',
  'invalid_client',
  'unauthorized_client',
  'consent_required',
  'interaction_required',
])

interface TokenErrorBody {
  error?: string
  error_description?: string
}

/** Maakt van een antwoord van het token-endpoint een leesbare mislukking. */
function tokenFailure(status: number, body: TokenErrorBody | null): SyncFailure {
  const code = body?.error ?? `http_${status}`

  if (CONSENT_GONE.has(code)) {
    return { code: 'auth', message: `Microsoft weigert de koppeling (${code})`, retryable: false }
  }
  if (status === 429) {
    return { code: 'rate_limited', message: 'Microsoft houdt ons even tegen', retryable: true }
  }
  if (status >= 500) {
    return { code: 'unavailable', message: `Microsoft is niet bereikbaar (${status})`, retryable: true }
  }
  /* De error_description van Microsoft bevat een AADSTS-code en soms het
     adres van de gebruiker, maar nooit een token. Toch nemen we alleen de
     code over, want een foutmelding hoort kort te zijn. */
  return { code: 'unexpected', message: `Microsoft gaf een fout terug (${code})`, retryable: false }
}

interface TokenResponseBody {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  scope?: string
}

/** Praat met het token-endpoint. Gooit niet, wat er ook gebeurt. */
async function postToken(
  form: Record<string, string>,
  config: MicrosoftConfig,
  deps: { fetch: Fetch; now: () => Date },
): Promise<TokenResult> {
  let response: Response
  try {
    response = await deps.fetch(tokenEndpoint(config), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        ...form,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }).toString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'onbekende fout'
    return {
      ok: false,
      error: { code: 'unavailable', message: `Microsoft niet bereikbaar: ${message}`, retryable: true },
    }
  }

  let body: (TokenResponseBody & TokenErrorBody) | null = null
  try {
    body = (await response.json()) as TokenResponseBody & TokenErrorBody
  } catch {
    body = null
  }

  if (!response.ok || !body?.access_token) {
    return { ok: false, error: tokenFailure(response.status, body) }
  }

  const seconds = typeof body.expires_in === 'number' ? body.expires_in : 3600
  return {
    ok: true,
    tokens: {
      accessToken: body.access_token,
      /* Bij een refresh stuurt Microsoft soms geen nieuw refresh token mee.
         De aanroeper houdt dan het oude aan. */
      refreshToken: body.refresh_token ?? null,
      expiresAt: new Date(deps.now().getTime() + seconds * 1000),
      scopes: body.scope ? body.scope.split(' ').filter(Boolean) : [],
    },
  }
}

export interface ExchangeRequest {
  readonly code: string
  readonly codeVerifier: string
}

export interface AuthDeps {
  readonly fetch?: Fetch
  readonly now?: () => Date
}

function resolve(deps: AuthDeps): { fetch: Fetch; now: () => Date } {
  return { fetch: deps.fetch ?? globalThis.fetch, now: deps.now ?? (() => new Date()) }
}

/** Stap 3: de code van de redirect inwisselen voor tokens. */
export function exchangeCode(
  request: ExchangeRequest,
  config: MicrosoftConfig,
  deps: AuthDeps = {},
): Promise<TokenResult> {
  return postToken(
    {
      grant_type: 'authorization_code',
      code: request.code,
      redirect_uri: config.redirectUri,
      code_verifier: request.codeVerifier,
      scope: SCOPES.join(' '),
    },
    config,
    resolve(deps),
  )
}

/** Stap 4: een nieuw access token halen met het refresh token. */
export function refreshTokens(
  refreshToken: string,
  config: MicrosoftConfig,
  deps: AuthDeps = {},
): Promise<TokenResult> {
  return postToken(
    { grant_type: 'refresh_token', refresh_token: refreshToken, scope: SCOPES.join(' ') },
    config,
    resolve(deps),
  )
}

/** Is dit token verlopen, of bijna? */
export function isExpiring(expiresAt: Date | null, now: Date, skewMs: number = REFRESH_SKEW_MS): boolean {
  if (!expiresAt) return true
  return expiresAt.getTime() - now.getTime() <= skewMs
}
