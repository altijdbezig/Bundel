import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import WaitlistForm from '../components/WaitlistForm'
import { IconWindows, IconApple, IconPlay, IconGlobe, IconDownload } from '../components/Icons'
import { useI18n } from '../i18n'

const desktopIcons = [IconWindows, IconApple]
const storeIcons = [IconApple, IconPlay]

export default function Download() {
  const { t } = useI18n()
  const d = t.download

  return (
    <section className="section">
      <div className="page stack stack-6">
        <Reveal className="stack stack-4">
          <span className="label">{d.availableSoon}</span>
          <h1 className="title-1 measure">{d.title}</h1>
          <p className="body measure-lg">{d.lead}</p>
        </Reveal>

        {/* Web - het enige dat er straks als eerste is */}
        <Reveal className="panel dl-web">
          <span className="feature__icon">
            <IconGlobe size={24} />
          </span>
          <div className="stack stack-2 dl-web__copy">
            <h2 className="heading">{d.webTitle}</h2>
            <p className="meta measure">{d.webBody}</p>
          </div>
          <Link to="/login" className="btn btn--primary">
            {d.webCta}
          </Link>
        </Reveal>

        {/* Desktop */}
        <div className="stack stack-4">
          <Reveal className="row dl-head">
            <h2 className="title-2">{d.desktopTitle}</h2>
            <span className="badge badge--warn">
              <span className="dot dot--sm" style={{ background: 'var(--warn-dot)' }} />
              {d.inDevelopment}
            </span>
          </Reveal>

          <div className="grid-2">
            {d.platforms.map((p, i) => {
              const Ico = desktopIcons[i]
              return (
                <Reveal key={p.t} className="card dl-card" delay={i * 70}>
                  <span className="dl-card__icon">
                    <Ico size={26} />
                  </span>
                  <div className="stack stack-2 dl-card__copy">
                    <h3 className="card-title">{p.t}</h3>
                    <p className="meta">{p.b}</p>
                  </div>
                  <span className="btn btn--secondary" aria-disabled="true">
                    <IconDownload size={17} />
                    {d.availableSoon}
                  </span>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* Mobiel */}
        <div className="stack stack-4">
          <Reveal className="row dl-head">
            <h2 className="title-2">{d.mobileTitle}</h2>
            <span className="badge">{d.availableSoon}</span>
          </Reveal>

          <div className="grid-2">
            {d.stores.map((s, i) => {
              const Ico = storeIcons[i]
              return (
                <Reveal key={s.t} className="card dl-card" delay={i * 70}>
                  <span className="dl-card__icon">
                    <Ico size={26} />
                  </span>
                  <div className="stack stack-2 dl-card__copy">
                    <h3 className="card-title">{s.t}</h3>
                    <p className="meta">{s.b}</p>
                  </div>
                  <span className="btn btn--secondary" aria-disabled="true">
                    {d.storeSoon}
                  </span>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* Systeemeisen */}
        <Reveal className="panel stack stack-4">
          <h2 className="heading">{d.reqTitle}</h2>
          <dl className="req">
            {d.req.map((r) => (
              <div key={r.k} className="req__row">
                <dt className="label">{r.k}</dt>
                <dd className="body req__val">{r.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Wachtlijst */}
        <Reveal className="panel cta-panel" id="wachtlijst">
          <div className="stack stack-3">
            <h2 className="title-2">{t.waitlist.title}</h2>
            <p className="body measure">{t.waitlist.body}</p>
          </div>
          <WaitlistForm />
        </Reveal>
      </div>
    </section>
  )
}
