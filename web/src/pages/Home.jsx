import { Link } from 'react-router-dom'
import AppPreview from '../components/AppPreview'
import Reveal from '../components/Reveal'
import WaitlistForm from '../components/WaitlistForm'
import { Circles } from '../components/Logo'
import {
  IconToday,
  IconTasks,
  IconCalendar,
  IconGrades,
  IconGroups,
  IconSources,
  IconShield,
  IconLock,
  IconUnlink,
  IconGlobe,
  IconMonitor,
  IconPhone,
  IconArrow,
} from '../components/Icons'
import { useI18n } from '../i18n'

const featureIcons = [IconToday, IconTasks, IconCalendar, IconGrades, IconGroups, IconSources]
const privacyIcons = [IconShield, IconLock, IconUnlink]
const platformIcons = [IconGlobe, IconMonitor, IconPhone]

const SOURCES = [
  { name: 'Canvas', color: 'var(--source-canvas)' },
  { name: 'Microsoft Teams', color: 'var(--source-teams)' },
  { name: 'Magister', color: 'var(--source-magister)' },
  { name: 'Bundel', color: 'var(--source-own)' },
]

export default function Home() {
  const { t } = useI18n()
  const h = t.home

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="page hero__inner">
          <Reveal className="hero__copy stack stack-5">
            <span className="label">{h.eyebrow}</span>
            <h1 className="display">{h.title}</h1>
            <p className="body-lg measure">{h.lead}</p>
            <div className="row">
              <Link to="/login" className="btn btn--primary btn--lg">
                {h.ctaLogin}
              </Link>
              <Link to="/download" className="btn btn--secondary btn--lg">
                {h.ctaDownload}
              </Link>
            </div>
            <span className="meta">{h.ctaHint}</span>
          </Reveal>

          <Reveal className="hero__visual" delay={120}>
            <AppPreview />
          </Reveal>
        </div>
      </section>

      {/* ---------- Bronnen ---------- */}
      <section className="sources">
        <div className="page">
          <Reveal className="sources__inner">
            <span className="label">{h.sourcesLabel}</span>
            <div className="sources__list">
              {SOURCES.map((s) => (
                <span key={s.name} className="sources__item">
                  <span className="dot" style={{ background: s.color }} />
                  {s.name}
                </span>
              ))}
            </div>
            <span className="meta sources__note">{h.sourcesNote}</span>
          </Reveal>
        </div>
      </section>

      {/* ---------- Probleem ---------- */}
      <section className="section section--hair">
        <div className="page stack stack-6">
          <Reveal className="stack stack-4">
            <span className="label">{h.problemLabel}</span>
            <h2 className="title-1 measure">{h.problemTitle}</h2>
            <p className="body measure-lg">{h.problemBody}</p>
          </Reveal>

          <div className="grid-3">
            {h.problems.map((p, i) => (
              <Reveal key={p.t} className="card stack stack-2" delay={i * 70}>
                <span className="data ink-600">0{i + 1}</span>
                <h3 className="card-title">{p.t}</h3>
                <p className="meta">{p.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Functies ---------- */}
      <section className="section section--hair" id="functies">
        <div className="page stack stack-6">
          <Reveal className="stack stack-4">
            <span className="label">{h.solutionLabel}</span>
            <h2 className="title-1 measure">{h.solutionTitle}</h2>
            <p className="body measure-lg">{h.solutionBody}</p>
          </Reveal>

          <Reveal className="stack stack-2">
            <span className="label">{h.featuresLabel}</span>
            <h3 className="title-2">{h.featuresTitle}</h3>
          </Reveal>

          <div className="grid-3">
            {h.features.map((f, i) => {
              const Ico = featureIcons[i]
              return (
                <Reveal key={f.t} className="card feature stack stack-3" delay={(i % 3) * 70}>
                  <span className="feature__icon">
                    <Ico size={24} />
                  </span>
                  <h4 className="card-title">{f.t}</h4>
                  <p className="meta">{f.b}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------- Eerlijk over de grenzen ---------- */}
      <section className="section section--hair">
        <div className="page">
          <Reveal className="honest">
            <div className="stack stack-3 honest__intro">
              <span className="label">{h.honestLabel}</span>
              <h2 className="title-2">{h.honestTitle}</h2>
            </div>
            <ul className="honest__list">
              {h.honest.map((line) => (
                <li key={line} className="honest__item">
                  <span className="honest__bullet" aria-hidden="true" />
                  <span className="body">{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------- Privacy ---------- */}
      <section className="section">
        <div className="page">
          <Reveal className="privacy-block">
            <div className="privacy-block__head">
              <div className="stack stack-4">
                <span className="label label--onbrand">{h.privacyLabel}</span>
                <h2 className="title-1 privacy-block__title">{h.privacyTitle}</h2>
                <p className="privacy-block__body measure">{h.privacyBody}</p>
                <Link to="/privacy" className="btn btn--onbrand">
                  {h.privacyCta}
                  <IconArrow size={17} />
                </Link>
              </div>
              <span className="privacy-block__mark" aria-hidden="true">
                <Circles size={132} color="#FFFFFF" />
              </span>
            </div>

            <div className="privacy-block__grid">
              {h.privacyPoints.map((p, i) => {
                const Ico = privacyIcons[i]
                return (
                  <div key={p.t} className="privacy-point">
                    <span className="privacy-point__icon">
                      <Ico size={22} />
                    </span>
                    <h3 className="privacy-point__title">{p.t}</h3>
                    <p className="privacy-point__body">{p.b}</p>
                  </div>
                )
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Platforms ---------- */}
      <section className="section section--hair">
        <div className="page stack stack-6">
          <Reveal className="stack stack-3">
            <span className="label">{h.platformsLabel}</span>
            <h2 className="title-1">{h.platformsTitle}</h2>
          </Reveal>

          <div className="grid-3">
            {h.platforms.map((p, i) => {
              const Ico = platformIcons[i]
              const isWeb = i === 0
              const isDesktop = i === 1
              return (
                <Reveal key={p.t} className="card platform stack stack-3" delay={i * 70}>
                  <span className="platform__top">
                    <span className="feature__icon">
                      <Ico size={24} />
                    </span>
                    <span className="badge">{p.state}</span>
                  </span>
                  <h3 className="heading">{p.t}</h3>
                  <p className="meta platform__body">{p.b}</p>
                  {isWeb && (
                    <Link to="/login" className="btn btn--secondary btn--block">
                      {p.cta}
                    </Link>
                  )}
                  {isDesktop && (
                    <Link to="/download" className="btn btn--secondary btn--block">
                      {p.cta}
                    </Link>
                  )}
                  {!isWeb && !isDesktop && (
                    <span className="btn btn--secondary btn--block" aria-disabled="true">
                      {p.cta}
                    </span>
                  )}
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section section--hair">
        <div className="page faq">
          <Reveal className="stack stack-3 faq__head">
            <span className="label">{h.faqLabel}</span>
            <h2 className="title-1">{h.faqTitle}</h2>
          </Reveal>

          <Reveal className="faq__list">
            {h.faq.map((item) => (
              <details key={item.q} className="faq__item">
                <summary className="faq__q">
                  <span>{item.q}</span>
                  <span className="faq__sign" aria-hidden="true" />
                </summary>
                <p className="body faq__a">{item.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------- Wachtlijst ---------- */}
      <section className="section section--hair" id="wachtlijst">
        <div className="page">
          <Reveal className="panel cta-panel">
            <div className="stack stack-3">
              <h2 className="title-2">{h.ctaTitle}</h2>
              <p className="body measure">{h.ctaBody}</p>
            </div>
            <WaitlistForm />
          </Reveal>
        </div>
      </section>
    </>
  )
}
