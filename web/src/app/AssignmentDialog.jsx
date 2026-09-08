import { useNavigate } from 'react-router-dom'
import { fill, useI18n } from '../i18n'
import { useAppState } from './state'
import Dialog, { DialogFacts, DialogSection } from './Dialog'
import OpenInSource from './OpenInSource'
import StatusBadge from './StatusBadge'
import { getWeek, CURRENT_WEEK_INDEX } from './data'

/** Venster met alles wat bij een opdracht hoort. */
export default function AssignmentDialog({ assignment, onClose }) {
  const { t, lang } = useI18n()
  const c = t.app.assignments.detail
  const navigate = useNavigate()
  const { done, toggleDone } = useAppState()

  if (!assignment) return null

  const isDone = !!done[assignment.id]

  /* Lessen in dit vak deze week, zodat je ziet wanneer je eraan kunt werken. */
  const lessons = getWeek(lang, CURRENT_WEEK_INDEX).flatMap((d) =>
    d.lessons.filter((l) => l.subjectKey === assignment.subjectKey).map((l) => ({ ...l, day: d.day, date: d.date })),
  )

  function go(to) {
    onClose()
    navigate(to)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      eyebrow={assignment.sourceName}
      dot={assignment.sourceColor}
      title={assignment.title}
    >
      <DialogFacts
        items={[
          { label: c.subject, value: assignment.subject },
          { label: c.due, value: `${assignment.due}${assignment.dueTime ? ` · ${assignment.dueTime}` : ''}` },
          { label: c.source, value: assignment.sourceName },
          { label: c.status, value: <StatusBadge status={assignment.status} source={assignment.sourceName} /> },
          { label: t.app.status.ownTick, value: isDone ? c.finished : c.open },
        ]}
      />

      <DialogSection title={c.lessons} action={c.toSchedule} onAction={() => go('/app/rooster')}>
        {lessons.length === 0 && <p className="meta">{c.noLessons}</p>}
        <div className="stack">
          {lessons.map((l) => (
            <div key={l.date + l.time} className="dlg__row">
              <span className="data dlg__rowTime">{l.time}</span>
              <span className="dlg__rowTitle">
                {l.day} · {l.room}
              </span>
              <span className="meta">{l.teacher}</span>
            </div>
          ))}
        </div>
      </DialogSection>

      <OpenInSource source={assignment.source} url={assignment.sourceUrl} />

      <div className="dlg__foot">
        <button
          type="button"
          className={isDone ? 'btn btn--secondary' : 'btn btn--primary'}
          onClick={() => toggleDone(assignment.id)}
        >
          {isDone ? c.markOpen : c.markDone}
        </button>
      </div>
    </Dialog>
  )
}

/** Kleine helper zodat de tekst met tellers op een plek staat. */
export function assignmentBar(t, counts) {
  return fill(t.app.assignments.bar, counts)
}
