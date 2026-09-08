/**
 * De tussenstand van een OAuth-flow: `state` en de PKCE `code_verifier`.
 *
 * LET OP: dit is samen met `client.ts` en `connections.ts` de enige kant van de
 * codebase die de service role key gebruikt. Zie de opmerking daar.
 *
 * `state` is de CSRF-bescherming. Zonder controle daarop kan iemand anders zijn
 * koppeling aan jouw account hangen: hij begint de flow, stuurt jou zijn
 * callback-URL, en jouw browser levert zijn code in onder jouw sessie. Vier
 * regels houden dat tegen:
 *
 *   1. `state` is willekeurig, 32 bytes, cryptografisch veilig
 *   2. hij is tien minuten geldig
 *   3. hij is eenmalig: bij het ophalen wordt de rij meteen verwijderd, ook als
 *      de flow daarna alsnog mislukt
 *   4. een onbekende of verlopen state is een harde fout, geen waarschuwing
 *
 * De `code_verifier` komt hier vandaan en gaat nergens anders heen. Hij staat
 * niet in een cookie, niet in een URL en niet in een logregel.
 */

import { randomBytes } from 'node:crypto'
import type { ConnectorSource } from '../connectors/types.ts'
import { createDbClient } from './client.ts'
import type { DbClient } from './client.ts'

export const TABLE = 'oauth_state'

/** Zolang mag een flow open blijven staan. */
export const TTL_MS = 10 * 60 * 1000

/** Minstens zoveel willekeur, anders is de state te raden. */
const STATE_BYTES = 32

type Env = Record<string, string | undefined>

interface StateRow {
  state: string
  code_verifier: string
  user_id: string
  source: ConnectorSource
  redirect_to: string | null
  created_at: string
  expires_at: string
}

export interface PendingFlow {
  readonly state: string
  readonly codeVerifier: string
  readonly userId: string
  readonly source: ConnectorSource
  readonly redirectTo: string | null
  readonly expiresAt: Date
}

export interface StartFlowInput {
  readonly userId: string
  readonly source: ConnectorSource
  readonly codeVerifier: string
  /** Waar de gebruiker na afloop heen moet. Optioneel. */
  readonly redirectTo?: string | null
}

export interface OAuthStateStoreOptions {
  readonly db?: DbClient
  readonly env?: Env
  readonly now?: () => Date
  readonly ttlMs?: number
}

/** Een state die niet klopt. Dit is een harde fout, geen waarschuwing. */
export class InvalidStateError extends Error {
  readonly reason: 'unknown' | 'expired'

  constructor(reason: 'unknown' | 'expired') {
    super(
      reason === 'expired'
        ? 'Bundel: deze koppelpoging is verlopen, begin opnieuw'
        : 'Bundel: deze koppelpoging is onbekend',
    )
    this.name = 'InvalidStateError'
    this.reason = reason
  }
}

/** Nieuwe, cryptografisch veilige state. */
export function createStateValue(): string {
  return randomBytes(STATE_BYTES).toString('base64url')
}

export function createOAuthStateStore(options: OAuthStateStoreOptions = {}) {
  const env = options.env ?? process.env
  const db = options.db ?? createDbClient({ env })
  const now = options.now ?? (() => new Date())
  const ttlMs = options.ttlMs ?? TTL_MS

  return {
    /**
     * Legt een begonnen flow vast en geeft de state terug. Ruimt en passant de
     * verlopen rijen op, zodat er geen aparte planner nodig is.
     */
    async start(input: StartFlowInput): Promise<PendingFlow> {
      await this.cleanup()

      const state = createStateValue()
      const expiresAt = new Date(now().getTime() + ttlMs)

      await db.insert(TABLE, [
        {
          state,
          code_verifier: input.codeVerifier,
          user_id: input.userId,
          source: input.source,
          redirect_to: input.redirectTo ?? null,
          created_at: now().toISOString(),
          expires_at: expiresAt.toISOString(),
        },
      ])

      return {
        state,
        codeVerifier: input.codeVerifier,
        userId: input.userId,
        source: input.source,
        redirectTo: input.redirectTo ?? null,
        expiresAt,
      }
    },

    /**
     * Haalt een flow op en verwijdert hem meteen, wat er daarna ook gebeurt.
     * Een onbekende of verlopen state gooit `InvalidStateError`.
     */
    async consume(state: string): Promise<PendingFlow> {
      if (typeof state !== 'string' || state.length === 0) throw new InvalidStateError('unknown')

      const rows = await db.select<StateRow>(TABLE, { select: '*', state: `eq.${state}`, limit: '1' })
      const row = rows[0]

      /* Eerst weg, dan pas oordelen. Zo is een state ook eenmalig als de rest
         van de flow verderop stukloopt. */
      if (row) await db.remove(TABLE, { state: `eq.${state}` })

      if (!row) throw new InvalidStateError('unknown')

      const expiresAt = new Date(row.expires_at)
      if (expiresAt.getTime() <= now().getTime()) throw new InvalidStateError('expired')

      return {
        state: row.state,
        codeVerifier: row.code_verifier,
        userId: row.user_id,
        source: row.source,
        redirectTo: row.redirect_to,
        expiresAt,
      }
    },

    /** Gooit verlopen rijen weg. Geeft terug hoeveel er weg zijn. */
    async cleanup(): Promise<void> {
      await db.remove(TABLE, { expires_at: `lt.${now().toISOString()}` })
    },
  }
}

export type OAuthStateStore = ReturnType<typeof createOAuthStateStore>
