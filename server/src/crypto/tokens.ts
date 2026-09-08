/**
 * Tokens versleutelen en ontsleutelen.
 *
 * Een access token of refresh token van Canvas of Microsoft geeft toegang tot
 * het schoolaccount van een gebruiker. Zoiets hoort niet leesbaar in een
 * database te staan, ook niet in een database die alleen wij kunnen benaderen.
 * Daarom gaat er niets in platte tekst naar `connections`.
 *
 * AES-256-GCM: versleutelt en controleert in een keer, dus een rij die
 * onderweg is aangepast valt bij het ontsleutelen door de mand.
 *
 * De sleutel staat in de omgeving, nooit in de code. Zie `server/.env.example`.
 * Maken doe je hem zo:
 *
 *   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
 *
 * Er staat nergens in dit bestand een token in een foutmelding of in een log.
 * Doe dat verderop ook niet: een token in een logregel is een token dat je
 * moet intrekken.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const VERSION = 'v1'
const KEY_BYTES = 32
const IV_BYTES = 12
const TAG_BYTES = 16

export const KEY_ENV = 'BUNDEL_TOKEN_KEY'

type Env = Record<string, string | undefined>

/** Leest de sleutel uit de omgeving en controleert de lengte. */
export function readKey(env: Env = process.env): Buffer {
  const raw = env[KEY_ENV]
  if (!raw) throw new Error(`Bundel: ${KEY_ENV} ontbreekt`)

  const key = Buffer.from(raw, 'base64')
  if (key.length !== KEY_BYTES) {
    throw new Error(`Bundel: ${KEY_ENV} moet ${KEY_BYTES} bytes zijn, base64 gecodeerd`)
  }
  return key
}

/**
 * Versleutelt een token. Het resultaat is een tekstregel die in een
 * `_encrypted`-kolom past. Twee keer hetzelfde token levert twee verschillende
 * regels op, want elke keer wordt er een nieuwe iv getrokken.
 */
export function encryptToken(token: string, env: Env = process.env): string {
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('Bundel: er valt niets te versleutelen')
  }

  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, readKey(env), iv)
  const body = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return [VERSION, iv.toString('base64url'), tag.toString('base64url'), body.toString('base64url')].join('.')
}

/**
 * Ontsleutelt wat `encryptToken()` maakte. Klopt er iets niet, dan volgt een
 * fout zonder inhoud, want de inhoud is juist het geheim.
 */
export function decryptToken(payload: string, env: Env = process.env): string {
  const parts = typeof payload === 'string' ? payload.split('.') : []
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error('Bundel: dit is geen versleuteld token')
  }

  const iv = Buffer.from(parts[1], 'base64url')
  const tag = Buffer.from(parts[2], 'base64url')
  const body = Buffer.from(parts[3], 'base64url')
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
    throw new Error('Bundel: dit is geen versleuteld token')
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, readKey(env), iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8')
  } catch {
    /* Geen oorzaak meegeven. Een verkeerde sleutel en een aangepaste rij zien
       er van buiten hetzelfde uit, en dat hoort ook zo. */
    throw new Error('Bundel: token ontsleutelen mislukt')
  }
}

/** Handig bij het opslaan: een leeg veld blijft leeg. */
export function encryptOptional(token: string | null | undefined, env: Env = process.env): string | null {
  return token ? encryptToken(token, env) : null
}

export function decryptOptional(payload: string | null | undefined, env: Env = process.env): string | null {
  return payload ? decryptToken(payload, env) : null
}
