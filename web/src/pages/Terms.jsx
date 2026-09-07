import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import ContactCard from '../components/ContactCard'
import { useI18n } from '../i18n'

export default function Terms() {
  const { t } = useI18n()
  const v = t.terms

  return (
    <section className="section">
      <div className="page prose">
        <Reveal className="stack stack-4 prose__head">
          <span className="label">{v.updated}</span>
          <h1 className="title-1">{v.title}</h1>
          <p className="body-lg measure">{v.intro}</p>
          <Link to="/privacy" className="meta">
            {t.footer.links.privacy}
          </Link>
        </Reveal>

        <div className="stack stack-5 prose__body">
          {v.sections.map((s, i) => (
            <Reveal key={s.h} className="stack stack-2" delay={i * 50}>
              <h2 className="heading">{s.h}</h2>
              <p className="body measure-lg">{s.p}</p>
            </Reveal>
          ))}

          <Reveal>
            <ContactCard />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
