import { IconPlug } from '../../components/Icons'
import { useI18n } from '../../i18n'
import { useAppState } from '../state'
import { getSources } from '../data'

/** Neemt de app over zolang er geen enkele bron gekoppeld is. */
export default function Onboarding() {
  const { t, lang } = useI18n()
  const c = t.app.onboarding
  const { toggleConnected, connectAll } = useAppState()

  const sources = getSources(lang)

  return (
    <div className="onboarding">
      <span className="onboarding__icon">
        <IconPlug size={28} />
      </span>

      <div className="stack stack-3">
        <h1 className="title-2">{c.title}</h1>
        <p className="body measure">{c.body}</p>
      </div>

      <div className="onboarding__grid">
        {sources.map((s) => (
          <div key={s.key} className="card stack stack-3 onboarding__card">
            <span className="row">
              <span className="dot" style={{ background: s.color }} />
              <span className="card-title">{s.name}</span>
            </span>
            <p className="meta onboarding__about">{s.about}</p>
            <button type="button" className="btn btn--secondary btn--block" onClick={() => toggleConnected(s.key)}>
              {c.connect}
            </button>
          </div>
        ))}
      </div>

      <div className="row">
        <button type="button" className="btn btn--primary" onClick={connectAll}>
          {c.connectAll}
        </button>
        <span className="meta">{c.note}</span>
      </div>
    </div>
  )
}
