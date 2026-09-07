import Reveal from '../components/Reveal'
import { Mark } from '../components/Logo'
import { useI18n } from '../i18n'

export default function About() {
  const { t } = useI18n()
  const a = t.about

  return (
    <section className="section">
      <div className="page prose">
        <Reveal className="stack stack-4 prose__head">
          <span className="label">{a.eyebrow}</span>
          <h1 className="title-1">{a.title}</h1>
          <p className="body-lg measure">{a.lead}</p>
        </Reveal>

        <div className="stack stack-5 prose__body">
          {a.sections.map((s, i) => (
            <Reveal key={s.h} className="stack stack-2" delay={i * 50}>
              <h2 className="heading">{s.h}</h2>
              <p className="body measure-lg">{s.p}</p>
            </Reveal>
          ))}

          <Reveal className="panel about-team">
            <span className="about-team__mark" aria-hidden="true">
              <Mark size={34} />
            </span>
            <div className="stack stack-2">
              <h2 className="heading">{a.teamTitle}</h2>
              <p className="body measure">{a.teamBody}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
