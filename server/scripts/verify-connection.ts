/**
 * Controleert of een opgeslagen koppeling nog leeft.
 *
 * Dit is het bewijs dat de hele keten werkt: de rij staat in `connections`, de
 * tokens zijn te ontsleutelen, en Graph accepteert ze. Verloopt het access
 * token bijna, dan ververst de client het onderweg en schrijft hij het nieuwe
 * token versleuteld terug. Draai het script daarna nog eens: dan zie je een
 * nieuwe vervaltijd, en dat is meteen het bewijs dat verversen werkt.
 *
 * Gebruik:
 *
 *   cd server
 *   node --env-file=.env scripts/verify-connection.ts <user-id>
 *
 * De user-id is de id uit `auth.users`. Die vind je in Supabase onder
 * Authentication, of in de app via je eigen profiel.
 *
 * Er komt geen enkel token in de uitvoer. Wel de eerste tekens van het
 * account-id, de status en de vervaltijd, want dat zegt genoeg.
 */

import { createMicrosoftConnector } from '../src/connectors/microsoft/index.ts'
import { createGraphClient, tokensFromConnection } from '../src/connectors/microsoft/client.ts'
import { readConfig } from '../src/connectors/microsoft/auth.ts'
import { createConnectionStore } from '../src/store/connections.ts'
import { runConnector } from '../src/connectors/index.ts'

interface GraphMe {
  id?: string
  displayName?: string
  userPrincipalName?: string
}

const userId = process.argv[2] ?? process.env.BUNDEL_USER_ID

if (!userId) {
  console.error('Gebruik: node --env-file=.env scripts/verify-connection.ts <user-id>')
  process.exit(1)
}

const store = createConnectionStore()

const summary = await store.find(userId, 'microsoft')
if (!summary) {
  console.error(`Geen koppeling gevonden voor ${userId}. Doorloop eerst /auth/microsoft/start.`)
  process.exit(1)
}

console.log('Koppeling gevonden')
console.log(`  status         ${summary.status}`)
console.log(`  scopes         ${summary.scopes.join(' ') || '(geen)'}`)
console.log(`  account        ${summary.externalAccountId ?? '(nog niet ingevuld)'}`)
console.log(`  token verloopt ${summary.tokenExpiresAt?.toISOString() ?? '(onbekend)'}`)
if (summary.lastError) console.log(`  laatste fout   ${summary.lastError}`)

const connection = await store.read(userId, 'microsoft')
if (!connection) {
  console.error('De rij staat er wel, maar er zit geen bruikbaar token in. Koppel opnieuw.')
  process.exit(1)
}

console.log('\nTokens ontsleuteld. Nu Graph vragen wie dit is.')

const client = createGraphClient({
  config: readConfig(),
  tokens: tokensFromConnection(connection),
  store: store.tokenStore(userId, 'microsoft'),
})

const me = await client.get<GraphMe>('/me')

if (!me.ok) {
  console.error(`\nMislukt: ${me.error.message}`)
  console.error(`  code           ${me.error.code}`)
  console.error(`  opnieuw zinvol ${me.error.retryable ? 'ja' : 'nee'}`)
  await store.setStatus(userId, 'microsoft', me.error.status ?? 'error', me.error.message)
  process.exit(1)
}

console.log('\nGraph antwoordt:')
console.log(`  naam           ${me.data.displayName ?? '(geen naam)'}`)
console.log(`  account        ${me.data.userPrincipalName ?? '(geen upn)'}`)

const after = client.tokens()
console.log(`\nToken verloopt nu ${after.expiresAt.toISOString()}`)

/* En dan nog een keer via de connector zelf, zodat ook dat pad bewezen is. */
const result = await runConnector(createMicrosoftConnector(), { connection, store: store.tokenStore(userId, 'microsoft') })
console.log(`\nsync via de connector: ${result.ok ? 'gelukt' : `mislukt (${result.error.code})`}`)

if (result.ok) {
  await store.markSynced(userId, 'microsoft')
  console.log('last_synced_at bijgewerkt. De koppeling leeft.')
}
