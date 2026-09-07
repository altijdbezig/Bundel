import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconClose, IconSearch } from '../components/Icons'
import { fill, useI18n } from '../i18n'
import { search } from './data'

/** Zoekvenster over de app heen. Opent met Ctrl+K, sluit met Escape. */
export default function SearchDialog({ open, onClose }) {
  const { t, lang } = useI18n()
  const c = t.app.search
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')

  const results = useMemo(() => search(query, lang), [query, lang])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    inputRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function go(to) {
    onClose()
    navigate(to)
  }

  const typed = query.trim().length >= 2

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={c.open}>
      <button type="button" className="overlay__backdrop" aria-label={c.close} onClick={onClose} />

      <div className="searchbox">
        <div className="searchbox__field">
          <IconSearch size={19} />
          <input
            ref={inputRef}
            className="searchbox__input"
            type="search"
            placeholder={c.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={c.placeholder}
          />
          <button type="button" className="searchbox__close" onClick={onClose} aria-label={c.close}>
            <IconClose size={18} />
          </button>
        </div>

        <div className="searchbox__body">
          {!typed && <p className="meta searchbox__hint">{c.hint}</p>}

          {typed && results.length === 0 && <p className="meta searchbox__hint">{fill(c.empty, { query: query.trim() })}</p>}

          {typed && results.length > 0 && (
            <>
              <span className="label searchbox__count">
                {results.length === 1 ? c.oneResult : fill(c.results, { count: results.length })}
              </span>
              <ul className="searchbox__list">
                {results.map((r) => (
                  <li key={r.id}>
                    <button type="button" className="result" onClick={() => go(r.to)}>
                      <span className="dot dot--sm" style={{ background: r.color }} title={r.sourceName} />
                      <span className="result__text">
                        <span className="result__title">{r.title}</span>
                        <span className="meta">{r.meta}</span>
                      </span>
                      <span className="label result__type">{c.types[r.type]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
