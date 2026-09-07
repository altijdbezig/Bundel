import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconCalendar,
  IconClose,
  IconGrades,
  IconGroups,
  IconInbox,
  IconSearch,
  IconSources,
  IconTasks,
  IconToday,
} from '../components/Icons'
import { fill, useI18n } from '../i18n'
import { useAppState } from './state'
import { getAssignments, search } from './data'

/* Volgorde van de groepen. Bepaalt ook de volgorde van de toetsenbordnavigatie. */
const TYPE_ORDER = ['assignment', 'lesson', 'grade', 'group', 'message']

const TYPE_ICON = {
  assignment: IconTasks,
  lesson: IconCalendar,
  grade: IconGrades,
  group: IconGroups,
  message: IconInbox,
}

const SHORTCUTS = [
  { key: 'today', to: '/app', Icon: IconToday },
  { key: 'assignments', to: '/app/opdrachten', Icon: IconTasks },
  { key: 'schedule', to: '/app/rooster', Icon: IconCalendar },
  { key: 'grades', to: '/app/cijfers', Icon: IconGrades },
  { key: 'groups', to: '/app/groepen', Icon: IconGroups },
  { key: 'sources', to: '/app/bronnen', Icon: IconSources },
]

/** Zet het gezochte stuk vet in de titel. */
function Highlight({ text, query }) {
  const q = query.trim()
  if (!q) return text

  const index = text.toLowerCase().indexOf(q.toLowerCase())
  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <mark className="result__hit">{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  )
}

/** Zoekvenster over de app heen. Opent met Ctrl+K, sluit met Escape. */
export default function SearchDialog({ open, onClose }) {
  const { t, lang } = useI18n()
  const c = t.app.search
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const { done } = useAppState()

  const typed = query.trim().length >= 2
  const results = useMemo(() => (typed ? search(query, lang) : []), [query, lang, typed])

  /* Gegroepeerd per type, in vaste volgorde. */
  const groups = useMemo(() => {
    return TYPE_ORDER.map((type) => ({ type, items: results.filter((r) => r.type === type) })).filter(
      (g) => g.items.length > 0,
    )
  }, [results])

  /* Platte lijst in dezelfde volgorde als op het scherm, voor de pijltjestoetsen. */
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups])

  const nextDeadline = useMemo(() => getAssignments(lang).find((a) => !done[a.id] && a.urgent), [lang, done])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setActive(0)
      return
    }
    inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (flat.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((i) => (i + 1) % flat.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((i) => (i - 1 + flat.length) % flat.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        go(flat[active].to)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  /* Houd het gemarkeerde resultaat in beeld. */
  useEffect(() => {
    listRef.current?.querySelector('.result.is-active')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  function go(to) {
    onClose()
    navigate(to)
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={c.open}>
      <button type="button" className="overlay__backdrop" aria-label={c.close} onClick={onClose} />

      <div className="searchbox">
        <div className="searchbox__field">
          <IconSearch size={19} />
          <input
            ref={inputRef}
            className="searchbox__input"
            type="text"
            placeholder={c.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={c.placeholder}
            autoComplete="off"
          />
          <button type="button" className="searchbox__close" onClick={onClose} aria-label={c.close}>
            <IconClose size={18} />
          </button>
        </div>

        <div className="searchbox__body" ref={listRef}>
          {/* Nog niets getypt: snelkoppelingen en de eerstvolgende deadline. */}
          {!typed && (
            <div className="searchbox__section">
              <span className="label searchbox__groupTitle">{c.goTo}</span>
              <div className="shortcuts">
                {SHORTCUTS.map(({ key, to, Icon }) => (
                  <button key={to} type="button" className="shortcut" onClick={() => go(to)}>
                    <Icon size={19} />
                    {t.app.nav[key]}
                  </button>
                ))}
              </div>

              {nextDeadline && (
                <>
                  <span className="label searchbox__groupTitle">{c.nextDeadline}</span>
                  <button type="button" className="result" onClick={() => go('/app/opdrachten')}>
                    <span className="result__icon">
                      <IconTasks size={18} />
                    </span>
                    <span className="result__text">
                      <span className="result__title">{nextDeadline.title}</span>
                      <span className="meta">
                        {nextDeadline.subject} · {nextDeadline.due}
                      </span>
                    </span>
                    <span className="result__source">
                      <span className="dot dot--sm" style={{ background: nextDeadline.sourceColor }} />
                      {nextDeadline.sourceName}
                    </span>
                  </button>
                </>
              )}

              <p className="meta searchbox__hint">{c.hint}</p>
            </div>
          )}

          {/* Wel getypt, niets gevonden. */}
          {typed && results.length === 0 && (
            <div className="searchbox__section">
              <p className="meta searchbox__hint">{fill(c.empty, { query: query.trim() })}</p>
            </div>
          )}

          {/* Resultaten, gegroepeerd per type. */}
          {typed &&
            groups.map((group) => (
              <div key={group.type} className="searchbox__section">
                <span className="label searchbox__groupTitle">
                  {c.groups[group.type]}
                  <span className="searchbox__groupCount data">{group.items.length}</span>
                </span>

                {group.items.map((r) => {
                  const Ico = TYPE_ICON[r.type]
                  const index = flat.indexOf(r)
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className={`result ${index === active ? 'is-active' : ''}`}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(r.to)}
                    >
                      <span className="result__icon">
                        <Ico size={18} />
                      </span>
                      <span className="result__text">
                        <span className="result__title">
                          <Highlight text={r.title} query={query} />
                        </span>
                        <span className="meta">{r.meta}</span>
                      </span>
                      <span className="result__source">
                        <span className="dot dot--sm" style={{ background: r.color }} />
                        {r.sourceName}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
        </div>

        <footer className="searchbox__foot">
          <span className="searchbox__keys">
            <kbd className="kbd">up</kbd>
            <kbd className="kbd">down</kbd>
            {c.keyMove}
          </span>
          <span className="searchbox__keys">
            <kbd className="kbd">enter</kbd>
            {c.keyOpen}
          </span>
          <span className="searchbox__keys">
            <kbd className="kbd">esc</kbd>
            {c.keyClose}
          </span>
          {typed && results.length > 0 && (
            <span className="meta searchbox__total">
              {results.length === 1 ? c.oneResult : fill(c.results, { count: results.length })}
            </span>
          )}
        </footer>
      </div>
    </div>
  )
}
