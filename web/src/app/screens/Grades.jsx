import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fill, useI18n } from '../../i18n'
import EmptyState from '../EmptyState'
import ScreenHeader from '../ScreenHeader'
import GradeDialog from '../GradeDialog'
import Dialog, { DialogFacts, DialogSection } from '../Dialog'
import { IconGrades, IconInbox } from '../../components/Icons'
import {
  getAssignments,
  getAverage,
  getGrades,
  getGradeStats,
  getRecentGrades,
  sourceColor,
  sourceName,
} from '../data'

const markClass = (value) => (value < 5.5 ? 'is-low' : value >= 8 ? 'is-high' : '')

/* Staafhoogte: een 4 is laag, een 10 vult de hele balk. */
const barHeight = (mark) => `${Math.max(8, ((mark - 3) / 7) * 100)}%`

function Trend({ value, t }) {
  if (value === 0) return null
  const up = value > 0
  return (
    <span className={`trend ${up ? 'is-up' : 'is-down'}`} title={up ? t.app.grades.trendUp : t.app.grades.trendDown}>
      <span aria-hidden="true">{up ? '▲' : '▼'}</span>
      {Math.abs(value).toFixed(1)}
    </span>
  )
}

export default function Grades() {
  const { t, lang } = useI18n()
  const c = t.app.grades
  const navigate = useNavigate()

  const [openSubject, setOpenSubject] = useState(null)
  const [openEntry, setOpenEntry] = useState(null)

  const grades = getGrades(lang)
  const recent = getRecentGrades(lang)
  const overall = getAverage()
  const stats = getGradeStats(lang)

  const detailAssignments = openSubject
    ? getAssignments(lang).filter((a) => a.subjectKey === openSubject.subjectKey)
    : []

  function go(to) {
    setOpenSubject(null)
    navigate(to)
  }

  return (
    <div className="screen">
      <ScreenHeader title={c.title} subtitle={`${c.subtitle} · ${sourceName('magister', lang)}`} source="magister">
        <div className="grades__overall">
          <span className="label">{c.weighted}</span>
          <span className={`grades__overallValue data ${markClass(overall)}`}>{overall.toFixed(1)}</span>
        </div>
      </ScreenHeader>

      {/* Onvoldoendes uitlichten */}
      {(stats.failing.length > 0 || stats.lowMarks.length > 0) && (
        <p className="notice">
          <span className="dot dot--sm" style={{ background: 'var(--warn-dot)', marginTop: '6px' }} />
          <span>
            <strong>{c.attention}</strong>{' '}
            {stats.failing.length > 0
              ? fill(c.lowAverage, { subjects: stats.failing.map((g) => g.subject).join(', ') })
              : fill(c.lowMark, { subjects: stats.lowMarks.map((g) => g.subject).join(', ') })}
          </span>
        </p>
      )}

      {grades.length === 0 && (
        <section className="card">
          <EmptyState
            title={t.app.empty.grades}
            hint={t.app.empty.gradesHint}
            to="/app/bronnen"
            linkLabel={t.app.empty.sourceLink}
            icon={IconGrades}
          />
        </section>
      )}

      {/* Laatste cijfers, nieuwste bovenaan. Klikken toont de opmerking. */}
      <section className="card stack stack-3">
        <div className="screen__cardHead">
          <span className="label">{c.recent}</span>
          <span className="meta">
            {c.recentNote} · {fill(c.remarkCount, { count: stats.withRemark })}
          </span>
        </div>

        <div className="stack">
          {recent.map((e) => (
            <button key={e.id} type="button" className="entry" onClick={() => setOpenEntry(e)}>
              <span className="entry__date data">{e.date}</span>
              <span className="entry__text">
                <span className="entry__what">{e.what}</span>
                <span className="meta">
                  {e.subject} · {fill(c.weightValue, { weight: e.weight })}
                </span>
              </span>
              {e.remark && (
                <span className="entry__remark" title={c.hasRemark}>
                  <IconInbox size={15} />
                </span>
              )}
              <span className={`entry__value data ${markClass(e.value)}`}>{e.value.toFixed(1)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Kaart per vak */}
      <div className="gradecards">
        {grades.map((g) => (
          <button key={g.subjectKey} type="button" className="card gradecard" onClick={() => setOpenSubject(g)}>
            <span className="label gradecard__subject">{g.subject}</span>

            <span className="gradecard__top">
              <span className={`gradecard__avg ${markClass(g.average)}`}>{g.average.toFixed(1)}</span>
              <span className="stack stack-2 gradecard__side">
                <span className="meta">{c.average}</span>
                <Trend value={g.trend} t={t} />
              </span>
            </span>

            <span className="bars">
              {g.marks.map((m, i) => (
                <span key={i} className="bars__col">
                  <span className="bars__track">
                    <span className={`bars__fill ${markClass(m)}`} style={{ height: barHeight(m) }} />
                  </span>
                  <span className="bars__label data">{m.toFixed(1)}</span>
                </span>
              ))}
            </span>

            <span className="meta gradecard__foot">
              {fill(g.count === 1 ? c.oneMark : c.marks, { count: g.count, last: g.last })}
            </span>
          </button>
        ))}
      </div>

      {/* Verdeling van alle cijfers */}
      <section className="card stack stack-3">
        <div className="screen__cardHead">
          <span className="label">{c.distribution}</span>
          <span className="meta">{fill(c.distributionNote, { total: stats.total, subjects: grades.length })}</span>
        </div>

        <div className="dist">
          {stats.buckets.map((b) => (
            <div key={b.n} className="dist__col">
              <span className="dist__count data">{b.count > 0 ? b.count : ''}</span>
              <span className="dist__track">
                <span
                  className={`dist__fill ${b.n < 5 ? 'is-low' : b.n >= 8 ? 'is-high' : ''}`}
                  style={{ height: `${stats.max ? (b.count / stats.max) * 100 : 0}%` }}
                />
              </span>
              <span className="dist__label data">{b.n}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pop-up per vak */}
      <Dialog
        open={!!openSubject}
        onClose={() => setOpenSubject(null)}
        eyebrow={sourceName('magister', lang)}
        dot={sourceColor('magister')}
        title={openSubject?.subject ?? ''}
      >
        {openSubject && (
          <>
            <DialogFacts
              items={[
                { label: c.weighted, value: openSubject.average.toFixed(1) },
                { label: c.detail.count, value: String(openSubject.count) },
                { label: c.detail.last, value: openSubject.last },
                { label: c.teacher, value: openSubject.teacher },
              ]}
            />

            <DialogSection title={c.detail.all} action={c.detail.toSchedule} onAction={() => go('/app/rooster')}>
              <div className="stack">
                {openSubject.entries.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className="dlg__row dlg__row--button"
                    onClick={() => {
                      setOpenSubject(null)
                      setOpenEntry(e)
                    }}
                  >
                    <span className="data dlg__rowTime">{e.date}</span>
                    <span className="dlg__rowTitle">{e.what}</span>
                    {e.remark && (
                      <span className="entry__remark" title={c.hasRemark}>
                        <IconInbox size={14} />
                      </span>
                    )}
                    <span className={`data ${markClass(e.value)}`}>{e.value.toFixed(1)}</span>
                  </button>
                ))}
              </div>
            </DialogSection>

            <DialogSection
              title={c.detail.assignments}
              action={c.detail.toAssignments}
              onAction={() => go('/app/opdrachten')}
            >
              {detailAssignments.length === 0 && <p className="meta">{c.detail.noAssignments}</p>}
              <div className="stack">
                {detailAssignments.map((a) => (
                  <div key={a.id} className="dlg__row">
                    <span className="dot dot--sm" style={{ background: a.sourceColor }} />
                    <span className="dlg__rowTitle">{a.title}</span>
                    <span className="meta">{a.due}</span>
                  </div>
                ))}
              </div>
            </DialogSection>
          </>
        )}
      </Dialog>

      {/* Pop-up per cijfer, met de opmerking */}
      <GradeDialog entry={openEntry} onClose={() => setOpenEntry(null)} />
    </div>
  )
}
