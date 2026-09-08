import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  clearConnectors,
  getConnector,
  listConnectors,
  register,
  runConnector,
  statusAfter,
  succeeded,
} from './index.ts'
import type { Connector, SyncContext, SyncResult } from './types.ts'

const context: SyncContext = {
  connection: {
    userId: 'user-1',
    source: 'canvas',
    externalAccountId: null,
    status: 'active',
    scopes: [],
    accessToken: 'niet-echt',
    refreshToken: null,
    tokenExpiresAt: null,
  },
}

function connector(sync: Connector['sync']): Connector {
  return { source: 'canvas', sync }
}

test('de registry is nog leeg', () => {
  clearConnectors()
  assert.equal(listConnectors().length, 0)
  assert.equal(getConnector('canvas'), undefined)
  assert.equal(getConnector('microsoft'), undefined)
})

test('een geregistreerde connector is terug te vinden', () => {
  clearConnectors()
  const one = connector(async () => succeeded('canvas', new Date(), new Date(), {}))
  register(one)
  assert.equal(getConnector('canvas'), one)
  assert.equal(listConnectors().length, 1)
})

test('twee keer dezelfde bron registreren mag niet', () => {
  clearConnectors()
  register(connector(async () => succeeded('canvas', new Date(), new Date(), {})))
  assert.throws(() => register(connector(async () => succeeded('canvas', new Date(), new Date(), {}))), /al een connector/)
})

test('een goede sync komt ongewijzigd terug', async () => {
  const result = await runConnector(
    connector(async () => succeeded('canvas', new Date(), new Date(), { assignments: 3 })),
    context,
  )
  assert.equal(result.ok, true)
  assert.deepEqual(result.ok ? result.counts : null, { assignments: 3 })
})

test('een connector die gooit levert alsnog een resultaat', async () => {
  const result = await runConnector(
    connector(async () => {
      throw new Error('canvas ligt eruit')
    }),
    context,
  )
  assert.equal(result.ok, false)
  assert.equal(result.ok ? null : result.error.code, 'unexpected')
  assert.equal(result.ok ? null : result.error.message, 'canvas ligt eruit')
  assert.equal(result.source, 'canvas')
})

test('een afgebroken sync heet niet onverwacht', async () => {
  const result = await runConnector(
    connector(async () => {
      const error = new Error('afgebroken')
      error.name = 'AbortError'
      throw error
    }),
    context,
  )
  assert.equal(result.ok ? null : result.error.code, 'unavailable')
})

test('onzin uit een connector wordt een mislukt resultaat', async () => {
  const result = await runConnector(connector(async () => undefined as unknown as SyncResult), context)
  assert.equal(result.ok, false)
  assert.equal(result.ok ? null : result.error.message, 'connector gaf geen geldig resultaat terug')
})

test('de klok van de aanroeper wordt gebruikt', async () => {
  const fixed = new Date('2026-09-08T10:15:00.000Z')
  const result = await runConnector(
    connector(async () => {
      throw new Error('stuk')
    }),
    { ...context, now: () => fixed },
  )
  assert.equal(result.startedAt.toISOString(), fixed.toISOString())
  assert.equal(result.finishedAt.toISOString(), fixed.toISOString())
})

test('de afloop bepaalt de status van de koppeling', () => {
  const at = new Date()
  assert.equal(statusAfter(succeeded('canvas', at, at, {})), 'active')
  assert.equal(
    statusAfter({ ok: false, source: 'canvas', startedAt: at, finishedAt: at, error: { code: 'auth', message: 'weg', retryable: false } }),
    'expired',
  )
  assert.equal(
    statusAfter({ ok: false, source: 'canvas', startedAt: at, finishedAt: at, error: { code: 'unavailable', message: 'weg', retryable: true } }),
    'error',
  )
})
