import { useI18n } from '../../i18n'
import { useAppState } from '../state'
import { getSources } from '../data'

export default function Sources() {
  const { t, lang } = useI18n()
  const { status, toggleConnected, toggleReachable } = useAppState()
  const c = t.app.sources

  const sources = getSources(lang)

  const stateLabel = { ok: c.connected, warn: c.unreachable, off: c.notConnected }
  const badgeClass = { ok: 'badge--ok', warn: 'badge--warn', off: '' }
  const dotColor = { ok: 'var(--ok-dot)', warn: 'var(--warn-dot)', off: 'var(--ink-500)' }

  return (
    <div className="screen">
      <header className="screen__head">
        <div className="stack stack-2">
          <h1 className="screen__title">{c.title}</h1>
          <span className="meta">{c.subtitle}</span>
        </div>
      </header>

      <p className="meta">{c.demoNote}</p>

      <div className="sources-grid">
        {sources.map((s) => {
          const state = status(s.key)
          const connected = state !== 'off'

          return (
            <section key={s.key} className="card stack stack-3 source-card">
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

              <dl className="source-card__facts">
                <div>
                  <dt className="label">{c.lastSync}</dt>
                  <dd className="data">{connected && state === 'ok' ? s.lastSync : c.never}</dd>
                </div>
                <div>
                  <dt className="label">sync</dt>
                  <dd className="meta">{s.sync}</dd>
                </div>
              </dl>

              <div className="row source-card__actions">
                <button
                  type="button"
                  className={connected ? 'btn btn--secondary' : 'btn btn--primary'}
                  onClick={() => toggleConnected(s.key)}
                >
                  {connected ? c.disconnect : c.connect}
                </button>

                {connected && (
                  <button type="button" className="btn btn--ghost" onClick={() => toggleReachable(s.key)}>
                    {state === 'warn' ? c.restore : c.simulate}
                  </button>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
