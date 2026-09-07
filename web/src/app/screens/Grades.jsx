import { fill, useI18n } from '../../i18n'
import { getAverage, getGrades, sourceColor, sourceName } from '../data'
import EmptyState from '../EmptyState'
import { IconGrades } from '../../components/Icons'

const markClass = (value) => (value < 5.5 ? 'is-low' : value >= 8 ? 'is-high' : '')

export default function Grades() {
  const { t, lang } = useI18n()
  const c = t.app.grades
  const grades = getGrades(lang)
  const overall = getAverage()

  return (
    <div className="screen">
      <header className="screen__head">
        <div className="stack stack-2">
          <h1 className="screen__title">{c.title}</h1>
          <span className="meta row">
            <span className="dot dot--sm" style={{ background: sourceColor('magister') }} />
            {c.subtitle} · {sourceName('magister', lang)}
          </span>
        </div>
        <div className="grades__overall">
          <span className="label">{c.overall}</span>
          <span className={`grades__overallValue data ${markClass(overall)}`}>{overall.toFixed(1)}</span>
        </div>
      </header>

      <section className="card stack">
        {grades.length === 0 && (
          <EmptyState
            title={t.app.empty.grades}
            hint={t.app.empty.gradesHint}
            to="/app/bronnen"
            linkLabel={t.app.empty.sourceLink}
            icon={IconGrades}
          />
        )}

        {grades.map((g) => (
          <div key={g.subject} className="grade">
            <span className="grade__text">
              <span className="grade__subject">{g.subject}</span>
              <span className="meta">
                {fill(g.count === 1 ? c.oneMark : c.marks, { count: g.count, last: g.last })}
              </span>
            </span>

            <span className="grade__marks">
              {g.marks.map((m, i) => (
                <span key={i} className={`grade__mark data ${markClass(m)}`}>
                  {m.toFixed(1)}
                </span>
              ))}
            </span>

            <span className="grade__average">
              <span className={`grade__averageValue ${markClass(g.average)}`}>{g.average.toFixed(1)}</span>
              <span className="label">{c.average}</span>
            </span>
          </div>
        ))}
      </section>
    </div>
  )
}
