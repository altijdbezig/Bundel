import { Link } from 'react-router-dom'
import { IconInbox } from '../components/Icons'

/** Lege staat binnen een kaart: zegt wat er niet is en waarom. */
export default function EmptyState({ title, hint, to, linkLabel, icon: Ico = IconInbox }) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Ico size={22} />
      </span>
      <span className="empty__title">{title}</span>
      {hint && <span className="meta">{hint}</span>}
      {to && linkLabel && (
        <Link to={to} className="meta empty__link">
          {linkLabel}
        </Link>
      )}
    </div>
  )
}
