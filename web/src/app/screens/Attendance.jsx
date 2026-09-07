import { fill, useI18n } from '../../i18n'
import EmptyState from '../EmptyState'
import ScreenHeader from '../ScreenHeader'
import { IconPresence } from '../../components/Icons'
import { getAttendance, getAttendanceSummary, sourceName, ATTENDANCE_LIMIT } from '../data'

const rateClass = (rate) => (rate < ATTENDANCE_LIMIT ? 'is-low' : rate === 100 ? 'is-high' : '')

export default function Attendance() {
  const { t, lang } = useI18n()
  const c = t.app.attendance

  const summary = getAttendanceSummary(lang)
  const rows = getAttendance(lang)

  /* De lijst toont alleen wat afweek, anders lees je twintig keer "aanwezig". */
  const notable = rows.filter((r) => r.status !== 'present')

  return (
    <div className="screen">
      <ScreenHeader
        title={c.title}
        subtitle={`${c.subtitle} · ${sourceName('magister', lang)}`}
        source="magister"
      />

      {summary.total === 0 ? (
        <section className="card">
          <EmptyState title={c.empty} icon={IconPresence} />
        </section>
      ) : (
        <>
          {/* Totaal over alles */}
          <section className="card stack stack-3">
            <span className="label">{c.overall}</span>

            <div className="rate">
              <span className={`rate__value ${rateClass(summary.rate)}`}>{summary.rate}%</span>
              <span className="stack stack-2 rate__side">
                <span className="meta">{c.present}</span>
                <span className="meta">{fill(c.ofLessons, { attended: summary.attended, counted: summary.counted })}</span>
              </span>
            </div>

            <span className="ratebar">
              <span className={`ratebar__fill ${rateClass(summary.rate)}`} style={{ width: `${summary.rate}%` }} />
            </span>

            <span className="meta">
              {fill(c.counts, { late: summary.late, absent: summary.absent })}
              {summary.excused > 0 ? ` · ${fill(c.excusedNote, { count: summary.excused })}` : ''}
            </span>
          </section>

          {/* Per vak */}
          <section className="stack stack-2">
            <span className="label">{c.perSubject}</span>
            <div className="gradecards">
              {summary.bySubject.map((s) => (
                <div key={s.subjectKey} className={`card attcard ${s.low ? 'is-low' : ''}`}>
                  <span className="attcard__head">
                    <span className="label gradecard__subject">{s.subject}</span>
                    {s.low && <span className="badge badge--warn">{c.watch}</span>}
                  </span>

                  <span className={`attcard__rate ${rateClass(s.rate)}`}>{s.rate}%</span>

                  <span className="ratebar">
                    <span className={`ratebar__fill ${rateClass(s.rate)}`} style={{ width: `${s.rate}%` }} />
                  </span>

                  <span className="meta attcard__foot">
                    {s.late === 0 && s.absent === 0
                      ? `${c.allGood} · ${fill(c.ofLessons, { attended: s.attended, counted: s.counted })}`
                      : fill(c.counts, { late: s.late, absent: s.absent })}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Wat afweek */}
          <section className="card stack stack-3">
            <div className="screen__cardHead">
              <span className="label">{c.recent}</span>
              <span className="meta">{c.recentNote}</span>
            </div>

            {notable.length === 0 && <EmptyState title={c.allPresent} icon={IconPresence} />}

            <div className="stack">
              {notable.map((r) => (
                <div key={r.key} className="att">
                  <span className="att__date data">{r.date}</span>
                  <span className={`att__dot is-${r.status}`} aria-hidden="true" />
                  <span className="att__text">
                    <span className="att__subject">{r.subject}</span>
                    <span className="meta">
                      {r.day} · {r.time} · {r.room}
                    </span>
                  </span>
                  <span className={`att__status is-${r.status}`}>
                    {c.status[r.status]}
                    {r.minutes ? ` · ${fill(c.lateBy, { minutes: r.minutes })}` : ''}
                    {r.status === 'absent' ? ` · ${c.notReported}` : ''}
                    {r.reason ? ` · ${r.reason}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
