/**
 * De drie endpoints, los van de webserver eronder.
 *
 * `createRouter()` geeft een functie die een verzoek omzet in een antwoord.
 * Er zit geen node:http in, dus een test kan hem rechtstreeks aanroepen zonder
 * een poort te openen of een request na te bouwen. De adapter naar node:http
 * staat in `server.ts`.
 *
 * De flow:
 *
 *   GET /auth/microsoft/start
 *     Controleert de sessie, maakt een PKCE-paar en een state, legt die vast en
 *     stuurt door naar Microsoft.
 *
 *   GET /auth/microsoft/callback
 *     Microsoft stuurt de gebruiker hierheen. De state wordt opgehaald en
 *     meteen verwijderd. Klopt hij niet, dan stopt het. Klopt hij wel, dan
 *     wordt de code ingewisseld en gaan de tokens versleuteld naar
 *     `connections`.
 *
 *   GET /health
 *     Zegt alleen dat de server draait.
 *
 * Over de gebruiker op de callback: de browser komt daar terug vanaf Microsoft
 * en heeft dan geen Authorization-header. De gebruiker komt daarom uit de rij
 * die bij `start` is weggeschreven onder een gecontroleerde sessie. Dat is de
 * hele reden dat `state` bestaat. Er wordt dus nooit een `user_id` uit de
 * querystring gelezen. Staat er toch een geldige header op de callback, dan
 * moet die bij dezelfde gebruiker horen, anders is het einde oefening.
 *
 * Wat er nooit in een antwoord komt: een stack trace, een token, een code, of
 * een code_verifier. Bij een fout gaat er een korte code mee en verder niets.
 */

import { buildAuthorizationUrl, createPkcePair, exchangeCode, SCOPES } from '../connectors/microsoft/auth.ts'
import type { MicrosoftConfig } from '../connectors/microsoft/auth.ts'
import { InvalidStateError } from '../store/oauth-state.ts'
import type { OAuthStateStore } from '../store/oauth-state.ts'
import type { ConnectionStore } from '../store/connections.ts'
import { bearerFrom } from './user.ts'
import type { VerifyUser } from './user.ts'

type Fetch = typeof globalThis.fetch
type Headers = Record<string, string | string[] | undefined>

export interface RouteResponse {
  readonly status: number
  readonly headers: Record<string, string>
  readonly body: string
}

export interface RouterDeps {
  readonly microsoft: MicrosoftConfig
  readonly stateStore: OAuthStateStore
  readonly connections: ConnectionStore
  readonly verifyUser: VerifyUser
  readonly fetch?: Fetch
  readonly now?: () => Date
  /** Waar de gebruiker na afloop heen gaat. Zonder dit volgt een kale pagina. */
  readonly appBaseUrl?: string
  readonly scopes?: readonly string[]
}

/** Foutcodes die naar buiten mogen. Kort, en zonder details over de oorzaak. */
export type FailureCode =
  | 'unauthorized'
  | 'state_missing'
  | 'state_invalid'
  | 'state_expired'
  | 'denied'
  | 'exchange_failed'
  | 'profile_failed'
  | 'save_failed'
  | 'server_error'
  | 'not_found'

const TEXT = { 'Content-Type': 'text/plain; charset=utf-8' }
const JSON_TYPE = { 'Content-Type': 'application/json; charset=utf-8' }

/** Wat de gebruiker te zien krijgt als er geen app-adres is ingesteld. */
const HUMAN: Record<FailureCode, string> = {
  unauthorized: 'Je bent niet ingelogd. Log in bij Bundel en probeer het opnieuw.',
  state_missing: 'Deze koppelpoging mist gegevens. Begin opnieuw vanaf Bronnen.',
  state_invalid: 'Deze koppelpoging is niet bekend. Begin opnieuw vanaf Bronnen.',
  state_expired: 'Deze koppelpoging is verlopen. Begin opnieuw vanaf Bronnen.',
  denied: 'Je hebt de toestemming niet gegeven. Er is niets gekoppeld.',
  exchange_failed: 'Microsoft gaf geen toegang. Probeer het later nog eens.',
  profile_failed: 'Microsoft gaf geen antwoord op de controle. Probeer het later nog eens.',
  save_failed: 'De koppeling is niet opgeslagen. Probeer het later nog eens.',
  server_error: 'Er ging iets mis aan onze kant.',
  not_found: 'Deze pagina bestaat niet.',
}

const STATUS: Partial<Record<FailureCode, number>> = {
  unauthorized: 401,
  not_found: 404,
  server_error: 500,
}

export function createRouter(deps: RouterDeps) {
  const fetchImpl = deps.fetch ?? globalThis.fetch
  const now = deps.now ?? (() => new Date())
  const scopes = deps.scopes ?? SCOPES

  /** Terug naar de app, of een kale pagina als er geen app-adres is. */
  function back(params: Record<string, string>, fallback: string, status: number): RouteResponse {
    if (!deps.appBaseUrl) {
      return { status, headers: TEXT, body: fallback }
    }
    const url = new URL('/app/bronnen', deps.appBaseUrl)
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
    return { status: 302, headers: { Location: url.toString() }, body: '' }
  }

  function fail(code: FailureCode): RouteResponse {
    return back({ connect: 'microsoft', error: code }, HUMAN[code], STATUS[code] ?? 400)
  }

  function done(): RouteResponse {
    return back({ connect: 'microsoft', status: 'ok' }, 'Gelukt. Je Microsoft-account is gekoppeld.', 200)
  }

  /** Haalt de gebruiker uit de Authorization-header. Null als die niet klopt. */
  async function userFrom(headers: Headers) {
    const token = bearerFrom(headers)
    if (!token) return null
    return deps.verifyUser(token)
  }

  async function start(headers: Headers, query: URLSearchParams): Promise<RouteResponse> {
    const user = await userFrom(headers)
    if (!user) return fail('unauthorized')

    const pkce = createPkcePair()
    const pending = await deps.stateStore.start({
      userId: user.id,
      source: 'microsoft',
      codeVerifier: pkce.verifier,
      redirectTo: query.get('redirect_to'),
    })

    const url = buildAuthorizationUrl(
      {
        state: pending.state,
        codeChallenge: pkce.challenge,
        scopes,
        loginHint: user.email ?? undefined,
      },
      deps.microsoft,
    )

    return { status: 302, headers: { Location: url }, body: '' }
  }

  async function callback(headers: Headers, query: URLSearchParams): Promise<RouteResponse> {
    /* Microsoft zet zijn eigen fout in de querystring als de gebruiker weigert. */
    if (query.get('error')) return fail('denied')

    const state = query.get('state')
    const code = query.get('code')
    if (!state || !code) return fail('state_missing')

    let pending
    try {
      pending = await deps.stateStore.consume(state)
    } catch (error) {
      if (error instanceof InvalidStateError) {
        return fail(error.reason === 'expired' ? 'state_expired' : 'state_invalid')
      }
      throw error
    }

    /* Zit er toch een sessie op dit verzoek, dan moet die bij dezelfde
       gebruiker horen. Zo niet, dan probeert iemand een koppeling aan een
       ander account te hangen. */
    const user = await userFrom(headers)
    if (user && user.id !== pending.userId) return fail('unauthorized')

    const exchanged = await exchangeCode(
      { code, codeVerifier: pending.codeVerifier, scopes },
      deps.microsoft,
      { fetch: fetchImpl, now },
    )
    if (!exchanged.ok) return fail('exchange_failed')

    /* Een aanroep van /me doet twee dingen: hij bewijst dat het token werkt en
       hij levert het account-id waar de koppeling aan hangt. */
    let externalAccountId: string | null = null
    try {
      const me = await fetchImpl('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${exchanged.tokens.accessToken}`, Accept: 'application/json' },
      })
      if (!me.ok) return fail('profile_failed')
      const body = (await me.json()) as { id?: string }
      externalAccountId = body?.id ?? null
    } catch {
      return fail('profile_failed')
    }

    try {
      await deps.connections.save({
        userId: pending.userId,
        source: 'microsoft',
        accessToken: exchanged.tokens.accessToken,
        refreshToken: exchanged.tokens.refreshToken,
        tokenExpiresAt: exchanged.tokens.expiresAt,
        scopes: exchanged.tokens.scopes.length > 0 ? exchanged.tokens.scopes : scopes,
        externalAccountId,
        status: 'active',
      })
    } catch {
      return fail('save_failed')
    }

    return done()
  }

  return async function handle(method: string, rawUrl: string, headers: Headers = {}): Promise<RouteResponse> {
    const url = new URL(rawUrl, 'http://server.local')

    if (method !== 'GET') return { status: 405, headers: TEXT, body: 'Alleen GET.' }

    try {
      if (url.pathname === '/health') {
        return { status: 200, headers: JSON_TYPE, body: JSON.stringify({ ok: true, at: now().toISOString() }) }
      }
      if (url.pathname === '/auth/microsoft/start') return await start(headers, url.searchParams)
      if (url.pathname === '/auth/microsoft/callback') return await callback(headers, url.searchParams)
      return fail('not_found')
    } catch {
      /* Wat hier omhoog komt hoort de gebruiker niet te zien. Geen stack trace,
         geen melding uit de database, alleen een code. */
      return fail('server_error')
    }
  }
}

export type Router = ReturnType<typeof createRouter>
