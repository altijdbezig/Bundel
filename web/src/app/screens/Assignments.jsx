import { useState } from 'react'
import { fill, useI18n } from '../../i18n'
import { useAppState } from '../state'
import EmptyState from '../EmptyState'
import ScreenHeader from '../ScreenHeader'
import AssignmentDialog from '../AssignmentDialog'
import StatusBadge from '../StatusBadge'
import { assignmentTerm, getAssignments, getSources } from '../data'

/* Volgorde van de groepen op het scherm. */
const TERMS = ['overdue', 'today', 'week', 'later']

export default function Assignments() {
  const { t, lang } = useI18n()
  const { done, toggleDone } = useAppState()
  const c = t.app.assignments

  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('date')
  const [showDone, setShowDone] = useState(true)
  const [open, setOpen] = useState(null)

  const all = getAssignments(lang)
  const sources = getSources(lang)

  const visible = filter === 'all' ? all : all.filter((a) => a.source === filter)
  const sorted =
    sort === 'subject' ? [...visible].sort((a, b) => a.subject.localeCompare(b.subject)) : visible

  /* Afgerond gaat naar een eigen groep onderaan, niet doorgestreept tussen de rest. */
  const groups = TERMS.map((term) => ({
    term,
    items: sorted.filter((a) => !done[a.id] && assignmentTerm(a.dueDate) === term),
  })).filter((g) => g.items.length > 0)

  const finished = sorted.filter((a) => done[a.id])

  const counts = TERMS.reduce((acc, term) => {
    acc[term] = all.filter((a) => !done[a.id] && assignmentTerm(a.dueDate) === term).length
    return acc
  }, {})

  const filters = [
    { key: 'all', label: c.filterAll, color: null },
    ...sources.map((s) => ({ key: s.key, label: s.name, color: s.color })),
  ]

  function jump(term) {
    document.getElementById(`term-${term}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="screen">
      <ScreenHeader title={c.title} subtitle={c.subtitle}>
        <button
          type="button"
          className="btn btn--secondary screen__action"
          onClick={() => setSort(sort === 'date' ? 'subject' : 'date')}
        >
          {c.sortBy}: {sort === 'date' ? c.sortDate : c.sortSubject}
        </button>
        <button type="button" className="btn btn--secondary screen__action" onClick={() => setShowDone(!showDone)}>
          {showDone ? c.hideDone : c.showDone}
        </button>
      </ScreenHeader>

      {/* Wat er brandt, klikbaar naar de groep */}
      <div className="termbar">
        {TERMS.map((term) => (
          <button
            key={term}
            type="button"
            className={`termbar__item ${term === 'overdue' && counts[term] > 0 ? 'is-alert' : ''}`}
            onClick={() => jump(term)}
            disabled={counts[term] === 0}
          >
            <span className="termbar__count data">{counts[term]}</span>
            <span className="termbar__label">{c.terms[term]}</span>
          </button>
        ))}
      </div>

      <div className="pills">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`pill ${filter === f.key ? 'is-active' : ''}`}
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.color && <span className="dot dot--sm" style={{ background: f.color }} />}
            {f.label}
          </button>
        ))}
      </div>

      {groups.length === 0 && finished.length === 0 && (
        <section className="card">
          <EmptyState title={c.empty} to="/app/bronnen" linkLabel={t.app.empty.sourceLink} />
        </section>
      )}

      {groups.map((g) => (
        <section key={g.term} className="card stack stack-3" id={`term-${g.term}`}>
          <div className="screen__cardHead">
            <span className={`label ${g.term === 'overdue' ? 'is-alert' : ''}`}>{c.terms[g.term]}</span>
            <span className="meta data">{g.items.length}</span>
          </div>

          <div className="stack">
            {g.items.map((a) => (
              <div key={a.id} className="task task--row">
                {/* Links jouw eigen vinkje, rechts wat de bron zegt. Die twee
                    zijn niet hetzelfde en horen dus niet op elkaar te lijken. */}
                <button
                  type="button"
                  className="task__check"
                  aria-label={t.app.status.ownTick}
                  title={t.app.status.ownTickNote}
                  onClick={() => toggleDone(a.id)}
                />
                <button type="button" className="task__open" onClick={() => setOpen(a)}>
                  <span className="dot dot--sm" style={{ background: a.sourceColor }} title={a.sourceName} />
                  <span className="task__body">
                    <span className="task__title">{a.title}</span>
                    <span className="task__meta meta">
                      {a.subject} · {a.sourceName}
                    </span>
                  </span>
                  <StatusBadge status={a.status} source={a.sourceName} />
                  <span className={`task__due meta ${g.term === 'overdue' || a.urgent ? 'is-urgent' : ''}`}>
                    {a.due}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {showDone && finished.length > 0 && (
        <section className="card stack stack-3">
          <div className="screen__cardHead">
            <span className="label">{c.terms.done}</span>
            <span className="meta data">{finished.length}</span>
          </div>

          <div className="stack">
            {finished.map((a) => (
              <div key={a.id} className="task task--row is-done">
                <button
                  type="button"
                  className="task__check is-checked"
                  aria-label={t.app.status.ownTick}
                  title={t.app.status.ownTickNote}
                  aria-pressed
                  onClick={() => toggleDone(a.id)}
                />
                <button type="button" className="task__open" onClick={() => setOpen(a)}>
                  <span className="dot dot--sm" style={{ background: a.sourceColor }} title={a.sourceName} />
                  <span className="task__body">
                    <span className="task__title">{a.title}</span>
                    <span className="task__meta meta">{a.subject}</span>
                  </span>
                  <StatusBadge status={a.status} source={a.sourceName} />
                  <span className="task__due meta">{a.due}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {counts.overdue === 0 && counts.today === 0 && groups.length > 0 && (
        <p className="meta">{fill(c.allClear, {})}</p>
      )}

      <AssignmentDialog assignment={open} onClose={() => setOpen(null)} />
    </div>
  )
}
