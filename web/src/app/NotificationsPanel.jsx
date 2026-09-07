import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useAppState } from './state'
import { getNotifications } from './data'

/** Paneel dat onder het belletje openklapt. Sluit met Escape of een klik ernaast. */
export default function NotificationsPanel({ open, onClose }) {
  const { t, lang } = useI18n()
  const c = t.app.notifications
  const { isRead, markRead, markAllRead, notificationsOn } = useAppState()
  const navigate = useNavigate()

  const items = getNotifications(lang)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function go(item) {
    markRead(item.id)
    onClose()
    navigate(item.to)
  }

  return (
    <>
      <button type="button" className="panel-backdrop" aria-label={c.title} onClick={onClose} />

      <div className="notif" role="dialog" aria-label={c.title}>
        <header className="notif__head">
          <span className="card-title">{c.title}</span>
          <button type="button" className="notif__markAll" onClick={() => markAllRead(items.map((i) => i.id))}>
            {c.markAll}
          </button>
        </header>

        {!notificationsOn && (
          <p className="meta notif__off">
            {c.off}{' '}
            <Link to="/app/instellingen" onClick={onClose}>
              {t.app.settings.title}
            </Link>
          </p>
        )}

        {items.length === 0 && <p className="meta notif__off">{c.empty}</p>}

        <ul className="notif__list">
          {items.map((n) => (
            <li key={n.id}>
              <button type="button" className={`notif__item ${isRead(n.id) ? 'is-read' : ''}`} onClick={() => go(n)}>
                <span className="dot dot--sm" style={{ background: n.sourceColor }} title={n.sourceName} />
                <span className="notif__text">
                  <span className="notif__title">{n.title}</span>
                  <span className="meta">{n.body}</span>
                </span>
                <span className="notif__time data">{n.time}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
