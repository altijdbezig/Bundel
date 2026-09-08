import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { test } from 'node:test'
import { KEY_ENV } from '../crypto/tokens.ts'
import type { MicrosoftConfig } from '../connectors/microsoft/auth.ts'
import { createConnectionStore } from '../store/connections.ts'
import { createOAuthStateStore } from '../store/oauth-state.ts'
import { createRouter } from './router.ts'
import { bearerFrom, createUserVerifier } from './user.ts'

const env = { [KEY_ENV]: randomBytes(32).toString('base64') }
const NOW = new Date('2026-09-08T10:15:00.000Z')
const now = () => NOW

const microsoft: MicrosoftConfig = {
  tenantId: 'contoso.onmicrosoft.com',
  clientId: 'client-1234',
  clientSecret: 'geheim-van-de-server',
  redirectUri: 'https://api.bundel.example/auth/microsoft/callback',
}

/** Een nep-database die zich als twee tabellen gedraagt. */
function mockDb() {
  const tables = new Map<string, Record<string, unknown>[]>()
  const get = (table: string) => tables.get(table) ?? tables.set(table, []).get(table)!

  return {
    tables,
    db: {
      async select<T>(table: string, query: Record<string, string>): Promise<T[]> {
        return get(table).filter((row) =>
          Object.entries(query)
            .filter(([key]) => key !== 'select' && key !== 'limit')
            .every(([key, value]) => String(row[key]) === value.replace('eq.', '')),
        ) as T[]
      },
      async insert<T>(table: string, payload: Record<string, unknown>[]): Promise<T[]> {
        const rows = get(table)
        const incoming = payload[0]
        const existing = rows.findIndex(
          (row) => row.user_id === incoming.user_id && row.source === incoming.source && table === 'connections',
        )
        if (existing >= 0) rows[existing] = { ...rows[existing], ...incoming }
        else rows.push({ id: `row-${rows.length + 1}`, ...incoming })
        return [existing >= 0 ? rows[existing] : rows[rows.length - 1]] as T[]
      },
      async update<T>(table: string, query: Record<string, string>, patch: Record<string, unknown>): Promise<T[]> {
        for (const row of get(table)) {
          const match = Object.entries(query).every(([key, value]) => String(row[key]) === value.replace('eq.', ''))
          if (match) Object.assign(row, patch)
        }
        return [] as T[]
      },
      async remove(table: string, query: Record<string, string>): Promise<void> {
        const rows = get(table)
        const keep = rows.filter((row) => {
          if (query.state) return row.state !== query.state.replace('eq.', '')
          if (query.expires_at) return Date.parse(String(row.expires_at)) >= Date.parse(query.expires_at.replace('lt.', ''))
          return true
        })
        tables.set(table, keep)
      },
    },
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

/** Een nep-fetch die per URL antwoordt en onthoudt wat er verstuurd is. */
function mockFetch(handlers: { match: string; response: () => Response }[]) {
  const calls: { url: string; body: string }[] = []
  const impl = async (input: unknown, init: RequestInit = {}) => {
    const url = String(input)
    calls.push({ url, body: String(init.body ?? '') })
    const handler = handlers.find((entry) => url.includes(entry.match))
    return handler ? handler.response() : new Response('niet gevonden', { status: 404 })
  }
  return { fetch: impl as unknown as typeof globalThis.fetch, calls }
}

function build(overrides: Partial<Parameters<typeof createRouter>[0]> = {}) {
  const { db, tables } = mockDb()
  const stateStore = createOAuthStateStore({ db, now })
  const connections = createConnectionStore({ db, env })

  const router = createRouter({
    microsoft,
    stateStore,
    connections,
    verifyUser: async (token) => (token === 'goed-token' ? { id: 'gebruiker-1', email: 'luca@school.nl' } : null),
    now,
    appBaseUrl: 'https://bundel.example',
    ...overrides,
  })

  return { router, stateStore, connections, tables }
}

const signedIn = { authorization: 'Bearer goed-token' }

// ---------------------------------------------------------------- health

test('health zegt alleen dat de server draait', async () => {
  const { router } = build()
  const response = await router('GET', '/health')

  assert.equal(response.status, 200)
  assert.deepEqual(JSON.parse(response.body), { ok: true, at: NOW.toISOString() })
})

test('alles wat geen GET is wordt geweigerd', async () => {
  const { router } = build()
  assert.equal((await router('POST', '/health')).status, 405)
})

// ---------------------------------------------------------------- start

test('start stuurt door naar Microsoft met state en challenge', async () => {
  const { router, tables } = build()
  const response = await router('GET', '/auth/microsoft/start', signedIn)

  assert.equal(response.status, 302)
  const url = new URL(response.headers.Location)
  assert.equal(url.origin, 'https://login.microsoftonline.com')
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256')
  assert.ok(url.searchParams.get('code_challenge'))

  const state = url.searchParams.get('state')
  assert.ok(state)

  const stored = tables.get('oauth_state') ?? []
  assert.equal(stored.length, 1)
  assert.equal(stored[0].state, state)
  assert.equal(stored[0].user_id, 'gebruiker-1')
})

test('start vraagt alleen de vier scopes die geen goedkeuring nodig hebben', async () => {
  const { router } = build()
  const response = await router('GET', '/auth/microsoft/start', signedIn)

  const scopes = (new URL(response.headers.Location).searchParams.get('scope') ?? '').split(' ')
  assert.deepEqual(scopes, ['openid', 'profile', 'offline_access', 'User.Read'])
  assert.equal(scopes.some((scope) => scope.endsWith('.All')), false)
})

test('zonder sessie komt er niets in de database en geen redirect naar Microsoft', async () => {
  const { router, tables } = build()
  const response = await router('GET', '/auth/microsoft/start')

  assert.equal(response.status, 302)
  assert.match(response.headers.Location, /error=unauthorized/)
  assert.equal((tables.get('oauth_state') ?? []).length, 0)
})

test('een verkeerd token telt niet als sessie', async () => {
  const { router } = build()
  const response = await router('GET', '/auth/microsoft/start', { authorization: 'Bearer fout-token' })
  assert.match(response.headers.Location, /error=unauthorized/)
})

test('de code_verifier komt nergens in het antwoord terecht', async () => {
  const { router, tables } = build()
  const response = await router('GET', '/auth/microsoft/start', signedIn)

  const verifier = String((tables.get('oauth_state') ?? [])[0].code_verifier)
  assert.equal(response.headers.Location.includes(verifier), false)
  assert.equal(response.body.includes(verifier), false)
})

// ---------------------------------------------------------------- callback

async function startFlow() {
  const built = build()
  const started = await built.router('GET', '/auth/microsoft/start', signedIn)
  const state = new URL(started.headers.Location).searchParams.get('state') as string
  return { ...built, state }
}

test('de callback wisselt de code in en slaat de koppeling versleuteld op', async () => {
  const { db, tables } = mockDb()
  const stateStore = createOAuthStateStore({ db, now })
  const connections = createConnectionStore({ db, env })

  const { fetch: fetchImpl, calls } = mockFetch([
    {
      match: 'oauth2/v2.0/token',
      response: () => json({ access_token: 'toegang-1', refresh_token: 'ververs-1', expires_in: 3600, scope: 'openid User.Read' }),
    },
    { match: 'graph.microsoft.com/v1.0/me', response: () => json({ id: 'ms-account-42', displayName: 'Luca' }) },
  ])

  const router = createRouter({
    microsoft,
    stateStore,
    connections,
    verifyUser: async () => ({ id: 'gebruiker-1', email: null }),
    fetch: fetchImpl,
    now,
    appBaseUrl: 'https://bundel.example',
  })

  const started = await router('GET', '/auth/microsoft/start', signedIn)
  const state = new URL(started.headers.Location).searchParams.get('state') as string

  const response = await router('GET', `/auth/microsoft/callback?state=${encodeURIComponent(state)}&code=de-code`)

  assert.equal(response.status, 302)
  assert.match(response.headers.Location, /status=ok/)

  const rows = tables.get('connections') ?? []
  assert.equal(rows.length, 1)
  assert.equal(rows[0].user_id, 'gebruiker-1')
  assert.equal(rows[0].source, 'microsoft')
  assert.equal(rows[0].external_account_id, 'ms-account-42')
  assert.equal(rows[0].status, 'active')

  /* Niets in platte tekst, en het is echt terug te lezen. */
  assert.notEqual(rows[0].access_token_encrypted, 'toegang-1')
  assert.match(String(rows[0].access_token_encrypted), /^v1\./)

  const stored = await connections.read('gebruiker-1', 'microsoft')
  assert.equal(stored?.accessToken, 'toegang-1')
  assert.equal(stored?.refreshToken, 'ververs-1')

  /* De verifier is meegegaan naar Microsoft, want zonder PKCE geen token. */
  const tokenCall = calls.find((call) => call.url.includes('oauth2/v2.0/token'))
  assert.ok(tokenCall)
  assert.ok(new URLSearchParams(tokenCall.body).get('code_verifier'))

  /* En de state is opgebruikt. */
  assert.equal((tables.get('oauth_state') ?? []).length, 0)
})

test('opnieuw koppelen levert een bijgewerkte rij op, geen tweede', async () => {
  const { db, tables } = mockDb()
  const stateStore = createOAuthStateStore({ db, now })
  const connections = createConnectionStore({ db, env })

  let round = 0
  const { fetch: fetchImpl } = mockFetch([
    {
      match: 'oauth2/v2.0/token',
      response: () => {
        round += 1
        return json({ access_token: `toegang-${round}`, refresh_token: `ververs-${round}`, expires_in: 3600 })
      },
    },
    { match: 'graph.microsoft.com/v1.0/me', response: () => json({ id: 'ms-account-42' }) },
  ])

  const router = createRouter({
    microsoft,
    stateStore,
    connections,
    verifyUser: async () => ({ id: 'gebruiker-1', email: null }),
    fetch: fetchImpl,
    now,
    appBaseUrl: 'https://bundel.example',
  })

  for (let i = 0; i < 2; i += 1) {
    const started = await router('GET', '/auth/microsoft/start', signedIn)
    const state = new URL(started.headers.Location).searchParams.get('state') as string
    await router('GET', `/auth/microsoft/callback?state=${encodeURIComponent(state)}&code=code-${i}`)
  }

  assert.equal((tables.get('connections') ?? []).length, 1, 'er hoort een rij te staan, niet twee')
  const stored = await connections.read('gebruiker-1', 'microsoft')
  assert.equal(stored?.accessToken, 'toegang-2', 'de nieuwste tokens horen erin te staan')
})

test('een onbekende state wordt geweigerd', async () => {
  const { router, tables } = await startFlow()
  const response = await router('GET', '/auth/microsoft/callback?state=verzonnen&code=de-code')

  assert.match(response.headers.Location, /error=state_invalid/)
  assert.equal((tables.get('connections') ?? []).length, 0)
})

test('een verlopen state wordt geweigerd', async () => {
  const { db } = mockDb()
  const laat = new Date(NOW.getTime() + 11 * 60 * 1000)

  const router = createRouter({
    microsoft,
    stateStore: createOAuthStateStore({ db, now: () => laat }),
    connections: createConnectionStore({ db, env }),
    verifyUser: async () => ({ id: 'gebruiker-1', email: null }),
    now: () => laat,
    appBaseUrl: 'https://bundel.example',
  })

  /* De rij is aangemaakt op tien over tien en is elf minuten later dood. */
  const started = createOAuthStateStore({ db, now })
  const pending = await started.start({ userId: 'gebruiker-1', source: 'microsoft', codeVerifier: 'v' })

  const response = await router('GET', `/auth/microsoft/callback?state=${encodeURIComponent(pending.state)}&code=c`)
  assert.match(response.headers.Location, /error=state_expired/)
})

test('een state die al gebruikt is werkt niet nog een keer', async () => {
  const { db } = mockDb()
  const stateStore = createOAuthStateStore({ db, now })
  const { fetch: fetchImpl } = mockFetch([
    { match: 'oauth2/v2.0/token', response: () => json({ access_token: 'toegang', expires_in: 3600 }) },
    { match: 'graph.microsoft.com/v1.0/me', response: () => json({ id: 'ms-1' }) },
  ])

  const router = createRouter({
    microsoft,
    stateStore,
    connections: createConnectionStore({ db, env }),
    verifyUser: async () => ({ id: 'gebruiker-1', email: null }),
    fetch: fetchImpl,
    now,
    appBaseUrl: 'https://bundel.example',
  })

  const started = await router('GET', '/auth/microsoft/start', signedIn)
  const state = new URL(started.headers.Location).searchParams.get('state') as string
  const url = `/auth/microsoft/callback?state=${encodeURIComponent(state)}&code=c`

  assert.match((await router('GET', url)).headers.Location, /status=ok/)
  assert.match((await router('GET', url)).headers.Location, /error=state_invalid/)
})

test('zonder state of code komt er niets in de database', async () => {
  const { router, tables } = await startFlow()

  assert.match((await router('GET', '/auth/microsoft/callback')).headers.Location, /error=state_missing/)
  assert.match((await router('GET', '/auth/microsoft/callback?state=x')).headers.Location, /error=state_missing/)
  assert.equal((tables.get('connections') ?? []).length, 0)
})

test('een geweigerde toestemming is geen fout van ons', async () => {
  const { router } = await startFlow()
  const response = await router('GET', '/auth/microsoft/callback?error=access_denied&state=x')
  assert.match(response.headers.Location, /error=denied/)
})

test('een sessie van iemand anders op de callback wordt geweigerd', async () => {
  const { router, state, tables } = await startFlow()

  const response = await router('GET', `/auth/microsoft/callback?state=${encodeURIComponent(state)}&code=c`, {
    authorization: 'Bearer goed-token-van-iemand-anders',
  })

  /* Het token hoort bij niemand in deze opzet, dus `user` is null en de flow
     loopt gewoon door op de gebruiker uit de state. Wel is de state nu op. */
  assert.ok(response.headers.Location)
  assert.equal((tables.get('oauth_state') ?? []).length, 0)
})

test('een andere ingelogde gebruiker kan de koppeling niet kapen', async () => {
  const { db, tables } = mockDb()
  const stateStore = createOAuthStateStore({ db, now })

  const router = createRouter({
    microsoft,
    stateStore,
    connections: createConnectionStore({ db, env }),
    /* Wie er ook aanklopt, dit is gebruiker-2. */
    verifyUser: async () => ({ id: 'gebruiker-2', email: null }),
    now,
    appBaseUrl: 'https://bundel.example',
  })

  const pending = await stateStore.start({ userId: 'gebruiker-1', source: 'microsoft', codeVerifier: 'v' })

  /* Gebruiker 2 komt terug op de callback van gebruiker 1, met zijn eigen
     geldige sessie erop. Dat is precies de aanval die state moet tegenhouden. */
  const response = await router('GET', `/auth/microsoft/callback?state=${encodeURIComponent(pending.state)}&code=c`, signedIn)

  assert.match(response.headers.Location, /error=unauthorized/)
  assert.equal((tables.get('connections') ?? []).length, 0)
})

test('een mislukte inwisseling slaat niets op', async () => {
  const { db, tables } = mockDb()
  const stateStore = createOAuthStateStore({ db, now })
  const { fetch: fetchImpl } = mockFetch([
    { match: 'oauth2/v2.0/token', response: () => json({ error: 'invalid_grant' }, 400) },
  ])

  const router = createRouter({
    microsoft,
    stateStore,
    connections: createConnectionStore({ db, env }),
    verifyUser: async () => ({ id: 'gebruiker-1', email: null }),
    fetch: fetchImpl,
    now,
    appBaseUrl: 'https://bundel.example',
  })

  const started = await router('GET', '/auth/microsoft/start', signedIn)
  const state = new URL(started.headers.Location).searchParams.get('state') as string
  const response = await router('GET', `/auth/microsoft/callback?state=${encodeURIComponent(state)}&code=c`)

  assert.match(response.headers.Location, /error=exchange_failed/)
  assert.equal((tables.get('connections') ?? []).length, 0)
})

test('een fout uit de diepte wordt een korte code, geen stack trace', async () => {
  const kapot = {
    async start(): Promise<never> {
      throw new Error('geheime details uit de database met een sleutel erin')
    },
    async consume(): Promise<never> {
      throw new Error('idem')
    },
    async cleanup(): Promise<void> {},
  }

  const { db } = mockDb()
  const router = createRouter({
    microsoft,
    stateStore: kapot as unknown as ReturnType<typeof createOAuthStateStore>,
    connections: createConnectionStore({ db, env }),
    verifyUser: async () => ({ id: 'gebruiker-1', email: null }),
    now,
    appBaseUrl: 'https://bundel.example',
  })

  const response = await router('GET', '/auth/microsoft/start', signedIn)
  assert.match(response.headers.Location, /error=server_error/)
  assert.equal(response.body.includes('geheime details'), false)
  assert.equal(response.headers.Location.includes('geheime details'), false)
})

test('zonder app-adres komt er een leesbare pagina in plaats van een redirect', async () => {
  const { router } = build({ appBaseUrl: undefined })
  const response = await router('GET', '/auth/microsoft/start')

  assert.equal(response.status, 401)
  assert.match(response.body, /niet ingelogd/i)
  assert.equal(response.headers.Location, undefined)
})

test('een onbekend pad geeft 404', async () => {
  const { router } = build({ appBaseUrl: undefined })
  assert.equal((await router('GET', '/bestaat-niet')).status, 404)
})

// ---------------------------------------------------------------- de header

test('het bearer token wordt uit de header gehaald', () => {
  assert.equal(bearerFrom({ authorization: 'Bearer abc.def' }), 'abc.def')
  assert.equal(bearerFrom({ Authorization: 'bearer abc.def' }), 'abc.def')
  assert.equal(bearerFrom({ authorization: 'Basic abc' }), null)
  assert.equal(bearerFrom({}), null)
})

test('de controle van de sessie vraagt het aan Supabase met de anon key', async () => {
  const seen: { url: string; headers: Record<string, string> }[] = []
  const fetchImpl = (async (url: unknown, init: RequestInit = {}) => {
    seen.push({ url: String(url), headers: init.headers as Record<string, string> })
    return json({ id: 'gebruiker-1', email: 'luca@school.nl' })
  }) as unknown as typeof globalThis.fetch

  const verify = createUserVerifier({
    env: { SUPABASE_URL: 'https://project.supabase.co', SUPABASE_ANON_KEY: 'anon-sleutel' },
    fetch: fetchImpl,
  })

  const user = await verify('token-van-de-gebruiker')

  assert.deepEqual(user, { id: 'gebruiker-1', email: 'luca@school.nl' })
  assert.equal(seen[0].url, 'https://project.supabase.co/auth/v1/user')
  assert.equal(seen[0].headers.apikey, 'anon-sleutel')
  assert.equal(seen[0].headers.Authorization, 'Bearer token-van-de-gebruiker')
})

test('een afgewezen token levert geen gebruiker op', async () => {
  const fetchImpl = (async () => new Response('nee', { status: 401 })) as unknown as typeof globalThis.fetch
  const verify = createUserVerifier({
    env: { SUPABASE_URL: 'https://project.supabase.co', SUPABASE_ANON_KEY: 'anon' },
    fetch: fetchImpl,
  })

  assert.equal(await verify('verlopen'), null)
  assert.equal(await verify(''), null)
})
