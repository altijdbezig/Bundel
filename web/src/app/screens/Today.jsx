import { Link } from 'react-router-dom'
import { fill, useI18n } from '../../i18n'
import { useAppState } from '../state'
import EmptyState from '../EmptyState'
import { IconCalendar, IconTasks } from '../../components/Icons'
import { getAssignments, getGroups, getRecentGrades, getToday } from '../data'

export default function Today() {
  const { t, lang } = useI18n()
  const { done, toggleDone } = useAppState()
  const c = t.app.today

  const today = getToday(lang)
  const assignments = getAssignments(lang)
  const open = assignments.filter((a) => !done[a.id])
  const recent = getRecentGrades(lang)
  const group = getGroups(lang)[0]

  return (
    <div className="screen">
      <header className="screen__head">
        <div className="stack stack-2">
          <span className="label">{today.label}</span>
          <h1 className="screen__title">{today.title}</h1>
        </div>
        <span className="meta">{fill(c.summary, { lessons: today.lessons.length, tasks: open.length })}</span>
      </header>

      <div className="screen__cols">
        <section className="card stack stack-3">
          <span className="label">{c.scheduleLabel}</span>
          {today.lessons.length === 0 && (
            <EmptyState title={t.app.empty.lessons} hint={t.app.empty.lessonsHint} icon={IconCalendar} />
          )}

          <div className="stack">
            {today.lessons.map((l) => (
              <div key={l.time} className={`lesson ${l.now ? 'is-now' : ''}`}>
                <span className="lesson__time data">{l.time}</span>
                <span className="lesson__name">{l.subject}</span>
                {l.now && <span className="badge badge--ok lesson__now">{c.now}</span>}
                <span className="lesson__room meta">{l.room}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card stack stack-3">
          <div className="screen__cardHead">
            <span className="label">{c.tasksLabel}</span>
            <Link to="/app/opdrachten" className="meta">
              {c.all}
            </Link>
          </div>

          {open.length === 0 ? (
            <EmptyState title={t.app.empty.tasks} hint={t.app.empty.tasksHint} icon={IconTasks} />
          ) : (
            <div className="stack">
              {open.slice(0, 4).map((a) => (
                <div key={a.id} className="task">
                  <button
                    type="button"
                    className="task__check"
                    aria-label={t.app.assignments.markDone}
                    onClick={() => toggleDone(a.id)}
                  />
                  <span className="dot dot--sm" style={{ background: a.sourceColor }} title={a.sourceName} />
                  <span className="task__title">{a.title}</span>
                  <span className={`task__due meta ${a.urgent ? 'is-urgent' : ''}`}>{a.due}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card stack stack-3">
          <span className="label">{c.recent}</span>
          <div className="stack stack-2">
            {recent.map((g) => (
              <div key={g.subject} className="recent">
                <span className="recent__text">
                  <span className="recent__subject">{g.subject}</span>
                  <span className="meta">{g.what}</span>
                </span>
                <span className={`recent__mark data ${g.mark >= 8 ? 'is-high' : ''} ${g.mark < 5.5 ? 'is-low' : ''}`}>
                  {g.mark.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card stack stack-3">
          <div className="screen__cardHead">
            <span className="label">{c.groupLabel}</span>
            <Link to="/app/groepen" className="meta">
              {c.all}
            </Link>
          </div>
          <div className="stack stack-2">
            <span className="card-title">{group.name}</span>
            <span className="meta">
              {group.members.length} {t.app.groups.members} · {t.app.groups.linkedTo} {group.subject}
            </span>
          </div>
          <div className="avatars">
            {group.members.map((m) => (
              <span key={m.initials} className={`avatar ${m.self ? 'is-self' : ''}`} title={m.name}>
                {m.initials}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
