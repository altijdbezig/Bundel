import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fill, useI18n } from '../../i18n'
import { useAppState } from '../state'
import EmptyState from '../EmptyState'
import LessonDialog from '../LessonDialog'
import { signalLine } from '../signal'
import GradeDialog from '../GradeDialog'
import ScreenHeader from '../ScreenHeader'
import { IconCalendar } from '../../components/Icons'
import { getGroups, getRecentGrades, getSignals, getTimeline, getToday } from '../data'

const markClass = (value) => (value < 5.5 ? 'is-low' : value >= 8 ? 'is-high' : '')

export default function Today() {
  const { t, lang } = useI18n()
  const { done, toggleDone, ownItems } = useAppState()
  const [openLesson, setOpenLesson] = useState(null)
  const [openGrade, setOpenGrade] = useState(null)
  const c = t.app.today

  const today = getToday(lang)
  const timeline = getTimeline(lang, ownItems)
  const signals = getSignals(lang, done)
  const recent = getRecentGrades(lang)
  const group = getGroups(lang)[0]

  const lessonCount = timeline.filter((i) => i.kind === 'lesson').length
  const deadlineCount = timeline.filter((i) => i.kind === 'deadline').length
  const shown = signals.slice(0, 2)

  return (
    <div className="screen">
      <ScreenHeader
        title={today.title}
        subtitle={fill(c.summary, { lessons: lessonCount, tasks: deadlineCount })}
      />

      {/* Wat er speelt bij je vakken. Staat er niet als er niets is. */}
      {shown.length > 0 && (
        <section className="signal signal--today">
          <div className="signal__head">
            <span className="signal__title">
              {shown.length > 1 ? t.app.signal.todayTitle : t.app.signal.todayTitleOne}
            </span>
            <Link to="/app/rooster" className="meta signal__link">
              {t.app.signal.todayLink}
            </Link>
          </div>

          <ul className="signal__list">
            {shown.map((s) => (
              <li key={s.subjectKey}>
                <strong>{s.subject}</strong> · {signalLine(s.reasons[0], t)}
              </li>
            ))}
          </ul>

          {signals.length > shown.length && (
            <span className="signal__note">
              {fill(signals.length - shown.length === 1 ? t.app.signal.more : t.app.signal.morePlural, {
                count: signals.length - shown.length,
              })}
            </span>
          )}
        </section>
      )}

      {/* ---------- De dag als tijdlijn: lessen en deadlines door elkaar ---------- */}
      <section className="card stack stack-3">
        <span className="label">{c.timeline}</span>

        {timeline.length === 0 && <EmptyState title={c.nothing} icon={IconCalendar} />}

        <ol className="tl">
          {timeline.map((item) => {
            const isLesson = item.kind === 'lesson'
            const isDone = !isLesson && !!done[item.id]

            return (
              <li
                key={item.key}
                className={`tl__item ${item.now ? 'is-now' : ''} ${item.past && !item.now ? 'is-past' : ''}`}
              >
                <span className="tl__time data">{isLesson ? item.time : (item.dueTime ?? '')}</span>

                <span className="tl__rail" aria-hidden="true">
                  <span className={`tl__marker ${isLesson ? '' : 'is-deadline'}`} />
                </span>

                {item.kind === 'own' ? (
                  <span className="tl__body tl__body--own">
                    <span className="tl__row">
                      <span className="tl__titleRow">
                        <span className="dot dot--sm" style={{ background: 'var(--source-own)' }} />
                        <span className="tl__title">{item.title}</span>
                      </span>
                      {item.place && <span className="meta tl__room">{item.place}</span>}
                    </span>
                    <span className="meta tl__sub">
                      {t.app.own.kinds[item.ownKind] ?? t.app.own.mine}
                      {item.end ? ` · ${item.time} tot ${item.end}` : ''}
                    </span>
                  </span>
                ) : isLesson ? (
                  <button type="button" className="tl__body" onClick={() => setOpenLesson(item)}>
                    <span className="tl__row">
                      <span className="tl__title">{item.subject}</span>
                      <span className="meta tl__room">{item.room}</span>
                    </span>
                    <span className="meta tl__sub">
                      {item.time} tot {item.end} · {item.teacher}
                    </span>
                    {item.now && (
                      <span className="tl__now">
                        {item.remaining > 0
                          ? fill(c.nowFor, { minutes: item.remaining })
                          : fill(c.nowEnds, { time: item.end })}
                      </span>
                    )}
                  </button>
                ) : (
                  <span className={`tl__body tl__body--deadline ${isDone ? 'is-done' : ''}`}>
                    <span className="tl__row">
                      <span className="tl__titleRow">
                        <button
                          type="button"
                          className={`task__check ${isDone ? 'is-checked' : ''}`}
                          aria-label={t.app.assignments.markDone}
                          aria-pressed={isDone}
                          onClick={() => toggleDone(item.id)}
                        />
                        <span className="dot dot--sm" style={{ background: item.sourceColor }} title={item.sourceName} />
                        <span className="tl__title">{item.title}</span>
                      </span>
                      <Link to="/app/opdrachten" className="meta">
                        {c.all}
                      </Link>
                    </span>
                    <span className="meta tl__sub">
                      {c.deadline} · {item.subject} · {item.sourceName}
                    </span>
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      {/* ---------- Cijfers en groep als tweede rij ---------- */}
      <div className="screen__cols">
        <section className="card stack stack-3">
          <div className="screen__cardHead">
            <span className="label">{c.recent}</span>
            <Link to="/app/cijfers" className="meta">
              {c.all}
            </Link>
          </div>
          <div className="stack stack-2">
            {recent.slice(0, 3).map((g) => (
              <button key={g.id} type="button" className="recent" onClick={() => setOpenGrade(g)}>
                <span className="recent__text">
                  <span className="recent__subject">{g.subject}</span>
                  <span className="meta">
                    {g.what} · {g.date}
                  </span>
                </span>
                <span className={`recent__mark data ${markClass(g.value)}`}>{g.value.toFixed(1)}</span>
              </button>
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

      <LessonDialog lesson={openLesson} day={{ day: today.title, date: '' }} onClose={() => setOpenLesson(null)} />
      <GradeDialog entry={openGrade} onClose={() => setOpenGrade(null)} />
    </div>
  )
}
