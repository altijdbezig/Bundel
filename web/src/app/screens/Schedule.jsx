import { useI18n } from '../../i18n'
import { IconTasks } from '../../components/Icons'
import { getWeek, getWeekBounds, sourceColor, DEMO_NOW_MINUTES } from '../data'

/* Hoogte van het raster: pixels per minuut. Een les van 50 min wordt zo 55px. */
const PX_PER_MINUTE = 1.1
const PADDING_MINUTES = 30

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

  const week = getWeek(lang)
  const bounds = getWeekBounds()

  /* Raster loopt van een half uur voor de eerste les tot een half uur na de laatste. */
  const from = Math.floor((bounds.from - PADDING_MINUTES) / 30) * 30
  const to = Math.ceil((bounds.to + PADDING_MINUTES) / 30) * 30
  const height = (to - from) * PX_PER_MINUTE

  const hours = []
  for (let m = Math.ceil(from / 60) * 60; m <= to; m += 60) hours.push(m)

  const now = DEMO_NOW_MINUTES
  const nowVisible = now > from && now < to
  const todayIndex = week.findIndex((d) => d.today)

  const offset = (minutes) => (minutes - from) * PX_PER_MINUTE

  return (
    <div className="screen">
      <header className="screen__head">
        <div className="stack stack-2">
          <h1 className="screen__title">{c.title}</h1>
          <span className="meta row">
            <span className="dot dot--sm" style={{ background: sourceColor('magister') }} />
            {c.subtitle} · {c.source}
          </span>
        </div>
      </header>

      {/* ---------- Tijdraster, vanaf 700px ---------- */}
      <section className="sched card">
        <div className="sched__head">
          <span className="sched__corner" />
          {week.map((d) => (
            <div key={d.date} className={`sched__dayHead ${d.today ? 'is-today' : ''}`}>
              <span className="sched__dayName">{d.day}</span>
              <span className="sched__dayDate data">{d.date}</span>
              {d.today && <span className="badge badge--ok sched__todayBadge">{c.today}</span>}
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
            {hours.map((m) => (
              <span key={m} className="sched__hour data" style={{ top: `${offset(m)}px` }}>
                {toClock(m)}
              </span>
            ))}
          </div>

          {week.map((d) => (
            <div key={d.date} className={`sched__col ${d.today ? 'is-today' : ''}`}>
              {d.lessons.map((l) => {
                const isNow = d.today && now >= l.start && now < l.finish
                return (
                  <article
                    key={l.time + l.subjectKey}
                    className={`block ${isNow ? 'is-now' : ''}`}
                    style={{
                      top: `${offset(l.start)}px`,
                      height: `${(l.finish - l.start) * PX_PER_MINUTE - 3}px`,
                    }}
                  >
                    <span className="block__time data">
                      {l.time}
                      {isNow && <span className="block__nowTag">{c.now}</span>}
                    </span>
                    <LessonBody lesson={l} t={t} />
                  </article>
                )
              })}
            </div>
          ))}

          {/* Nu-streep, met de stip op de kolom van vandaag */}
          {nowVisible && (
            <span className="sched__now" style={{ top: `${offset(now)}px` }}>
              <span className="sched__nowTime data">{toClock(now)}</span>
              <span className="sched__nowDot" style={{ '--day': todayIndex < 0 ? 0 : todayIndex }} aria-hidden="true" />
            </span>
          )}
        </div>
      </section>

      {/* ---------- Agenda-lijst, onder 700px ---------- */}
      <div className="agenda">
        {week.map((d) => (
          <section key={d.date} className={`card agenda__day ${d.today ? 'is-today' : ''}`}>
            <header className="agenda__head">
              <span className="agenda__name">{d.day}</span>
              <span className="agenda__date data">{d.date}</span>
              {d.today && <span className="badge badge--ok">{c.today}</span>}
            </header>

            {d.lessons.length === 0 && <span className="meta week__empty">{c.empty}</span>}

            <div className="agenda__list">
              {d.lessons.map((l) => {
                const isNow = d.today && now >= l.start && now < l.finish
                return (
                  <div key={l.time + l.subjectKey} className={`agenda__row ${isNow ? 'is-now' : ''}`}>
                    <span className="agenda__times">
                      <span className="data">{l.time}</span>
                      <span className="data agenda__end">{l.end}</span>
                    </span>
                    <span className="agenda__rail" aria-hidden="true" />
                    <span className="agenda__body">
                      <LessonBody lesson={l} t={t} compact />
                      {isNow && <span className="badge badge--ok agenda__now">{c.now}</span>}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
