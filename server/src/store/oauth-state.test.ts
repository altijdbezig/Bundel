import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createOAuthStateStore, createStateValue, InvalidStateError, TABLE, TTL_MS } from './oauth-state.ts'

const NOW = new Date('2026-09-08T10:15:00.000Z')
const now = () => NOW

/** Een nep-database die zich als een tabel gedraagt, zonder netwerk. */
function mockDb(seed: Record<string, unknown>[] = []) {
  let rows = [...seed]
  const calls: { op: string; query: Record<string, string> }[] = []

  const db = {
    async select<T>(_table: string, query: Record<string, string>): Promise<T[]> {
      calls.push({ op: 'select', query })
      const wanted = query.state?.replace('eq.', '')
      return rows.filter((row) => row.state === wanted) as T[]
    },
    async insert<T>(_table: string, payload: Record<string, unknown>[]): Promise<T[]> {
      calls.push({ op: 'insert', query: {} })
      rows.push(payload[0])
      return payload as T[]
    },
    async update<T>(): Promise<T[]> {
      calls.push({ op: 'update', query: {} })
      return [] as T[]
    },
    async remove(_table: string, query: Record<string, string>): Promise<void> {
      calls.push({ op: 'remove', query })
      if (query.state) rows = rows.filter((row) => row.state !== query.state.replace('eq.', ''))
      if (query.expires_at) {
        const cutoff = Date.parse(query.expires_at.replace('lt.', ''))
        rows = rows.filter((row) => Date.parse(String(row.expires_at)) >= cutoff)
      }
    },
  }

  return { db, calls, rows: () => rows }
}

const row = (state: string, overrides: Record<string, unknown> = {}) => ({
  state,
  code_verifier: 'de-geheime-verifier',
  user_id: 'gebruiker-1',
  source: 'microsoft',
  redirect_to: null,
  created_at: NOW.toISOString(),
  expires_at: new Date(NOW.getTime() + TTL_MS).toISOString(),
  ...overrides,
})

// ---------------------------------------------------------------- aanmaken

test('een state is willekeurig en lang genoeg', () => {
  const value = createStateValue()
  /* 32 bytes in base64url zijn 43 tekens. Korter mag niet, want dit is de
     enige bescherming tegen het aanhangen van andermans koppeling. */
  assert.ok(value.length >= 43, `state is te kort: ${value.length}`)
  assert.notEqual(createStateValue(), createStateValue())
  assert.match(value, /^[A-Za-z0-9_-]+$/)
})

test('een flow starten legt state, verifier, gebruiker en bron vast', async () => {
  const { db, rows } = mockDb()
  const store = createOAuthStateStore({ db, now })

  const pending = await store.start({ userId: 'gebruiker-1', source: 'microsoft', codeVerifier: 'verifier-1' })

  assert.equal(rows().length, 1)
  const stored = rows()[0]
  assert.equal(stored.state, pending.state)
  assert.equal(stored.code_verifier, 'verifier-1')
  assert.equal(stored.user_id, 'gebruiker-1')
  assert.equal(stored.source, 'microsoft')
})

test('de geldigheid is tien minuten', async () => {
  const { db, rows } = mockDb()
  await createOAuthStateStore({ db, now }).start({
    userId: 'gebruiker-1',
    source: 'microsoft',
    codeVerifier: 'v',
  })

  const stored = rows()[0]
  assert.equal(Date.parse(String(stored.expires_at)) - NOW.getTime(), 10 * 60 * 1000)
})

test('starten ruimt verlopen rijen op', async () => {
  const oud = row('oud', { expires_at: new Date(NOW.getTime() - 60_000).toISOString() })
  const { db, rows } = mockDb([oud])

  await createOAuthStateStore({ db, now }).start({ userId: 'gebruiker-1', source: 'microsoft', codeVerifier: 'v' })

  assert.equal(rows().some((r) => r.state === 'oud'), false, 'de verlopen rij hoort weg te zijn')
})

// ---------------------------------------------------------------- ophalen

test('een geldige state levert de verifier op', async () => {
  const { db } = mockDb([row('geldig')])
  const pending = await createOAuthStateStore({ db, now }).consume('geldig')

  assert.equal(pending.codeVerifier, 'de-geheime-verifier')
  assert.equal(pending.userId, 'gebruiker-1')
  assert.equal(pending.source, 'microsoft')
})

test('een state werkt maar een keer', async () => {
  const { db, rows } = mockDb([row('eenmalig')])
  const store = createOAuthStateStore({ db, now })

  await store.consume('eenmalig')
  assert.equal(rows().length, 0, 'de rij hoort meteen weg te zijn')

  await assert.rejects(() => store.consume('eenmalig'), InvalidStateError)
})

test('een onbekende state is een harde fout', async () => {
  const { db } = mockDb([])
  await assert.rejects(
    () => createOAuthStateStore({ db, now }).consume('nooit-uitgegeven'),
    (error: unknown) => {
      assert.ok(error instanceof InvalidStateError)
      assert.equal(error.reason, 'unknown')
      return true
    },
  )
})

test('een verlopen state is een harde fout, en de rij gaat alsnog weg', async () => {
  const verlopen = row('verlopen', { expires_at: new Date(NOW.getTime() - 1000).toISOString() })
  const { db, rows } = mockDb([verlopen])

  await assert.rejects(
    () => createOAuthStateStore({ db, now }).consume('verlopen'),
    (error: unknown) => {
      assert.ok(error instanceof InvalidStateError)
      assert.equal(error.reason, 'expired')
      return true
    },
  )

  assert.equal(rows().length, 0, 'ook een verlopen rij hoort opgeruimd te worden')
})

test('een lege state komt niet eens bij de database', async () => {
  const { db, calls } = mockDb([])
  await assert.rejects(() => createOAuthStateStore({ db, now }).consume(''), InvalidStateError)
  assert.equal(calls.length, 0)
})

test('opruimen gooit alleen weg wat verlopen is', async () => {
  const { db, rows } = mockDb([
    row('vers'),
    row('oud', { expires_at: new Date(NOW.getTime() - 1).toISOString() }),
  ])

  await createOAuthStateStore({ db, now }).cleanup()

  assert.deepEqual(rows().map((r) => r.state), ['vers'])
})

test('de tabelnaam staat op een plek', () => {
  assert.equal(TABLE, 'oauth_state')
})
