import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fill, useI18n } from '../../i18n'
import { IconTasks, IconCalendar, IconChevron } from '../../components/Icons'
import EmptyState from '../EmptyState'
import LessonDialog from '../LessonDialog'
import { getWeek, getWeeks, getWeekBounds, sourceColor, CURRENT_WEEK_INDEX, DEMO_NOW_MINUTES } from '../data'

/* Hoogte van het raster: pixels per minuut. Een les van 50 min wordt zo 65px,
   net genoeg voor tijd, vak en lokaal zonder dat de tekst uit het blok loopt. */
const PX_PER_MINUTE = 1.3
const PADDING_MINUTES = 30

/* Onder deze duur laat het blok de docent weg, anders past het niet. */
const SHORT_LESSON = 55

const toClock = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/** De inhoud van een lesblok. Gedeeld door het raster en de agenda-lijst. */
function LessonBody({ lesson, t, compact = false }) {
  return (
    <>
      <span className="block__subject">{lesson.subject}</span>
      <span className="block__meta">
        <span className="dot dot--sm" style={{ background: sourceColor('magister') }} title={t.app.schedule.source} />
        {lesson.room}
        {!compact && lesson.teacher ? ` · ${lesson.teacher}` : ''}
      </span>
      {lesson.deadline && (
        <span className="block__deadline" title={t.app.schedule.deadlineTitle}>
          <IconTasks size={13} />
          {t.app.schedule.deadline}
        </span>
      )}
    </>
  )
}

export default function Schedule() {
  const { t, lang } = useI18n()
  const c = t.app.schedule

  const weeks = getWeeks(lang)
  const [params, setParams] = useSearchParams()

  /* De week staat in de URL, zodat een zoekresultaat de juiste week opent.
     Zonder parameter openen we de huidige week, niet week 0. */
  const raw = params.get('week')
  const fromUrl = raw === null || raw === '' ? Number.NaN : Number(raw)
  const initial = Number.isInteger(fromUrl) && weeks[fromUrl] ? fromUrl : CURRENT_WEEK_INDEX
  const [index, setIndex] = useState(initial)
  const [open, setOpen] = useState(null)

  const week = weeks[index]
  const days = getWeek(lang, index)
  const bounds = getWeekBounds()

  const goto = (next) => {
    if (next < 0 || next >= weeks.length) return
    setIndex(next)
    setParams(next === CURRENT_WEEK_INDEX ? {} : { week: String(next) }, { replace: true })
  }

  /* Pijltjestoetsen bladeren, maar niet terwijl de pop-up open staat. */
  useEffect(() => {
    if (open) return
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return
      if (e.key === 'ArrowLeft') goto(index - 1)
      if (e.key === 'ArrowRight') goto(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  /* Raster loopt van een half uur voor de eerste les tot een half uur na de laatste. */
  const from = Math.floor((bounds.from - PADDING_MINUTES) / 30) * 30
  const to = Math.ceil((bounds.to + PADDING_MINUTES) / 30) * 30
  const height = (to - from) * PX_PER_MINUTE

  const hours = []
  for (let m = Math.ceil(from / 60) * 60; m <= to; m += 60) hours.push(m)

  const now = DEMO_NOW_MINUTES
  const showNow = week.current && now > from && now < to
  const todayIndex = days.findIndex((d) => d.today)

  const offset = (minutes) => (minutes - from) * PX_PER_MINUTE
  const openLesson = (lesson, day) => setOpen({ lesson, day })

  return (
    <div className="screen">
      <header className="screen__head">
        <div className="stack stack-2">
          <h1 className="screen__title">{c.title}</h1>
          <span className="meta row">
            <span className="dot dot--sm" style={{ background: sourceColor('magister') }} />
            {c.subtitle}
          </span>
        </div>

        <div className="weeknav">
          <button
            type="button"
            className="weeknav__btn"
            onClick={() => goto(index - 1)}
            disabled={index === 0}
            aria-label={c.prev}
          >
            <IconChevron size={18} />
          </button>

          <span className="weeknav__label">
            <span className="weeknav__week">{fill(c.week, { number: week.number })}</span>
            <span className="meta">{week.range}</span>
          </span>

          <button
            type="button"
            className="weeknav__btn weeknav__btn--next"
            onClick={() => goto(index + 1)}
            disabled={index === weeks.length - 1}
            aria-label={c.next}
          >
            <IconChevron size={18} />
          </button>

          {!week.current && (
            <button type="button" className="btn btn--secondary weeknav__today" onClick={() => goto(CURRENT_WEEK_INDEX)}>
              {c.thisWeek}
            </button>
          )}

          {week.past && <span className="badge weeknav__past">{c.past}</span>}
        </div>
      </header>

      {week.note && !week.empty && <p className="notice notice--ok weeknav__note">{week.note}</p>}

      {week.empty ? (
        <section className="card">
          <EmptyState title={c.emptyWeek} hint={week.note ?? undefined} icon={IconCalendar} />
        </section>
      ) : (
        <>
          {/* ---------- Tijdraster, vanaf 700px ---------- */}
          <section className={`sched card ${week.past ? 'is-past' : ''}`}>
            <div className="sched__head">
              <span className="sched__corner" />
              {days.map((d) => (
                <div key={d.date} className={`sched__dayHead ${d.today ? 'is-today' : ''}`}>
                  <span className="sched__dayName">{d.day}</span>
                  <span className="sched__daySub">
                    <span className="sched__dayDate data">{d.date}</span>
                    {d.today && <span className="badge badge--ok sched__todayBadge">{c.today}</span>}
                  </span>
                </div>
              ))}
            </div>

            <div className="sched__body" style={{ height: `${height}px` }}>
              {/* Uurlijnen over de volle breedte, achter de kolommen */}
              {hours.map((m) => (
                <span key={m} className="sched__line" style={{ top: `${offset(m)}px` }} />
              ))}

              {/* Tijdbalk links */}
              <div className="sched__rail">
                {hours
                  .filter((m) => !showNow || Math.abs(m - now) > 20)
                  .map((m) => (
                    <span key={m} className="sched__hour data" style={{ top: `${offset(m)}px` }}>
                      {toClock(m)}
                    </span>
                  ))}
              </div>

              {days.map((d) => (
                <div key={d.date} className={`sched__col ${d.today ? 'is-today' : ''}`}>
                  {d.lessons.map((l) => {
                    const isNow = d.today && week.current && now >= l.start && now < l.finish
                    const short = l.finish - l.start < SHORT_LESSON
                    return (
                      <button
                        type="button"
                        key={l.time + l.subjectKey}
                        className={`block ${isNow ? 'is-now' : ''} ${short ? 'is-short' : ''}`}
                        style={{
                          top: `${offset(l.start)}px`,
                          height: `${(l.finish - l.start) * PX_PER_MINUTE - 3}px`,
                        }}
                        onClick={() => openLesson(l, d)}
                      >
                        <span className="block__time data">
                          {l.time}
                          {isNow && <span className="block__nowTag">{c.now}</span>}
                        </span>
                        <LessonBody lesson={l} t={t} compact={short} />
                      </button>
                    )
                  })}
                </div>
              ))}

              {/* Nu-streep, alleen in de huidige week */}
              {showNow && (
                <span
                  className="sched__now"
                  style={{ top: `${offset(now)}px`, '--day': todayIndex < 0 ? 0 : todayIndex }}
                >
                  <span className="sched__nowTime data">{toClock(now)}</span>
                  <span className="sched__nowLine" aria-hidden="true">
                    <span className="sched__nowDot" />
                  </span>
                </span>
              )}
            </div>
          </section>

          {/* ---------- Agenda-lijst, onder 700px ---------- */}
          <div className={`agenda ${week.past ? 'is-past' : ''}`}>
            {days.map((d) => (
              <section key={d.date} className={`card agenda__day ${d.today ? 'is-today' : ''}`}>
                <header className="agenda__head">
                  <span className="agenda__name">{d.day}</span>
                  <span className="agenda__date data">{d.date}</span>
                  {d.today && <span className="badge badge--ok">{c.today}</span>}
                </header>

                {d.lessons.length === 0 && <span className="meta week__empty">{c.empty}</span>}

                <div className="agenda__list">
                  {d.lessons.map((l) => {
                    const isNow = d.today && week.current && now >= l.start && now < l.finish
                    return (
                      <button
                        type="button"
                        key={l.time + l.subjectKey}
                        className={`agenda__row ${isNow ? 'is-now' : ''}`}
                        onClick={() => openLesson(l, d)}
                      >
                        <span className="agenda__times">
                          <span className="data">{l.time}</span>
                          <span className="data agenda__end">{l.end}</span>
                        </span>
                        <span className="agenda__rail" aria-hidden="true" />
                        <span className="agenda__body">
                          <LessonBody lesson={l} t={t} compact />
                          {isNow && <span className="badge badge--ok agenda__now">{c.now}</span>}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          <p className="meta sched__keys">{c.keysHint}</p>
        </>
      )}

      <LessonDialog lesson={open?.lesson} day={open?.day} onClose={() => setOpen(null)} />
    </div>
  )
}
