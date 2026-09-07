import { sourceColor } from './data'

/**
 * Kop van een app-scherm. Overal dezelfde opbouw: titel links met een
 * ondertitel die zegt waar de data vandaan komt, acties rechts.
 */
export default function ScreenHeader({ title, subtitle, source, children }) {
  return (
    <header className="screen__head">
      <div className="stack stack-2">
        <h1 className="screen__title">{title}</h1>
        {subtitle && (
          <span className="meta row screen__sub">
            {source && <span className="dot dot--sm" style={{ background: sourceColor(source) }} />}
            {subtitle}
          </span>
        )}
      </div>
      {children && <div className="screen__actions">{children}</div>}
    </header>
  )
}
