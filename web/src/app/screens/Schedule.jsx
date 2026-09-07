import { useI18n } from '../../i18n'
import { getWeek } from '../data'

export default function Schedule() {
  const { t, lang } = useI18n()
  const c = t.app.schedule
  const week = getWeek(lang)

  return (
    <div className="screen">
      <header className="screen__head">
        <div className="stack stack-2">
          <h1 className="screen__title">{c.title}</h1>
          <span className="meta">{c.subtitle}</span>
        </div>
      </header>

      <div className="week">
        {week.map((d) => (
          <section key={d.date} className={`week__day ${d.today ? 'is-today' : ''}`}>
            <header className="week__head">
              <span className="week__name">{d.day}</span>
              <span className="week__date data">{d.date}</span>
            </header>

            {d.today && <span className="badge badge--ok week__badge">{c.today}</span>}

            <div className="stack stack-2">
              {d.lessons.length === 0 && <span className="meta">{c.empty}</span>}
              {d.lessons.map((l) => (
                <div key={l.time + l.subject} className="week__lesson">
                  <span className="data week__time">{l.time}</span>
                  <span className="week__subject">{l.subject}</span>
                  <span className="meta">{l.room}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
