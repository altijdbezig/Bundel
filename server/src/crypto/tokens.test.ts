import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { test } from 'node:test'
import { KEY_ENV, decryptOptional, decryptToken, encryptOptional, encryptToken, readKey } from './tokens.ts'

const env = { [KEY_ENV]: randomBytes(32).toString('base64') }
const other = { [KEY_ENV]: randomBytes(32).toString('base64') }

test('een token overleeft de heenweg en de terugweg', () => {
  const token = 'ya29.a0Afh6kAQ-voorbeeld-token'
  assert.equal(decryptToken(encryptToken(token, env), env), token)
})

test('de versleutelde tekst bevat het token niet', () => {
  const token = 'geheim-token-1234'
  assert.ok(!encryptToken(token, env).includes(token))
})

test('twee keer hetzelfde token levert twee verschillende regels op', () => {
  assert.notEqual(encryptToken('zelfde', env), encryptToken('zelfde', env))
})

test('een andere sleutel komt er niet in', () => {
  const payload = encryptToken('zelfde', env)
  assert.throws(() => decryptToken(payload, other), /ontsleutelen mislukt/)
})

test('een aangepaste regel valt door de mand', () => {
  const parts = encryptToken('zelfde', env).split('.')
  const body = Buffer.from(parts[3], 'base64url')
  body[0] ^= 0xff
  parts[3] = body.toString('base64url')
  assert.throws(() => decryptToken(parts.join('.'), env), /ontsleutelen mislukt/)
})

test('losse tekst is geen token', () => {
  assert.throws(() => decryptToken('zomaar wat', env), /geen versleuteld token/)
  assert.throws(() => decryptToken('v2.a.b.c', env), /geen versleuteld token/)
})

test('een fout verklapt niets over de inhoud', () => {
  const token = 'geheim-token-1234'
  const payload = encryptToken(token, env)
  try {
    decryptToken(payload, other)
    assert.fail('had moeten mislukken')
  } catch (error) {
    const text = String(error instanceof Error ? error.message : error)
    assert.ok(!text.includes(token))
    assert.ok(!text.includes(payload))
  }
})

test('zonder sleutel gebeurt er niets', () => {
  assert.throws(() => readKey({}), new RegExp(`${KEY_ENV} ontbreekt`))
})

test('een sleutel van de verkeerde lengte wordt geweigerd', () => {
  assert.throws(() => readKey({ [KEY_ENV]: randomBytes(16).toString('base64') }), /32 bytes/)
})

test('een leeg veld blijft leeg', () => {
  assert.equal(encryptOptional(null, env), null)
  assert.equal(encryptOptional('', env), null)
  assert.equal(decryptOptional(null, env), null)
  assert.equal(decryptOptional(encryptOptional('wel wat', env), env), 'wel wat')
})
