/**
 * De registry. Hier staan straks de connectors in, nu nog geen enkele.
 *
 * `runConnector()` is de enige manier waarop de rest van de server een
 * connector aanroept. Die zorgt dat het contract uit `types.ts` klopt, ook als
 * een connector zich er zelf niet aan houdt: gooit hij toch, dan komt er een
 * mislukt resultaat uit in plaats van een fout die verder omhoog valt.
 */

import {
  failed,
  type Connector,
  type ConnectorSource,
  type SyncContext,
  type SyncErrorCode,
  type SyncResult,
} from './types.ts'

const registry = new Map<ConnectorSource, Connector>()

/** Zet een connector klaar. Twee keer dezelfde bron is een vergissing. */
export function register(connector: Connector): void {
  if (registry.has(connector.source)) {
    throw new Error(`Bundel: er is al een connector voor ${connector.source}`)
  }
  registry.set(connector.source, connector)
}

export function getConnector(source: ConnectorSource): Connector | undefined {
  return registry.get(source)
}

export function listConnectors(): readonly Connector[] {
  return [...registry.values()]
}

/** Alleen voor tests, zodat die niet op elkaars registratie leunen. */
export function clearConnectors(): void {
  registry.clear()
}

/** Een fout van buiten wordt hier een leesbare regel, zonder inhoud van een token. */
function describe(error: unknown): { code: SyncErrorCode; message: string } {
  if (error instanceof Error && error.name === 'AbortError') {
    return { code: 'unavailable', message: 'sync afgebroken' }
  }
  if (error instanceof Error) {
    return { code: 'unexpected', message: error.message }
  }
  return { code: 'unexpected', message: 'onbekende fout' }
}

/**
 * Draait een connector en levert altijd een `SyncResult`. Roep connectors
 * alleen hierlangs aan.
 */
export async function runConnector(connector: Connector, context: SyncContext): Promise<SyncResult> {
  const clock = context.now ?? (() => new Date())
  const startedAt = clock()

  try {
    const result = await connector.sync(context)
    if (!result || typeof result.ok !== 'boolean') {
      return failed(connector.source, startedAt, clock(), {
        code: 'unexpected',
        message: 'connector gaf geen geldig resultaat terug',
        retryable: false,
      })
    }
    return result
  } catch (error) {
    const { code, message } = describe(error)
    return failed(connector.source, startedAt, clock(), { code, message, retryable: code !== 'auth' })
  }
}

export type {
  Connection,
  ConnectionStatus,
  Connector,
  ConnectorSource,
  SyncContext,
  SyncCounts,
  SyncErrorCode,
  SyncFailure,
  SyncResult,
} from './types.ts'
export { failed, statusAfter, succeeded } from './types.ts'
