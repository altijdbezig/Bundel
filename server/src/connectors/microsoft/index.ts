/**
 * De connector voor Microsoft, de bron die in de app Teams heet.
 *
 * Wat hij nu doet is inloggen en het token levend houden. Meer niet. Er wordt
 * nog geen enkel bericht en geen enkel kanaal opgehaald: `sync()` controleert
 * of de koppeling nog werkt en geeft een leeg resultaat terug. Dat is met
 * opzet, zodat de OAuth-kant af is voordat er data overheen gaat.
 *
 * Het contract uit `../types.ts` geldt hier onverkort: `sync()` gooit niet.
 * Alles komt terug als `SyncResult`, ook als Microsoft eruit ligt.
 *
 * Het importeren van dit bestand zet de connector in de registry. Wie hem wil
 * gebruiken importeert dus deze map, en pakt hem daarna op met
 * `getConnector('microsoft')`.
 */

import { register } from '../index.ts'
import { failed, succeeded } from '../types.ts'
import type { Connector, SyncContext, SyncResult } from '../types.ts'
import { readConfig } from './auth.ts'
import type { MicrosoftConfig } from './auth.ts'
import { createGraphClient, tokensFromConnection } from './client.ts'

type Fetch = typeof globalThis.fetch
type Env = Record<string, string | undefined>

export interface MicrosoftConnectorDeps {
  readonly config?: MicrosoftConfig
  readonly env?: Env
  readonly fetch?: Fetch
  readonly sleep?: (ms: number) => Promise<void>
  readonly baseUrl?: string
}

/** Het stukje van Graph dat zegt wie je bent. Verder wordt er niets gelezen. */
interface GraphMe {
  id?: string
  displayName?: string
}

export function createMicrosoftConnector(deps: MicrosoftConnectorDeps = {}): Connector {
  return {
    source: 'microsoft',

    async sync(context: SyncContext): Promise<SyncResult> {
      const clock = context.now ?? (() => new Date())
      const startedAt = clock()
      const env = deps.env ?? process.env

      if (context.connection.source !== 'microsoft') {
        return failed('microsoft', startedAt, clock(), {
          code: 'unexpected',
          message: `deze connector hoort niet bij de bron ${context.connection.source}`,
          retryable: false,
        })
      }

      /* Een koppeling die al is ingetrokken proberen we niet opnieuw. De
         gebruiker moet er zelf iets aan doen, dus een sync verandert niets. */
      if (context.connection.status === 'revoked') {
        return failed('microsoft', startedAt, clock(), {
          code: 'auth',
          message: 'de koppeling met Microsoft is ingetrokken, opnieuw koppelen is nodig',
          retryable: false,
          status: 'revoked',
        })
      }

      let config: MicrosoftConfig
      try {
        config = deps.config ?? readConfig(env)
      } catch (error) {
        return failed('microsoft', startedAt, clock(), {
          code: 'unexpected',
          message: error instanceof Error ? error.message : 'de app-registratie ontbreekt',
          retryable: false,
        })
      }

      const client = createGraphClient({
        config,
        tokens: tokensFromConnection(context.connection),
        store: context.store,
        fetch: deps.fetch,
        sleep: deps.sleep,
        baseUrl: deps.baseUrl,
        env,
        now: clock,
      })

      const me = await client.get<GraphMe>('/me')
      if (!me.ok) return failed('microsoft', startedAt, clock(), me.error)

      /* Nog niets opgehaald, dus overal nul. Zodra de kanalen en de berichten
         erbij komen vult dit zich vanzelf. */
      return succeeded('microsoft', startedAt, clock(), {})
    },
  }
}

export const microsoftConnector: Connector = createMicrosoftConnector()

register(microsoftConnector)

export { buildAuthorizationUrl, createPkcePair, createState, exchangeCode, isExpiring, readConfig, refreshTokens, SCOPES } from './auth.ts'
export { createGraphClient, decryptTokens, tokensFromConnection } from './client.ts'
