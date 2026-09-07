import { useState } from 'react'
import { fill, useI18n } from '../../i18n'
import { useAppState } from '../state'
import { getAssignments, getSources } from '../data'
import EmptyState from '../EmptyState'

export default function Assignments() {
  const { t, lang } = useI18n()
  const { done, toggleDone } = useAppState()
  const c = t.app.assignments

  const [filter, setFilter] = useState('all')

  const all = getAssignments(lang)
  const sources = getSources(lang)
  const shown = filter === 'all' ? all : all.filter((a) => a.source === filter)
  const openCount = all.filter((a) => !done[a.id]).length

  const filters = [{ key: 'all', label: c.filterAll, color: null }, ...sources.map((s) => ({ key: s.key, label: s.name, color: s.color }))]

  return (
    <div className="screen">
      <header className="screen__head">
        <div className="stack stack-2">
          <h1 className="screen__title">{c.title}</h1>
          <span className="meta">{fill(c.subtitle, { open: openCount, done: all.length - openCount })}</span>
        </div>
      </header>

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

      <section className="card stack">
        {shown.length === 0 && (
          <EmptyState title={c.empty} to="/app/bronnen" linkLabel={t.app.empty.sourceLink} />
        )}

        {shown.map((a) => {
          const isDone = !!done[a.id]
          return (
            <div key={a.id} className={`task task--row ${isDone ? 'is-done' : ''}`}>
              <button
                type="button"
                className={`task__check ${isDone ? 'is-checked' : ''}`}
                aria-label={c.markDone}
                aria-pressed={isDone}
                onClick={() => toggleDone(a.id)}
              />
              <span className="dot dot--sm" style={{ background: a.sourceColor }} title={a.sourceName} />
              <span className="task__body">
                <span className="task__title">{a.title}</span>
                <span className="task__meta meta">{a.subject}</span>
              </span>
              <span className={`task__due meta ${a.urgent && !isDone ? 'is-urgent' : ''}`}>
                {isDone ? c.done : a.due}
              </span>
            </div>
          )
        })}
      </section>
    </div>
  )
}
