import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { test } from 'node:test'
import { KEY_ENV, decryptToken } from '../../crypto/tokens.ts'
import type { ConnectionStatus, TokenUpdate } from '../types.ts'
import { REFRESH_SKEW_MS } from './auth.ts'
import type { MicrosoftConfig, TokenSet } from './auth.ts'
import { createGraphClient, decryptTokens, retryAfterMs } from './client.ts'

const config: MicrosoftConfig = {
  tenantId: 'contoso.onmicrosoft.com',
  clientId: 'client-1234',
  clientSecret: 'geheim-van-de-server',
  redirectUri: 'https://bundel.example/api/microsoft/callback',
}

const env = { [KEY_ENV]: randomBytes(32).toString('base64') }

const NOW = new Date('2026-09-08T10:15:00.000Z')
const now = () => NOW

function tokens(overrides: Partial<TokenSet> = {}): TokenSet {
  return {
    accessToken: 'toegang-1',
    refreshToken: 'ververs-1',
    expiresAt: new Date(NOW.getTime() + 60 * 60 * 1000),
    scopes: ['User.Read'],
    ...overrides,
  }
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

interface Call {
  url: string
  authorization: string | undefined
  body: URLSearchParams
}

/** Nep-fetch met een antwoord per beurt. Het laatste antwoord blijft gelden. */
function mockFetch(responses: Response[]) {
  const calls: Call[] = []
  const impl = async (input: unknown, init: RequestInit = {}) => {
    const headers = (init.headers ?? {}) as Record<string, string>
    calls.push({
      url: String(input),
      authorization: headers.Authorization,
      body: new URLSearchParams(typeof init.body === 'string' ? init.body : ''),
    })
    return responses[Math.min(calls.length - 1, responses.length - 1)]
  }
  return { fetch: impl as unknown as typeof globalThis.fetch, calls }
}

/** Een opslag die alleen onthoudt wat hij binnenkreeg. */
function recordingStore() {
  const saved: TokenUpdate[] = []
  const statuses: { status: ConnectionStatus; lastError: string | null }[] = []
  return {
    saved,
    statuses,
    store: {
      async save(update: TokenUpdate) {
        saved.push(update)
      },
      async setStatus(status: ConnectionStatus, lastError: string | null) {
        statuses.push({ status, lastError })
      },
    },
  }
}

/** Een sleep die niet wacht, maar wel onthoudt hoelang er gewacht zou zijn. */
function recordingSleep() {
  const waited: number[] = []
  return { waited, sleep: async (ms: number) => void waited.push(ms) }
}

const graphUrl = 'https://graph.microsoft.com/v1.0/me'
const isTokenCall = (call: Call) => call.url.includes('/oauth2/v2.0/token')

// ---------------------------------------------------------------- gewoon ophalen

test('een geldig token wordt gewoon gebruikt', async () => {
  const { fetch, calls } = mockFetch([json({ id: 'gebruiker-1' })])
  const client = createGraphClient({ config, tokens: tokens(), fetch, now, env, sleep: async () => {} })

  const result = await client.get<{ id: string }>('/me')

  assert.equal(result.ok, true)
  assert.equal(calls.length, 1, 'geen onnodige refresh')
  assert.equal(calls[0].url, graphUrl)
  assert.equal(calls[0].authorization, 'Bearer toegang-1')
})

// ---------------------------------------------------------------- verversen

test('een bijna verlopen token wordt eerst ververst', async () => {
  const { fetch, calls } = mockFetch([
    json({ access_token: 'toegang-2', refresh_token: 'ververs-2', expires_in: 3600 }),
    json({ id: 'gebruiker-1' }),
  ])
  const client = createGraphClient({
    config,
    tokens: tokens({ expiresAt: new Date(NOW.getTime() + REFRESH_SKEW_MS - 1000) }),
    fetch,
    now,
    env,
    sleep: async () => {},
  })

  const result = await client.get('/me')

  assert.equal(result.ok, true)
  assert.equal(calls.length, 2)
  assert.ok(isTokenCall(calls[0]))
  assert.equal(calls[0].body.get('grant_type'), 'refresh_token')
  assert.equal(calls[1].authorization, 'Bearer toegang-2', 'het verzoek gebruikt het nieuwe token')
  assert.equal(client.tokens().accessToken, 'toegang-2')
})

test('wat naar de opslag gaat is versleuteld', async () => {
  const { fetch } = mockFetch([
    json({ access_token: 'toegang-2', refresh_token: 'ververs-2', expires_in: 3600 }),
    json({ id: 'gebruiker-1' }),
  ])
  const { saved, store } = recordingStore()

  const client = createGraphClient({
    config,
    tokens: tokens({ expiresAt: new Date(0) }),
    fetch,
    now,
    env,
    store,
    sleep: async () => {},
  })
  await client.get('/me')

  assert.equal(saved.length, 1)
  const update = saved[0]
  assert.ok(!update.accessTokenEncrypted.includes('toegang-2'), 'het token staat er niet leesbaar in')
  assert.ok(!String(update.refreshTokenEncrypted).includes('ververs-2'))
  assert.equal(decryptToken(update.accessTokenEncrypted, env), 'toegang-2')
  assert.equal(decryptToken(String(update.refreshTokenEncrypted), env), 'ververs-2')
  assert.equal(update.status, 'active')
})

test('zonder nieuw refresh token blijft het oude staan', async () => {
  const { fetch } = mockFetch([json({ access_token: 'toegang-2', expires_in: 3600 }), json({ id: 'gebruiker-1' })])
  const client = createGraphClient({
    config,
    tokens: tokens({ expiresAt: new Date(0) }),
    fetch,
    now,
    env,
    sleep: async () => {},
  })

  await client.get('/me')
  assert.equal(client.tokens().refreshToken, 'ververs-1')
})

test('zonder refresh token valt er niets te verversen', async () => {
  const { fetch, calls } = mockFetch([json({ id: 'gebruiker-1' })])
  const { statuses, store } = recordingStore()
  const client = createGraphClient({
    config,
    tokens: tokens({ refreshToken: null, expiresAt: new Date(0) }),
    fetch,
    now,
    env,
    store,
    sleep: async () => {},
  })

  const result = await client.get('/me')

  assert.equal(result.ok, false)
  assert.equal(calls.length, 0, 'er wordt niets geprobeerd')
  assert.equal(client.status(), 'revoked')
  assert.equal(statuses[0].status, 'revoked')
})

// ---------------------------------------------------------------- 401

test('bij 401 wordt er een keer ververst en opnieuw geprobeerd', async () => {
  const { fetch, calls } = mockFetch([
    json({ error: { code: 'InvalidAuthenticationToken' } }, 401),
    json({ access_token: 'toegang-2', expires_in: 3600 }),
    json({ id: 'gebruiker-1' }),
  ])
  const client = createGraphClient({ config, tokens: tokens(), fetch, now, env, sleep: async () => {} })

  const result = await client.get('/me')

  assert.equal(result.ok, true)
  assert.equal(calls.length, 3)
  assert.equal(calls[2].authorization, 'Bearer toegang-2')
})

test('blijft het 401 na verversen, dan is de toestemming weg', async () => {
  const { fetch, calls } = mockFetch([
    json({ error: { code: 'InvalidAuthenticationToken' } }, 401),
    json({ access_token: 'toegang-2', expires_in: 3600 }),
    json({ error: { code: 'InvalidAuthenticationToken' } }, 401),
  ])
  const { statuses, store } = recordingStore()
  const client = createGraphClient({ config, tokens: tokens(), fetch, now, env, store, sleep: async () => {} })

  const result = await client.get('/me')

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, 'auth')
  assert.equal(result.error.retryable, false)
  assert.equal(result.error.status, 'revoked')
  assert.equal(client.status(), 'revoked')
  assert.equal(statuses.at(-1)?.status, 'revoked')

  /* En daarna wordt er niets meer geprobeerd. */
  const eerder = calls.length
  const opnieuw = await client.get('/me')
  assert.equal(opnieuw.ok, false)
  assert.equal(calls.length, eerder)
})

test('een ingetrokken toestemming bij het verversen stopt meteen', async () => {
  const { fetch, calls } = mockFetch([json({ error: 'invalid_grant', error_description: 'AADSTS65001' }, 400)])
  const { statuses, store } = recordingStore()
  const client = createGraphClient({
    config,
    tokens: tokens({ expiresAt: new Date(0) }),
    fetch,
    now,
    env,
    store,
    sleep: async () => {},
  })

  const result = await client.get('/me')

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.retryable, false)
  assert.equal(result.error.status, 'revoked')
  assert.equal(calls.length, 1, 'alleen de mislukte refresh, geen verzoek erna')
  assert.equal(statuses[0].status, 'revoked')
})

// ---------------------------------------------------------------- 429

test('bij 429 wachten we zo lang als Microsoft zegt', async () => {
  const { fetch, calls } = mockFetch([json({}, 429, { 'Retry-After': '2' }), json({ id: 'gebruiker-1' })])
  const { waited, sleep } = recordingSleep()
  const client = createGraphClient({ config, tokens: tokens(), fetch, now, env, sleep })

  const result = await client.get('/me')

  assert.equal(result.ok, true)
  assert.equal(calls.length, 2)
  assert.deepEqual(waited, [2000])
})

test('blijft het 429, dan geven we het op maar mag het later nog eens', async () => {
  const { fetch, calls } = mockFetch([json({}, 429, { 'Retry-After': '1' })])
  const { waited, sleep } = recordingSleep()
  const client = createGraphClient({ config, tokens: tokens(), fetch, now, env, sleep, maxRetries: 2 })

  const result = await client.get('/me')

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, 'rate_limited')
  assert.equal(result.error.retryable, true)
  assert.equal(calls.length, 3, 'de eerste poging plus twee keer opnieuw')
  assert.equal(waited.length, 2)
})

test('Retry-After wordt gelezen als seconden en als datum', () => {
  assert.equal(retryAfterMs('3', NOW), 3000)
  assert.equal(retryAfterMs(null, NOW), 1000)
  assert.equal(retryAfterMs('onzin', NOW), 1000)
  assert.equal(retryAfterMs(new Date(NOW.getTime() + 4000).toUTCString(), NOW), 4000)
  assert.equal(retryAfterMs('99999', NOW), 60_000, 'nooit langer dan een minuut')
  assert.equal(retryAfterMs(new Date(NOW.getTime() - 5000).toUTCString(), NOW), 0)
})

// ---------------------------------------------------------------- de rest

test('403 betekent dat de beheerder nog moet goedkeuren', async () => {
  const { fetch } = mockFetch([json({ error: { code: 'Authorization_RequestDenied' } }, 403)])
  const client = createGraphClient({ config, tokens: tokens(), fetch, now, env, sleep: async () => {} })

  const result = await client.get('/me')

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, 'auth')
  assert.equal(result.error.retryable, false)
  assert.match(result.error.message, /beheerder/)
})

test('een storing bij Graph mag je later nog eens proberen', async () => {
  const { fetch, calls } = mockFetch([json({}, 503)])
  const { sleep } = recordingSleep()
  const client = createGraphClient({ config, tokens: tokens(), fetch, now, env, sleep, maxRetries: 1 })

  const result = await client.get('/me')

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, 'unavailable')
  assert.equal(result.error.retryable, true)
  assert.equal(calls.length, 2)
})

test('een netwerkfout gooit niet', async () => {
  const fetch = (async () => {
    throw new Error('socket hang up')
  }) as unknown as typeof globalThis.fetch
  const client = createGraphClient({ config, tokens: tokens(), fetch, now, env, sleep: async () => {} })

  const result = await client.get('/me')
  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, 'unavailable')
})

test('geen enkele foutmelding bevat een token', async () => {
  const { fetch } = mockFetch([json({ error: { code: 'InvalidAuthenticationToken' } }, 401), json({ error: 'invalid_grant' }, 400)])
  const client = createGraphClient({ config, tokens: tokens(), fetch, now, env, sleep: async () => {} })

  const result = await client.get('/me')
  assert.equal(result.ok, false)
  if (result.ok) return
  assert.ok(!result.error.message.includes('toegang-1'))
  assert.ok(!result.error.message.includes('ververs-1'))
  assert.ok(!result.error.message.includes(config.clientSecret))
})

test('versleutelde kolommen zijn weer om te zetten naar bruikbare tokens', async () => {
  const { fetch } = mockFetch([
    json({ access_token: 'toegang-2', refresh_token: 'ververs-2', expires_in: 3600 }),
    json({ id: 'gebruiker-1' }),
  ])
  const { saved, store } = recordingStore()
  const client = createGraphClient({
    config,
    tokens: tokens({ expiresAt: new Date(0) }),
    fetch,
    now,
    env,
    store,
    sleep: async () => {},
  })
  await client.get('/me')

  const row = {
    accessTokenEncrypted: saved[0].accessTokenEncrypted,
    refreshTokenEncrypted: saved[0].refreshTokenEncrypted,
    tokenExpiresAt: saved[0].tokenExpiresAt,
    scopes: saved[0].scopes,
  }
  const opnieuw = decryptTokens(row, env)

  assert.equal(opnieuw.accessToken, 'toegang-2')
  assert.equal(opnieuw.refreshToken, 'ververs-2')
})
