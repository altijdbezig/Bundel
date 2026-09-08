import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import {
  buildAuthorizationUrl,
  createPkcePair,
  createState,
  exchangeCode,
  isExpiring,
  readConfig,
  refreshTokens,
  REFRESH_SKEW_MS,
  SCOPES,
  tokenEndpoint,
} from './auth.ts'
import type { MicrosoftConfig } from './auth.ts'

const config: MicrosoftConfig = {
  tenantId: 'contoso.onmicrosoft.com',
  clientId: 'client-1234',
  clientSecret: 'geheim-van-de-server',
  redirectUri: 'https://bundel.example/api/microsoft/callback',
}

const NOW = new Date('2026-09-08T10:15:00.000Z')
const now = () => NOW

/** Een nep-fetch die vastlegt wat er verstuurd is. */
function mockFetch(responses: Response[]) {
  const calls: { url: string; body: URLSearchParams }[] = []
  const impl = async (input: unknown, init: RequestInit = {}) => {
    calls.push({ url: String(input), body: new URLSearchParams(String(init.body ?? '')) })
    const response = responses[Math.min(calls.length - 1, responses.length - 1)]
    return response
  }
  return { fetch: impl as unknown as typeof globalThis.fetch, calls }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

// ---------------------------------------------------------------- de URL

test('de autorisatie-URL heeft alles wat Microsoft verwacht', () => {
  const url = new URL(buildAuthorizationUrl({ state: 'staat-vast', codeChallenge: 'uitdaging' }, config))

  assert.equal(url.origin, 'https://login.microsoftonline.com')
  assert.equal(url.pathname, '/contoso.onmicrosoft.com/oauth2/v2.0/authorize')
  assert.equal(url.searchParams.get('client_id'), config.clientId)
  assert.equal(url.searchParams.get('response_type'), 'code')
  assert.equal(url.searchParams.get('redirect_uri'), config.redirectUri)
  assert.equal(url.searchParams.get('state'), 'staat-vast')
  assert.equal(url.searchParams.get('code_challenge'), 'uitdaging')
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256')
})

test('de gevraagde rechten staan erin en zijn allemaal alleen lezen', () => {
  const url = new URL(buildAuthorizationUrl({ state: 's', codeChallenge: 'c' }, config))
  const scopes = (url.searchParams.get('scope') ?? '').split(' ')

  assert.deepEqual(scopes, [...SCOPES])
  assert.ok(scopes.includes('offline_access'), 'zonder offline_access komt er geen refresh token')
  assert.ok(!scopes.some((scope) => scope.includes('ReadWrite') || scope.includes('Write')))
  assert.ok(!scopes.some((scope) => scope.startsWith('Chat.')), 'chats van anderen vragen we niet')
})

test('het client secret gaat nooit mee naar de browser', () => {
  const url = buildAuthorizationUrl({ state: 's', codeChallenge: 'c' }, config)
  assert.ok(!url.includes(config.clientSecret))
})

test('een login_hint staat er alleen als je hem meegeeft', () => {
  const zonder = new URL(buildAuthorizationUrl({ state: 's', codeChallenge: 'c' }, config))
  const met = new URL(buildAuthorizationUrl({ state: 's', codeChallenge: 'c', loginHint: 'luca@school.nl' }, config))

  assert.equal(zonder.searchParams.get('login_hint'), null)
  assert.equal(met.searchParams.get('login_hint'), 'luca@school.nl')
})

// ---------------------------------------------------------------- PKCE

test('de challenge is de sha256 van de verifier', () => {
  const pair = createPkcePair()
  assert.equal(pair.method, 'S256')
  assert.equal(pair.challenge, createHash('sha256').update(pair.verifier).digest('base64url'))
})

test('de verifier heeft de lengte die de standaard toestaat', () => {
  const { verifier } = createPkcePair()
  assert.ok(verifier.length >= 43 && verifier.length <= 128)
  assert.match(verifier, /^[A-Za-z0-9\-._~]+$/)
})

test('twee keer PKCE levert twee keer iets anders op', () => {
  assert.notEqual(createPkcePair().verifier, createPkcePair().verifier)
  assert.notEqual(createState(), createState())
})

// ---------------------------------------------------------------- code inwisselen

test('de code wordt met de verifier ingewisseld', async () => {
  const { fetch, calls } = mockFetch([
    json({ access_token: 'toegang-1', refresh_token: 'ververs-1', expires_in: 3600, scope: SCOPES.join(' ') }),
  ])

  const result = await exchangeCode({ code: 'code-uit-de-redirect', codeVerifier: 'de-verifier' }, config, { fetch, now })

  assert.equal(calls[0].url, tokenEndpoint(config))
  assert.equal(calls[0].body.get('grant_type'), 'authorization_code')
  assert.equal(calls[0].body.get('code'), 'code-uit-de-redirect')
  assert.equal(calls[0].body.get('code_verifier'), 'de-verifier')
  assert.equal(calls[0].body.get('redirect_uri'), config.redirectUri)

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.tokens.accessToken, 'toegang-1')
  assert.equal(result.tokens.refreshToken, 'ververs-1')
  assert.equal(result.tokens.expiresAt.toISOString(), new Date(NOW.getTime() + 3600_000).toISOString())
})

test('een ingetrokken toestemming is geen fout om nog eens te proberen', async () => {
  const { fetch } = mockFetch([json({ error: 'invalid_grant', error_description: 'AADSTS65001' }, 400)])
  const result = await exchangeCode({ code: 'c', codeVerifier: 'v' }, config, { fetch, now })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, 'auth')
  assert.equal(result.error.retryable, false)
})

test('een storing bij Microsoft mag je later nog eens proberen', async () => {
  const { fetch } = mockFetch([json({ error: 'temporarily_unavailable' }, 503)])
  const result = await exchangeCode({ code: 'c', codeVerifier: 'v' }, config, { fetch, now })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, 'unavailable')
  assert.equal(result.error.retryable, true)
})

test('een netwerkfout gooit niet maar komt terug als resultaat', async () => {
  const fetch = (async () => {
    throw new Error('getaddrinfo ENOTFOUND')
  }) as unknown as typeof globalThis.fetch

  const result = await exchangeCode({ code: 'c', codeVerifier: 'v' }, config, { fetch, now })
  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, 'unavailable')
  assert.equal(result.error.retryable, true)
})

test('een antwoord zonder token telt niet als gelukt', async () => {
  const { fetch } = mockFetch([json({ token_type: 'Bearer' })])
  const result = await exchangeCode({ code: 'c', codeVerifier: 'v' }, config, { fetch, now })
  assert.equal(result.ok, false)
})

// ---------------------------------------------------------------- verversen

test('verversen stuurt het refresh token mee', async () => {
  const { fetch, calls } = mockFetch([json({ access_token: 'toegang-2', expires_in: 900 })])
  const result = await refreshTokens('ververs-1', config, { fetch, now })

  assert.equal(calls[0].body.get('grant_type'), 'refresh_token')
  assert.equal(calls[0].body.get('refresh_token'), 'ververs-1')
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.tokens.accessToken, 'toegang-2')
  /* Microsoft stuurt lang niet altijd een nieuw refresh token mee. */
  assert.equal(result.tokens.refreshToken, null)
  assert.equal(result.tokens.expiresAt.toISOString(), new Date(NOW.getTime() + 900_000).toISOString())
})

test('een foutmelding verklapt geen token', async () => {
  const { fetch } = mockFetch([json({ error: 'invalid_grant', error_description: 'iets met ververs-geheim-1' }, 400)])
  const result = await refreshTokens('ververs-geheim-1', config, { fetch, now })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.ok(!result.error.message.includes('ververs-geheim-1'))
})

// ---------------------------------------------------------------- verlopen

test('een token dat bijna verloopt telt als verlopen', () => {
  const bijna = new Date(NOW.getTime() + REFRESH_SKEW_MS - 1000)
  const ruim = new Date(NOW.getTime() + REFRESH_SKEW_MS + 1000)

  assert.equal(isExpiring(bijna, NOW), true)
  assert.equal(isExpiring(ruim, NOW), false)
  assert.equal(isExpiring(new Date(NOW.getTime() - 1000), NOW), true)
  assert.equal(isExpiring(null, NOW), true)
})

// ---------------------------------------------------------------- instellingen

test('zonder app-registratie gebeurt er niets', () => {
  assert.throws(() => readConfig({}), /MICROSOFT_TENANT_ID/)
  assert.throws(() => readConfig({ MICROSOFT_TENANT_ID: 't' }), /MICROSOFT_CLIENT_ID/)
})

test('met alle variabelen komt de registratie eruit', () => {
  const parsed = readConfig({
    MICROSOFT_TENANT_ID: config.tenantId,
    MICROSOFT_CLIENT_ID: config.clientId,
    MICROSOFT_CLIENT_SECRET: config.clientSecret,
    MICROSOFT_REDIRECT_URI: config.redirectUri,
  })
  assert.deepEqual(parsed, config)
})
