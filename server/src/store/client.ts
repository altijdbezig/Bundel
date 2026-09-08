/**
 * De Supabase-client van de server, op een plek.
 *
 * LET OP: dit is samen met `connections.ts` en `oauth-state.ts` de enige kant
 * van de codebase die de service role key gebruikt. Die sleutel gaat langs RLS
 * heen en mag daarom nooit in `web/` terechtkomen, nooit in een log en nooit
 * in een foutmelding. Zie `server/.env.example`.
 *
 * Waarom geen `@supabase/supabase-js`: `server/` heeft met opzet geen
 * afhankelijkheden, want dan draait node de TypeScript zelf en hoeft de CI
 * niets te installeren. Wat we nodig hebben is een handvol PostgREST-aanroepen,
 * en dat is met `fetch` net zo kort als met een client erbovenop.
 *
 * PostgREST in het kort:
 *   - selecteren is een GET met filters in de querystring: `?user_id=eq.<id>`
 *   - invoegen is een POST, bijwerken een PATCH
 *   - `Prefer: return=representation` geeft de rij terug
 *   - `Prefer: resolution=merge-duplicates` maakt van een POST een upsert,
 *     wat we gebruiken voor de unieke index op (user_id, source)
 */

export const SUPABASE_ENV = {
  url: 'SUPABASE_URL',
  serviceRoleKey: 'SUPABASE_SERVICE_ROLE_KEY',
} as const

type Env = Record<string, string | undefined>
type Fetch = typeof globalThis.fetch

export interface SupabaseConfig {
  readonly url: string
  readonly serviceRoleKey: string
}

export interface DbClient {
  select<T>(table: string, query: Record<string, string>): Promise<T[]>
  insert<T>(table: string, rows: Record<string, unknown>[], options?: WriteOptions): Promise<T[]>
  update<T>(table: string, query: Record<string, string>, patch: Record<string, unknown>): Promise<T[]>
  remove(table: string, query: Record<string, string>): Promise<void>
}

export interface WriteOptions {
  /** Op welke kolommen een botsing een bijwerking wordt in plaats van een fout. */
  readonly onConflict?: string
}

export interface DbClientOptions {
  readonly config?: SupabaseConfig
  readonly env?: Env
  readonly fetch?: Fetch
}

/**
 * Een fout uit de database. De boodschap bevat de status en de melding van
 * PostgREST, nooit een sleutel en nooit iets uit een tokenkolom.
 */
export class DbError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(`Bundel: database gaf ${status} terug (${message})`)
    this.name = 'DbError'
    this.status = status
  }
}

/** Leest de twee variabelen uit de omgeving. Gooit als er een ontbreekt. */
export function readSupabaseConfig(env: Env = process.env): SupabaseConfig {
  const missing = Object.values(SUPABASE_ENV).filter((name) => !env[name])
  if (missing.length > 0) {
    throw new Error(`Bundel: ${missing.join(', ')} ontbreekt`)
  }
  return {
    url: (env[SUPABASE_ENV.url] as string).replace(/\/+$/, ''),
    serviceRoleKey: env[SUPABASE_ENV.serviceRoleKey] as string,
  }
}

function buildUrl(config: SupabaseConfig, table: string, query: Record<string, string>): string {
  const url = new URL(`${config.url}/rest/v1/${table}`)
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value)
  return url.toString()
}

/** Haalt een leesbare reden uit het antwoord, zonder de hele body door te geven. */
async function reasonFor(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; code?: string }
    return body?.message ?? body?.code ?? response.statusText
  } catch {
    return response.statusText || 'geen uitleg'
  }
}

export function createDbClient(options: DbClientOptions = {}): DbClient {
  const config = options.config ?? readSupabaseConfig(options.env ?? process.env)
  const fetchImpl = options.fetch ?? globalThis.fetch

  /* De sleutel gaat mee in twee headers, zoals PostgREST het verwacht. Deze
     headers worden per aanroep opgebouwd en nergens bewaard of gelogd. */
  const headers = (extra: Record<string, string> = {}): Record<string, string> => ({
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    Accept: 'application/json',
    ...extra,
  })

  async function send<T>(url: string, init: RequestInit): Promise<T[]> {
    let response: Response
    try {
      response = await fetchImpl(url, init)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'onbekende fout'
      throw new DbError(0, `niet bereikbaar: ${message}`)
    }

    if (!response.ok) throw new DbError(response.status, await reasonFor(response))
    if (response.status === 204) return []

    try {
      const body = await response.json()
      return (Array.isArray(body) ? body : [body]) as T[]
    } catch {
      return []
    }
  }

  return {
    select<T>(table: string, query: Record<string, string>): Promise<T[]> {
      return send<T>(buildUrl(config, table, query), { method: 'GET', headers: headers() })
    },

    insert<T>(table: string, rows: Record<string, unknown>[], write: WriteOptions = {}): Promise<T[]> {
      const query: Record<string, string> = {}
      const prefer = ['return=representation']
      if (write.onConflict) {
        query.on_conflict = write.onConflict
        prefer.push('resolution=merge-duplicates')
      }
      return send<T>(buildUrl(config, table, query), {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json', Prefer: prefer.join(',') }),
        body: JSON.stringify(rows),
      })
    },

    update<T>(table: string, query: Record<string, string>, patch: Record<string, unknown>): Promise<T[]> {
      return send<T>(buildUrl(config, table, query), {
        method: 'PATCH',
        headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
        body: JSON.stringify(patch),
      })
    },

    async remove(table: string, query: Record<string, string>): Promise<void> {
      await send(buildUrl(config, table, query), { method: 'DELETE', headers: headers() })
    },
  }
}
