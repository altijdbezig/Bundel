import { useNavigate } from 'react-router-dom'
import { fill, useI18n } from '../i18n'
import { useAppState } from './state'
import Dialog, { DialogFacts, DialogSection } from './Dialog'
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
    <Dialog
      open
      onClose={onClose}
      eyebrow={sourceName('magister', lang)}
      dot={sourceColor('magister')}
      title={lesson.subject}
    >
      <DialogFacts
        items={[
          { label: c.when, value: `${day ? `${day.day} ${day.date}` : ''} ${lesson.time} - ${lesson.end}`.trim() },
          { label: c.duration, value: length },
          { label: c.room, value: lesson.room },
          { label: c.teacher, value: lesson.teacher },
        ]}
      />

      <DialogSection title={c.assignments} action={c.toAssignments} onAction={() => go('/app/opdrachten')}>
        {detail.assignments.length === 0 && <p className="meta">{c.noAssignments}</p>}
        <div className="stack">
          {detail.assignments.map((a) => {
            const isDone = !!done[a.id]
            return (
              <div key={a.id} className={`dlg__row ${isDone ? 'is-done' : ''}`}>
                <span className="dot dot--sm" style={{ background: a.sourceColor }} title={a.sourceName} />
                <span className="dlg__rowTitle">{a.title}</span>
                <span className={`meta ${a.urgent && !isDone ? 'is-urgent' : ''}`}>{isDone ? c.done : a.due}</span>
              </div>
            )
          })}
        </div>
      </DialogSection>

      <DialogSection title={c.grades} action={c.toGrades} onAction={() => go('/app/cijfers')}>
        {!detail.grade && <p className="meta">{c.noGrades}</p>}
        {detail.grade && (
          <div className="dlg__grades">
            <span className="grade__marks">
              {detail.grade.marks.map((m, i) => (
                <span key={i} className={`grade__mark data ${markClass(m)}`}>
                  {m.toFixed(1)}
                </span>
              ))}
            </span>
            <span className="dlg__average">
              <span className={`grade__averageValue ${markClass(detail.grade.average)}`}>
                {detail.grade.average.toFixed(1)}
              </span>
              <span className="label">{c.average}</span>
            </span>
          </div>
        )}
      </DialogSection>

      <DialogSection
        title={c.group}
        action={detail.group ? c.toGroups : null}
        onAction={detail.group ? () => go('/app/groepen') : null}
      >
        {!detail.group && <p className="meta">{c.noGroup}</p>}
        {detail.group && (
          <div className="dlg__group">
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
      </DialogSection>
    </Dialog>
  )
}
