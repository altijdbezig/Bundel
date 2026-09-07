import { fill, useI18n } from '../../i18n'
import { useAppState } from '../state'
import ScreenHeader from '../ScreenHeader'
import { getSources, getSourceStats, SOURCE_KEYS } from '../data'

export default function Sources() {
  const { t, lang } = useI18n()
  const { status, toggleConnected, toggleReachable, syncNow, syncing, syncedAt } = useAppState()
  const c = t.app.sources

  const sources = getSources(lang)
  const stats = getSourceStats(lang)
  const connectedCount = SOURCE_KEYS.filter((key) => status(key) !== 'off').length

  const stateLabel = { ok: c.connected, warn: c.unreachable, off: c.notConnected }
  const badgeClass = { ok: 'badge--ok', warn: 'badge--warn', off: '' }
  const dotColor = { ok: 'var(--ok-dot)', warn: 'var(--warn-dot)', off: 'var(--ink-500)' }

  return (
    <div className="screen">
      <ScreenHeader title={c.title} subtitle={c.subtitle}>
        <span className="badge">{fill(c.summary, { connected: connectedCount, total: SOURCE_KEYS.length })}</span>
      </ScreenHeader>

      <p className="meta">{c.demoNote}</p>

      <div className="sources-grid">
        {sources.map((s) => {
          const state = status(s.key)
          const connected = state !== 'off'
          const stat = stats[s.key]
          const busy = syncing.includes(s.key)
          const lastSync = syncedAt[s.key] ?? s.lastSync

          return (
            <section key={s.key} className="card stack stack-4 source-card">
              <div className="source-card__head">
                <span className="row source-card__name">
                  <span className="dot" style={{ background: connected ? s.color : 'var(--ink-300)' }} />
                  <span className="card-title">{s.name}</span>
                </span>
                <span className={`badge ${badgeClass[state]}`}>
                  <span className="dot dot--sm" style={{ background: dotColor[state] }} />
                  {stateLabel[state]}
                </span>
              </div>

              <p className="meta">{s.about}</p>

              {/* Wat deze bron oplevert */}
              <div className="provides">
                <span className="label">{c.provides}</span>
                {connected ? (
                  <div className="provides__row">
                    {stat.counts.map((item) => (
                      <span key={item.label} className="provides__item">
                        <span className="provides__value data">{item.value}</span>
                        <span className="meta">{item.label}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="meta">{c.nothing}</p>
                )}
              </div>

              {/* Welke rechten we vragen */}
              <div className="stack stack-2">
                <span className="label">{c.permissions}</span>
                <ul className="perms">
                  {stat.permissions.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              {/* Laatste syncs */}
              <div className="stack stack-2">
                <span className="label">{c.history}</span>
                <div className="synclist">
                  {connected && (
                    <span className="synclist__item">
                      <span className="dot dot--sm" style={{ background: 'var(--ok-dot)' }} />
                      <span className="data">{lastSync}</span>
                      <span className="meta">{c.syncOk}</span>
                    </span>
                  )}
                  {stat.history.slice(1).map((h) => (
                    <span key={h.time} className="synclist__item">
                      <span
                        className="dot dot--sm"
                        style={{ background: h.ok ? 'var(--ok-dot)' : 'var(--warn-dot)' }}
                      />
                      <span className="data">{h.time}</span>
                      <span className="meta">{h.ok ? c.syncOk : c.syncFailed}</span>
                    </span>
                  ))}
                </div>
                <span className="meta">{s.sync}</span>
              </div>

              <div className="row source-card__actions">
                <button
                  type="button"
                  className={connected ? 'btn btn--secondary' : 'btn btn--primary'}
                  onClick={() => toggleConnected(s.key)}
                >
                  {connected ? c.disconnect : c.connect}
                </button>

                {connected && (
                  <>
                    <button type="button" className="btn btn--secondary" onClick={() => syncNow(s.key)} disabled={busy}>
                      {busy ? c.syncing : c.syncNow}
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={() => toggleReachable(s.key)}>
                      {state === 'warn' ? c.restore : c.simulate}
                    </button>
                  </>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
