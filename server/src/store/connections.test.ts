import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { test } from 'node:test'
import { decryptToken, KEY_ENV } from '../crypto/tokens.ts'
import { createDbClient, DbError, readSupabaseConfig } from './client.ts'
import { createConnectionStore, TABLE } from './connections.ts'

const env = { [KEY_ENV]: randomBytes(32).toString('base64') }

/** Een nep-database die onthoudt wat er langskwam, zonder netwerk. */
function mockDb(rows: Record<string, unknown>[] = []) {
  const calls: { op: string; table: string; query: Record<string, string>; payload?: unknown }[] = []

  const db = {
    async select<T>(table: string, query: Record<string, string>): Promise<T[]> {
      calls.push({ op: 'select', table, query })
      return rows as T[]
    },
    async insert<T>(table: string, payload: Record<string, unknown>[], options?: { onConflict?: string }): Promise<T[]> {
      calls.push({ op: 'insert', table, query: options?.onConflict ? { on_conflict: options.onConflict } : {}, payload })
      /* Doet wat PostgREST doet bij een upsert: geeft de rij terug. */
      return [{ id: 'row-1', ...payload[0] }] as T[]
    },
    async update<T>(table: string, query: Record<string, string>, patch: Record<string, unknown>): Promise<T[]> {
      calls.push({ op: 'update', table, query, payload: patch })
      return [] as T[]
    },
    async remove(table: string, query: Record<string, string>): Promise<void> {
      calls.push({ op: 'remove', table, query })
    },
  }

  return { db, calls }
}

const expiresAt = new Date('2026-09-08T12:00:00.000Z')

// ---------------------------------------------------------------- opslaan

test('opslaan versleutelt de tokens voordat ze de database in gaan', async () => {
  const { db, calls } = mockDb()
  const store = createConnectionStore({ db, env })

  await store.save({
    userId: 'gebruiker-1',
    source: 'microsoft',
    accessToken: 'toegang-in-platte-tekst',
    refreshToken: 'ververs-in-platte-tekst',
    tokenExpiresAt: expiresAt,
    scopes: ['openid', 'User.Read'],
  })

  const insert = calls.find((call) => call.op === 'insert')
  assert.ok(insert, 'er moet een insert zijn geweest')
  const row = (insert.payload as Record<string, unknown>[])[0]

  assert.notEqual(row.access_token_encrypted, 'toegang-in-platte-tekst')
  assert.notEqual(row.refresh_token_encrypted, 'ververs-in-platte-tekst')
  assert.match(String(row.access_token_encrypted), /^v1\./)
  assert.equal(decryptToken(String(row.access_token_encrypted), env), 'toegang-in-platte-tekst')
  assert.equal(decryptToken(String(row.refresh_token_encrypted), env), 'ververs-in-platte-tekst')
})

test('opnieuw koppelen werkt de bestaande rij bij in plaats van een tweede te maken', async () => {
  const { db, calls } = mockDb()
  const store = createConnectionStore({ db, env })

  await store.save({
    userId: 'gebruiker-1',
    source: 'microsoft',
    accessToken: 'toegang',
    refreshToken: null,
    tokenExpiresAt: expiresAt,
    scopes: [],
  })

  const insert = calls.find((call) => call.op === 'insert')
  /* De unieke index staat op (user_id, source), dus daar botst hij op en
     daar hoort de upsert dus ook op te mikken. */
  assert.equal(insert?.query.on_conflict, 'user_id,source')
  assert.equal(insert?.table, TABLE)
})

test('zonder refresh token blijft die kolom leeg in plaats van versleuteld leeg', async () => {
  const { db, calls } = mockDb()
  const store = createConnectionStore({ db, env })

  await store.save({
    userId: 'gebruiker-1',
    source: 'microsoft',
    accessToken: 'toegang',
    refreshToken: null,
    tokenExpiresAt: expiresAt,
    scopes: [],
  })

  const row = (calls.find((c) => c.op === 'insert')?.payload as Record<string, unknown>[])[0]
  assert.equal(row.refresh_token_encrypted, null)
})

// ---------------------------------------------------------------- lezen

test('lezen ontsleutelt de tokens weer', async () => {
  const { db: writer, calls } = mockDb()
  const store = createConnectionStore({ db: writer, env })
  await store.save({
    userId: 'gebruiker-1',
    source: 'microsoft',
    accessToken: 'toegang-1',
    refreshToken: 'ververs-1',
    tokenExpiresAt: expiresAt,
    scopes: ['openid'],
  })
  const stored = (calls.find((c) => c.op === 'insert')?.payload as Record<string, unknown>[])[0]

  const { db: reader } = mockDb([
    {
      id: 'row-1',
      user_id: 'gebruiker-1',
      source: 'microsoft',
      external_account_id: 'ms-42',
      status: 'active',
      scopes: ['openid'],
      connected_at: '2026-09-08T10:00:00.000Z',
      last_synced_at: null,
      last_error: null,
      access_token_encrypted: stored.access_token_encrypted,
      refresh_token_encrypted: stored.refresh_token_encrypted,
      token_expires_at: expiresAt.toISOString(),
    },
  ])

  const connection = await createConnectionStore({ db: reader, env }).read('gebruiker-1', 'microsoft')

  assert.ok(connection)
  assert.equal(connection.accessToken, 'toegang-1')
  assert.equal(connection.refreshToken, 'ververs-1')
  assert.equal(connection.userId, 'gebruiker-1')
  assert.equal(connection.tokenExpiresAt?.toISOString(), expiresAt.toISOString())
})

test('een rij zonder token levert niets op', async () => {
  const { db } = mockDb([
    {
      id: 'row-1',
      user_id: 'gebruiker-1',
      source: 'microsoft',
      external_account_id: null,
      status: 'revoked',
      scopes: [],
      connected_at: '2026-09-08T10:00:00.000Z',
      last_synced_at: null,
      last_error: 'ingetrokken',
      access_token_encrypted: null,
      refresh_token_encrypted: null,
      token_expires_at: null,
    },
  ])

  assert.equal(await createConnectionStore({ db, env }).read('gebruiker-1', 'microsoft'), null)
})

test('geen rij is geen fout', async () => {
  const { db } = mockDb([])
  const store = createConnectionStore({ db, env })
  assert.equal(await store.read('onbekend', 'microsoft'), null)
  assert.equal(await store.find('onbekend', 'microsoft'), null)
})

test('lezen filtert op gebruiker en bron', async () => {
  const { db, calls } = mockDb([])
  await createConnectionStore({ db, env }).read('gebruiker-9', 'canvas')

  const select = calls.find((call) => call.op === 'select')
  assert.equal(select?.query.user_id, 'eq.gebruiker-9')
  assert.equal(select?.query.source, 'eq.canvas')
})

// ---------------------------------------------------------------- status

test('status zetten raakt de tokenkolommen niet aan', async () => {
  const { db, calls } = mockDb()
  await createConnectionStore({ db, env }).setStatus('gebruiker-1', 'microsoft', 'revoked', 'ingetrokken')

  const update = calls.find((call) => call.op === 'update')
  const patch = update?.payload as Record<string, unknown>
  assert.equal(patch.status, 'revoked')
  assert.equal(patch.last_error, 'ingetrokken')
  assert.equal('access_token_encrypted' in patch, false)
  assert.equal('refresh_token_encrypted' in patch, false)
})

// ---------------------------------------------------------------- TokenStore

test('de TokenStore schrijft wat de connector aanlevert naar de juiste rij', async () => {
  const { db, calls } = mockDb()
  const store = createConnectionStore({ db, env })

  await store.tokenStore('gebruiker-1', 'microsoft').save({
    accessTokenEncrypted: 'v1.al.versleuteld.door-de-connector',
    refreshTokenEncrypted: null,
    tokenExpiresAt: expiresAt,
    scopes: ['openid'],
    status: 'active',
  })

  const update = calls.find((call) => call.op === 'update')
  assert.equal(update?.query.user_id, 'eq.gebruiker-1')
  assert.equal(update?.query.source, 'eq.microsoft')
  const patch = update?.payload as Record<string, unknown>
  assert.equal(patch.access_token_encrypted, 'v1.al.versleuteld.door-de-connector')
  assert.equal(patch.status, 'active')
  assert.equal(patch.last_error, null)
})

test('de TokenStore kan ook alleen een status zetten', async () => {
  const { db, calls } = mockDb()
  await createConnectionStore({ db, env }).tokenStore('gebruiker-1', 'microsoft').setStatus('expired', 'verlopen')

  const patch = calls.find((call) => call.op === 'update')?.payload as Record<string, unknown>
  assert.equal(patch.status, 'expired')
  assert.equal(patch.last_error, 'verlopen')
})

// ---------------------------------------------------------------- de client

test('de client bouwt een PostgREST-verzoek met beide sleutelheaders', async () => {
  const seen: { url: string; init: RequestInit }[] = []
  const fetchImpl = (async (url: unknown, init: RequestInit = {}) => {
    seen.push({ url: String(url), init })
    return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } })
  }) as unknown as typeof globalThis.fetch

  const db = createDbClient({
    config: { url: 'https://project.supabase.co', serviceRoleKey: 'service-role-geheim' },
    fetch: fetchImpl,
  })

  await db.select('connections', { user_id: 'eq.gebruiker-1' })

  assert.equal(seen[0].url, 'https://project.supabase.co/rest/v1/connections?user_id=eq.gebruiker-1')
  const headers = seen[0].init.headers as Record<string, string>
  assert.equal(headers.apikey, 'service-role-geheim')
  assert.equal(headers.Authorization, 'Bearer service-role-geheim')
})

test('een upsert vraagt om merge-duplicates', async () => {
  const seen: RequestInit[] = []
  const fetchImpl = (async (_url: unknown, init: RequestInit = {}) => {
    seen.push(init)
    return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } })
  }) as unknown as typeof globalThis.fetch

  const db = createDbClient({
    config: { url: 'https://project.supabase.co', serviceRoleKey: 'k' },
    fetch: fetchImpl,
  })
  await db.insert('connections', [{ user_id: 'u' }], { onConflict: 'user_id,source' })

  const prefer = (seen[0].headers as Record<string, string>).Prefer
  assert.match(prefer, /resolution=merge-duplicates/)
  assert.match(prefer, /return=representation/)
})

test('een fout uit de database verklapt geen sleutel', async () => {
  const fetchImpl = (async () =>
    new Response(JSON.stringify({ message: 'permission denied for table connections' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })) as unknown as typeof globalThis.fetch

  const db = createDbClient({
    config: { url: 'https://project.supabase.co', serviceRoleKey: 'service-role-geheim' },
    fetch: fetchImpl,
  })

  await assert.rejects(
    () => db.select('connections', {}),
    (error: unknown) => {
      assert.ok(error instanceof DbError)
      assert.equal(error.status, 403)
      assert.match(error.message, /permission denied/)
      assert.equal(error.message.includes('service-role-geheim'), false)
      return true
    },
  )
})

test('zonder omgevingsvariabelen komt er geen client', () => {
  assert.throws(() => readSupabaseConfig({}), /SUPABASE_URL/)
  assert.throws(() => readSupabaseConfig({ SUPABASE_URL: 'https://x.supabase.co' }), /SERVICE_ROLE/)
})

test('een schuine streep te veel achter de URL wordt weggehaald', () => {
  const config = readSupabaseConfig({ SUPABASE_URL: 'https://x.supabase.co/', SUPABASE_SERVICE_ROLE_KEY: 'k' })
  assert.equal(config.url, 'https://x.supabase.co')
})
