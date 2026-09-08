import { useNavigate } from 'react-router-dom'
import { fill, useI18n } from '../i18n'
import { useAppState } from './state'
import Dialog, { DialogFacts, DialogSection } from './Dialog'
import OpenInSource from './OpenInSource'
import { signalLine } from './signal'
import {
  getSubjectAttendance,
  getSubjectDetail,
  getSubjectSignal,
  sourceColor,
  sourceName,
  ATTENDANCE_LIMIT,
} from './data'

const markClass = (value) => (value < 5.5 ? 'is-low' : value >= 8 ? 'is-high' : '')
const rateClass = (rate) => (rate < ATTENDANCE_LIMIT ? 'is-low' : rate === 100 ? 'is-high' : '')

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
  const signal = getSubjectSignal(lesson.subjectKey, lang, done)
  const attendance = getSubjectAttendance(lesson.subjectKey, lang)
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
      {/* Signaal bovenaan: alleen als er echt iets is, met de reden erbij. */}
      {signal.reasons.length > 0 && (
        <div className={`signal ${signal.level === 'high' ? 'is-high' : ''}`}>
          <span className="signal__title">
            {signal.reasons.length > 1 ? t.app.signal.title : t.app.signal.titleOne}
          </span>
          <ul className="signal__list">
            {signal.reasons.map((reason) => (
              <li key={reason.kind}>{signalLine(reason, t)}</li>
            ))}
          </ul>
          <span className="signal__note">{t.app.signal.note}</span>
        </div>
      )}

      <DialogFacts
        items={[
          { label: c.when, value: `${day ? `${day.day} ${day.date}` : ''} ${lesson.time} - ${lesson.end}`.trim() },
          { label: c.duration, value: length },
          { label: t.app.schedule.hourLabel, value: lesson.hours ?? null },
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
          <div className="stack">
            {detail.grade.entries.map((e) => (
              <div key={e.id} className="dlg__row">
                <span className="data dlg__rowTime">{e.date}</span>
                <span className="dlg__rowTitle">{e.what}</span>
                <span className={`data ${markClass(e.value)}`}>{e.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}
      </DialogSection>

      {attendance && (
        <DialogSection title={t.app.attendance.title} action={t.app.attendance.title} onAction={() => go('/app/aanwezigheid')}>
          <div className="dlg__rate">
            <span className={`dlg__rateValue ${rateClass(attendance.rate)}`}>{attendance.rate}%</span>
            <span className="stack stack-2 dlg__rateSide">
              <span className="ratebar">
                <span
                  className={`ratebar__fill ${rateClass(attendance.rate)}`}
                  style={{ width: `${attendance.rate}%` }}
                />
              </span>
              <span className="meta">
                {fill(t.app.attendance.ofLessons, { attended: attendance.attended, counted: attendance.counted })}
                {attendance.late > 0 || attendance.absent > 0
                  ? ` · ${fill(t.app.attendance.counts, { late: attendance.late, absent: attendance.absent })}`
                  : ''}
              </span>
            </span>
          </div>
        </DialogSection>
      )}

      <OpenInSource source="magister" url={lesson.sourceUrl} />

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
