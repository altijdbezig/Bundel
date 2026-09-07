import Reveal from '../components/Reveal'
import { useI18n } from '../i18n'

export default function Privacy() {
  const { t } = useI18n()
  const p = t.privacy

  return (
    <section className="section">
      <div className="page prose">
        <Reveal className="stack stack-4 prose__head">
          <span className="label">{p.updated}</span>
          <h1 className="title-1">{p.title}</h1>
          <p className="body-lg measure">{p.intro}</p>
        </Reveal>

        <div className="stack stack-5 prose__body">
          {p.sections.map((s, i) => (
            <Reveal key={s.h} className="stack stack-2" delay={i * 50}>
              <h2 className="heading">{s.h}</h2>
              <p className="body measure-lg">{s.p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
