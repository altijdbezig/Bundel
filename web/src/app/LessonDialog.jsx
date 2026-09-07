import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconClose, IconArrow } from '../components/Icons'
import { fill, useI18n } from '../i18n'
import { useAppState } from './state'
import { getSubjectDetail, sourceColor, sourceName } from './data'

const markClass = (value) => (value < 5.5 ? 'is-low' : value >= 8 ? 'is-high' : '')

/**
 * Venster met alles wat bij een les hoort: de les zelf, de opdrachten voor
 * dat vak, je cijfers en de projectgroep. Opent vanuit het rooster en
 * vanuit Vandaag.
 */
export default function LessonDialog({ lesson, day, onClose }) {
  const { t, lang } = useI18n()
  const c = t.app.lesson
  const navigate = useNavigate()
  const { done } = useAppState()

  useEffect(() => {
    if (!lesson) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lesson, onClose])

  if (!lesson) return null

  const detail = getSubjectDetail(lesson.subjectKey, lang)
  const minutes = lesson.finish - lesson.start
  const length =
    minutes < 60
      ? fill(c.minutes, { count: minutes })
      : fill(c.hoursShort, { hours: Math.floor(minutes / 60), minutes: minutes % 60 })

  function go(to) {
    onClose()
    navigate(to)
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={lesson.subject}>
      <button type="button" className="overlay__backdrop" aria-label={c.close} onClick={onClose} />

      <div className="lessondlg">
        <header className="lessondlg__head">
          <div className="stack stack-2">
            <span className="row lessondlg__source">
              <span className="dot dot--sm" style={{ background: sourceColor('magister') }} />
              <span className="label">{sourceName('magister', lang)}</span>
            </span>
            <h2 className="title-2">{lesson.subject}</h2>
          </div>
          <button type="button" className="searchbox__close" onClick={onClose} aria-label={c.close}>
            <IconClose size={18} />
          </button>
        </header>

        <div className="lessondlg__body">
          <dl className="lessondlg__facts">
            <div>
              <dt className="label">{c.when}</dt>
              <dd>
                {day ? `${day.day} ${day.date}` : ''}
                <span className="data lessondlg__time">
                  {lesson.time} - {lesson.end}
                </span>
              </dd>
            </div>
            <div>
              <dt className="label">{c.duration}</dt>
              <dd className="data">{length}</dd>
            </div>
            <div>
              <dt className="label">{c.room}</dt>
              <dd>{lesson.room}</dd>
            </div>
            <div>
              <dt className="label">{c.teacher}</dt>
              <dd>{lesson.teacher}</dd>
            </div>
          </dl>

          {/* Opdrachten voor dit vak */}
          <section className="lessondlg__section">
            <header className="lessondlg__sectionHead">
              <span className="card-title">{c.assignments}</span>
              <button type="button" className="lessondlg__link" onClick={() => go('/app/opdrachten')}>
                {c.toAssignments}
                <IconArrow size={15} />
              </button>
            </header>

            {detail.assignments.length === 0 && <p className="meta">{c.noAssignments}</p>}

            <div className="stack">
              {detail.assignments.map((a) => {
                const isDone = !!done[a.id]
                return (
                  <div key={a.id} className={`lessondlg__task ${isDone ? 'is-done' : ''}`}>
                    <span className="dot dot--sm" style={{ background: a.sourceColor }} title={a.sourceName} />
                    <span className="lessondlg__taskTitle">{a.title}</span>
                    <span className={`meta ${a.urgent && !isDone ? 'lessondlg__urgent' : ''}`}>
                      {isDone ? c.done : a.due}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Cijfers voor dit vak */}
          <section className="lessondlg__section">
            <header className="lessondlg__sectionHead">
              <span className="card-title">{c.grades}</span>
              <button type="button" className="lessondlg__link" onClick={() => go('/app/cijfers')}>
                {c.toGrades}
                <IconArrow size={15} />
              </button>
            </header>

            {!detail.grade && <p className="meta">{c.noGrades}</p>}

            {detail.grade && (
              <div className="lessondlg__grades">
                <span className="grade__marks">
                  {detail.grade.marks.map((m, i) => (
                    <span key={i} className={`grade__mark data ${markClass(m)}`}>
                      {m.toFixed(1)}
                    </span>
                  ))}
                </span>
                <span className="lessondlg__average">
                  <span className={`grade__averageValue ${markClass(detail.grade.average)}`}>
                    {detail.grade.average.toFixed(1)}
                  </span>
                  <span className="label">{c.average}</span>
                </span>
              </div>
            )}
          </section>

          {/* Projectgroep */}
          <section className="lessondlg__section">
            <header className="lessondlg__sectionHead">
              <span className="card-title">{c.group}</span>
              {detail.group && (
                <button type="button" className="lessondlg__link" onClick={() => go('/app/groepen')}>
                  {c.toGroups}
                  <IconArrow size={15} />
                </button>
              )}
            </header>

            {!detail.group && <p className="meta">{c.noGroup}</p>}

            {detail.group && (
              <div className="lessondlg__group">
                <span className="card-title">{detail.group.name}</span>
                <span className="avatars">
                  {detail.group.members.map((m) => (
                    <span key={m.initials} className={`avatar ${m.self ? 'is-self' : ''}`} title={m.name}>
                      {m.initials}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
