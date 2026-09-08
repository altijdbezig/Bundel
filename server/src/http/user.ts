/**
 * Wie klopt er aan.
 *
 * De endpoints hieronder hangen een koppeling aan een gebruiker, dus die
 * gebruiker moet vaststaan. Een `user_id` uit de querystring is waardeloos:
 * die typt iedereen zelf. Wat wel telt is het access token dat Supabase bij
 * het inloggen heeft afgegeven.
 *
 * Controleren doen we door het token aan Supabase zelf voor te leggen. Dat is
 * een netwerkaanroep per keer, maar het is ook het enige dat meteen klopt:
 * een ingetrokken sessie is meteen ongeldig, en er hoeft geen JWT-bibliotheek
 * bij en geen sleutel op de server. De flow loopt twee keer per koppeling, dus
 * die aanroep valt in het niet.
 *
 * De `apikey` die daarbij hoort is de anon key, niet de service role key. Die
 * laatste hoort alleen bij de database en niet bij dit pad.
 *
 * Er wordt hier nergens een token gelogd, ook niet afgekort.
 */

export const USER_ENV = {
  url: 'SUPABASE_URL',
  anonKey: 'SUPABASE_ANON_KEY',
} as const

type Env = Record<string, string | undefined>
type Fetch = typeof globalThis.fetch

export interface AuthenticatedUser {
  readonly id: string
  readonly email: string | null
}

export type VerifyUser = (accessToken: string) => Promise<AuthenticatedUser | null>

export interface VerifierOptions {
  readonly env?: Env
  readonly fetch?: Fetch
}

/** Haalt het bearer token uit de Authorization-header. Geen token is null. */
export function bearerFrom(headers: Record<string, string | string[] | undefined>): string | null {
  const raw = headers.authorization ?? headers.Authorization
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return null

  const match = /^Bearer\s+(.+)$/i.exec(value.trim())
  return match ? match[1].trim() : null
}

/**
 * Vraagt Supabase wie bij dit token hoort. Geeft null terug als het token niet
 * (meer) geldig is. Gooit alleen als Supabase zelf onbereikbaar is, want dat is
 * iets anders dan een ongeldige gebruiker.
 */
export function createUserVerifier(options: VerifierOptions = {}): VerifyUser {
  const env = options.env ?? process.env
  const fetchImpl = options.fetch ?? globalThis.fetch

  const missing = Object.values(USER_ENV).filter((name) => !env[name])
  if (missing.length > 0) throw new Error(`Bundel: ${missing.join(', ')} ontbreekt`)

  const url = `${(env[USER_ENV.url] as string).replace(/\/+$/, '')}/auth/v1/user`
  const anonKey = env[USER_ENV.anonKey] as string

  return async function verifyUser(accessToken: string): Promise<AuthenticatedUser | null> {
    if (!accessToken) return null

    const response = await fetchImpl(url, {
      headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    })

    if (response.status === 401 || response.status === 403) return null
    if (!response.ok) throw new Error(`Bundel: Supabase gaf ${response.status} bij het controleren van de sessie`)

    const body = (await response.json()) as { id?: string; email?: string | null }
    if (!body?.id) return null

    return { id: body.id, email: body.email ?? null }
  }
}
