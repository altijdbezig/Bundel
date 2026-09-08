import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { test } from 'node:test'
import { KEY_ENV } from '../../crypto/tokens.ts'
import { getConnector, runConnector } from '../index.ts'
import { statusAfter } from '../types.ts'
import type { Connection, SyncContext } from '../types.ts'
import { createMicrosoftConnector, microsoftConnector } from './index.ts'

const env = {
  [KEY_ENV]: randomBytes(32).toString('base64'),
  MICROSOFT_TENANT_ID: 'contoso.onmicrosoft.com',
  MICROSOFT_CLIENT_ID: 'client-1234',
  MICROSOFT_CLIENT_SECRET: 'geheim-van-de-server',
  MICROSOFT_REDIRECT_URI: 'https://bundel.example/api/microsoft/callback',
}

const NOW = new Date('2026-09-08T10:15:00.000Z')

function connection(overrides: Partial<Connection> = {}): Connection {
  return {
    userId: 'gebruiker-1',
    source: 'microsoft',
    externalAccountId: null,
    status: 'active',
    scopes: ['User.Read'],
    accessToken: 'toegang-1',
    refreshToken: 'ververs-1',
    tokenExpiresAt: new Date(NOW.getTime() + 60 * 60 * 1000),
    ...overrides,
  }
}

function context(overrides: Partial<SyncContext> = {}): SyncContext {
  return { connection: connection(), now: () => NOW, ...overrides }
}

function mockFetch(responses: Response[]) {
  const calls: string[] = []
  const impl = async (input: unknown) => {
    calls.push(String(input))
    return responses[Math.min(calls.length - 1, responses.length - 1)]
  }
  return { fetch: impl as unknown as typeof globalThis.fetch, calls }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

test('het importeren van de map zet de connector in de registry', () => {
  assert.equal(getConnector('microsoft'), microsoftConnector)
  assert.equal(microsoftConnector.source, 'microsoft')
})

test('een werkende koppeling levert een geslaagde sync op', async () => {
  const { fetch, calls } = mockFetch([json({ id: 'graph-gebruiker-1', displayName: 'Luca Verhoeven' })])
  const connector = createMicrosoftConnector({ env, fetch, sleep: async () => {} })

  const result = await runConnector(connector, context())

  assert.equal(result.ok, true)
  assert.equal(result.source, 'microsoft')
  assert.equal(calls[0], 'https://graph.microsoft.com/v1.0/me')
  /* Er wordt nog niets opgehaald, dus er staan ook nog geen aantallen in. */
  assert.deepEqual(result.ok ? result.counts : null, {})
  assert.equal(statusAfter(result), 'active')
})

test('een ingetrokken koppeling wordt niet nog eens geprobeerd', async () => {
  const { fetch, calls } = mockFetch([json({ id: 'graph-gebruiker-1' })])
  const connector = createMicrosoftConnector({ env, fetch, sleep: async () => {} })

  const result = await runConnector(connector, context({ connection: connection({ status: 'revoked' }) }))

  assert.equal(result.ok, false)
  assert.equal(calls.length, 0, 'er gaat geen enkel verzoek uit')
  assert.equal(result.ok ? null : result.error.retryable, false)
  assert.equal(statusAfter(result), 'revoked')
})

test('een toestemming die tijdens de sync blijkt ingetrokken geeft revoked', async () => {
  const { fetch } = mockFetch([
    json({ error: { code: 'InvalidAuthenticationToken' } }, 401),
    json({ error: 'invalid_grant', error_description: 'AADSTS65001' }, 400),
  ])
  const connector = createMicrosoftConnector({ env, fetch, sleep: async () => {} })

  const result = await runConnector(connector, context())

  assert.equal(result.ok, false)
  assert.equal(result.ok ? null : result.error.retryable, false)
  assert.equal(statusAfter(result), 'revoked')
})

test('een storing bij Microsoft mag later nog eens', async () => {
  const { fetch } = mockFetch([json({}, 503)])
  const connector = createMicrosoftConnector({ env, fetch, sleep: async () => {} })

  const result = await runConnector(connector, context())

  assert.equal(result.ok, false)
  assert.equal(result.ok ? null : result.error.code, 'unavailable')
  assert.equal(result.ok ? null : result.error.retryable, true)
  assert.equal(statusAfter(result), 'error')
})

test('sync gooit niet als de verbinding ontploft', async () => {
  const fetch = (async () => {
    throw new Error('socket hang up')
  }) as unknown as typeof globalThis.fetch
  const connector = createMicrosoftConnector({ env, fetch, sleep: async () => {} })

  const result = await runConnector(connector, context())

  assert.equal(result.ok, false)
  assert.equal(result.ok ? null : result.error.code, 'unavailable')
})

test('zonder app-registratie gaat er niets naar Microsoft', async () => {
  const { fetch, calls } = mockFetch([json({ id: 'graph-gebruiker-1' })])
  const connector = createMicrosoftConnector({ env: { [KEY_ENV]: env[KEY_ENV] }, fetch, sleep: async () => {} })

  const result = await runConnector(connector, context())

  assert.equal(result.ok, false)
  assert.equal(calls.length, 0)
  assert.match(result.ok ? '' : result.error.message, /MICROSOFT_TENANT_ID/)
})

test('een koppeling van een andere bron hoort hier niet', async () => {
  const { fetch } = mockFetch([json({ id: 'graph-gebruiker-1' })])
  const connector = createMicrosoftConnector({ env, fetch, sleep: async () => {} })

  const result = await runConnector(connector, context({ connection: connection({ source: 'canvas' }) }))

  assert.equal(result.ok, false)
  assert.equal(result.ok ? null : result.error.code, 'unexpected')
})
