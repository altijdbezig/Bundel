/**
 * Het contract voor een connector.
 *
 * Een connector haalt gegevens op bij een bron en schrijft ze naar de tabellen
 * die de app leest. Er is er nog geen enkele. Dit bestand legt alleen vast hoe
 * hij eruit moet zien, zodat de eerste echte koppeling nergens meer over hoeft
 * te beslissen.
 *
 * De regel die alles bij elkaar houdt: een connector geeft altijd een
 * `SyncResult` terug en gooit nooit. Een bron die eruit ligt is normaal, geen
 * uitzondering. Loopt er toch iets mis, dan vangt `runConnector()` in
 * `index.ts` dat op en maakt er een mislukt resultaat van.
 */

/**
 * De aanbieder waar de gebruiker inlogt, niet het tabblad in de app.
 * `microsoft` levert de bron Teams. Magister staat er niet bij, want daar is
 * nog geen open aanmeldweg voor. Deze waarden horen bij de kolom `source` in
 * de tabel `connections`.
 */
export type ConnectorSource = 'canvas' | 'microsoft'

/** Gelijk aan de kolom `status` in `connections`. */
export type ConnectionStatus = 'active' | 'expired' | 'revoked' | 'error'

/**
 * Waarom een sync mislukte. De code bepaalt wat er daarna gebeurt:
 * bij `auth` moet de gebruiker opnieuw koppelen, bij de rest is opnieuw
 * proberen genoeg.
 */
export type SyncErrorCode = 'auth' | 'unavailable' | 'rate_limited' | 'unexpected'

/** Wat er per tabel is bijgekomen of bijgewerkt. */
export interface SyncCounts {
  readonly subjects?: number
  readonly lessons?: number
  readonly assignments?: number
  readonly grades?: number
  readonly groups?: number
  readonly messages?: number
  readonly attendance?: number
}

/** De koppeling waar deze sync op werkt, met de tokens al ontsleuteld. */
export interface Connection {
  readonly userId: string
  readonly source: ConnectorSource
  readonly externalAccountId: string | null
  readonly status: ConnectionStatus
  readonly scopes: readonly string[]
  readonly accessToken: string
  readonly refreshToken: string | null
  readonly tokenExpiresAt: Date | null
}

/** Alles wat een connector van buiten nodig heeft. */
export interface SyncContext {
  readonly connection: Connection
  /** Om een sync af te breken als hij te lang duurt. */
  readonly signal?: AbortSignal
  /** De klok, zodat een test hem kan vastzetten. */
  readonly now?: () => Date
}

export interface SyncFailure {
  readonly code: SyncErrorCode
  /** Korte uitleg voor in `connections.last_error`. Nooit een token. */
  readonly message: string
  /** Of het zin heeft om het later nog eens te proberen. */
  readonly retryable: boolean
}

interface SyncRun {
  readonly source: ConnectorSource
  readonly startedAt: Date
  readonly finishedAt: Date
}

export type SyncResult =
  | (SyncRun & { readonly ok: true; readonly counts: SyncCounts })
  | (SyncRun & { readonly ok: false; readonly error: SyncFailure })

/**
 * Een connector. Meer dan dit hoeft de rest van de server niet te weten.
 * `sync` gooit niet: alles wat misgaat komt terug als `ok: false`.
 */
export interface Connector {
  readonly source: ConnectorSource
  sync(context: SyncContext): Promise<SyncResult>
}

/** Welke status een koppeling krijgt na deze afloop. */
export function statusAfter(result: SyncResult): ConnectionStatus {
  if (result.ok) return 'active'
  if (result.error.code === 'auth') return 'expired'
  return 'error'
}

export function succeeded(source: ConnectorSource, startedAt: Date, finishedAt: Date, counts: SyncCounts): SyncResult {
  return { ok: true, source, startedAt, finishedAt, counts }
}

export function failed(source: ConnectorSource, startedAt: Date, finishedAt: Date, error: SyncFailure): SyncResult {
  return { ok: false, source, startedAt, finishedAt, error }
}
