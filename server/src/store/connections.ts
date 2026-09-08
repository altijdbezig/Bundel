/**
 * De tabel `connections`, van de kant van de server.
 *
 * LET OP: dit is samen met `client.ts` en `oauth-state.ts` de enige kant van de
 * codebase die de service role key gebruikt. Die sleutel gaat langs RLS heen.
 * Hij hoort nooit in `web/`, nooit in een log en nooit in een foutmelding.
 *
 * Dit bestand is ook de grens waar tokens leesbaar worden. Wat hier naar buiten
 * gaat is ontsleuteld en blijft in het geheugen. Wat de database in gaat is
 * versleuteld door `crypto/tokens.ts`. Daarbuiten bestaat een token nooit op
 * schijf, en helemaal nooit in een logregel: een token dat je hebt opgeschreven
 * is een token dat je moet intrekken.
 *
 * Er is een unieke index op (user_id, source). Opnieuw koppelen werkt daarom de
 * bestaande rij bij en maakt er geen tweede. Dat gebeurt met een upsert, zodat
 * er geen moment is waarop de rij even weg is.
 */

import { decryptOptional, decryptToken, encryptOptional, encryptToken } from '../crypto/tokens.ts'
import type { Connection, ConnectionStatus, ConnectorSource, TokenStore, TokenUpdate } from '../connectors/types.ts'
import { createDbClient } from './client.ts'
import type { DbClient } from './client.ts'

export const TABLE = 'connections'

type Env = Record<string, string | undefined>

/** De rij zoals PostgREST hem teruggeeft. */
interface ConnectionRow {
  id: string
  user_id: string
  source: ConnectorSource
  external_account_id: string | null
  status: ConnectionStatus
  scopes: string[] | null
  connected_at: string
  last_synced_at: string | null
  last_error: string | null
  access_token_encrypted: string | null
  refresh_token_encrypted: string | null
  token_expires_at: string | null
}

/** Een koppeling zonder de tokens, voor waar die niet nodig zijn. */
export interface ConnectionSummary {
  readonly id: string
  readonly userId: string
  readonly source: ConnectorSource
  readonly externalAccountId: string | null
  readonly status: ConnectionStatus
  readonly scopes: readonly string[]
  readonly lastError: string | null
  readonly tokenExpiresAt: Date | null
}

/** Wat er bij het koppelen wordt weggeschreven. Tokens nog in platte tekst. */
export interface SaveConnectionInput {
  readonly userId: string
  readonly source: ConnectorSource
  readonly accessToken: string
  readonly refreshToken: string | null
  readonly tokenExpiresAt: Date
  readonly scopes: readonly string[]
  readonly externalAccountId?: string | null
  readonly status?: ConnectionStatus
}

export interface ConnectionStoreOptions {
  readonly db?: DbClient
  readonly env?: Env
}

function toSummary(row: ConnectionRow): ConnectionSummary {
  return {
    id: row.id,
    userId: row.user_id,
    source: row.source,
    externalAccountId: row.external_account_id,
    status: row.status,
    scopes: row.scopes ?? [],
    lastError: row.last_error,
    tokenExpiresAt: row.token_expires_at ? new Date(row.token_expires_at) : null,
  }
}

export function createConnectionStore(options: ConnectionStoreOptions = {}) {
  const env = options.env ?? process.env
  const db = options.db ?? createDbClient({ env })

  async function findRow(userId: string, source: ConnectorSource): Promise<ConnectionRow | null> {
    const rows = await db.select<ConnectionRow>(TABLE, {
      select: '*',
      user_id: `eq.${userId}`,
      source: `eq.${source}`,
      limit: '1',
    })
    return rows[0] ?? null
  }

  return {
    /** De koppeling zonder tokens. Handig voor een overzicht of een status. */
    async find(userId: string, source: ConnectorSource): Promise<ConnectionSummary | null> {
      const row = await findRow(userId, source)
      return row ? toSummary(row) : null
    },

    /**
     * De koppeling met de tokens erbij, ontsleuteld. Geeft null terug als er
     * geen rij is of als er geen access token in staat.
     */
    async read(userId: string, source: ConnectorSource): Promise<Connection | null> {
      const row = await findRow(userId, source)
      if (!row || !row.access_token_encrypted) return null

      return {
        userId: row.user_id,
        source: row.source,
        externalAccountId: row.external_account_id,
        status: row.status,
        scopes: row.scopes ?? [],
        accessToken: decryptToken(row.access_token_encrypted, env),
        refreshToken: decryptOptional(row.refresh_token_encrypted, env),
        tokenExpiresAt: row.token_expires_at ? new Date(row.token_expires_at) : null,
      }
    },

    /**
     * Slaat een verse koppeling op. Bestaat er al een rij voor deze gebruiker
     * en deze bron, dan wordt die bijgewerkt. Dat is wat de unieke index
     * afdwingt en wat je wil: opnieuw koppelen levert geen tweede rij op.
     */
    async save(input: SaveConnectionInput): Promise<ConnectionSummary> {
      const rows = await db.insert<ConnectionRow>(
        TABLE,
        [
          {
            user_id: input.userId,
            source: input.source,
            external_account_id: input.externalAccountId ?? null,
            status: input.status ?? 'active',
            scopes: [...input.scopes],
            connected_at: new Date().toISOString(),
            last_error: null,
            access_token_encrypted: encryptToken(input.accessToken, env),
            refresh_token_encrypted: encryptOptional(input.refreshToken, env),
            token_expires_at: input.tokenExpiresAt.toISOString(),
          },
        ],
        { onConflict: 'user_id,source' },
      )

      const row = rows[0]
      if (!row) throw new Error('Bundel: de koppeling is niet opgeslagen')
      return toSummary(row)
    },

    /** Zet alleen de status en de laatste fout. Raakt de tokens niet aan. */
    async setStatus(
      userId: string,
      source: ConnectorSource,
      status: ConnectionStatus,
      lastError: string | null,
    ): Promise<void> {
      await db.update(TABLE, { user_id: `eq.${userId}`, source: `eq.${source}` }, { status, last_error: lastError })
    },

    /** Noteert dat er zojuist gesynchroniseerd is. */
    async markSynced(userId: string, source: ConnectorSource, at: Date = new Date()): Promise<void> {
      await db.update(
        TABLE,
        { user_id: `eq.${userId}`, source: `eq.${source}` },
        { last_synced_at: at.toISOString(), status: 'active', last_error: null },
      )
    },

    async remove(userId: string, source: ConnectorSource): Promise<void> {
      await db.remove(TABLE, { user_id: `eq.${userId}`, source: `eq.${source}` })
    },

    /**
     * De `TokenStore` uit het connector-contract, vastgezet op een gebruiker en
     * een bron. Een connector krijgt deze mee en weet verder niets van de
     * database. Wat hij aanlevert is al versleuteld door `client.ts` van de
     * connector, dus hier gaat het rechtstreeks door.
     */
    tokenStore(userId: string, source: ConnectorSource): TokenStore {
      return {
        async save(update: TokenUpdate): Promise<void> {
          await db.update(
            TABLE,
            { user_id: `eq.${userId}`, source: `eq.${source}` },
            {
              access_token_encrypted: update.accessTokenEncrypted,
              refresh_token_encrypted: update.refreshTokenEncrypted,
              token_expires_at: update.tokenExpiresAt.toISOString(),
              scopes: [...update.scopes],
              status: update.status,
              last_error: null,
            },
          )
        },

        async setStatus(status: ConnectionStatus, lastError: string | null): Promise<void> {
          await db.update(TABLE, { user_id: `eq.${userId}`, source: `eq.${source}` }, { status, last_error: lastError })
        },
      }
    },
  }
}

export type ConnectionStore = ReturnType<typeof createConnectionStore>
