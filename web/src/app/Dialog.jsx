import { useEffect } from 'react'
import { IconArrow, IconClose } from '../components/Icons'
import { useI18n } from '../i18n'

/**
 * Gedeelde schil voor elk venster in de app: les, opdracht, vak en groep
 * gebruiken allemaal deze. Zo blijft de kop, de sluitknop en het gedrag
 * met Escape overal gelijk.
 */
export default function Dialog({ open, onClose, eyebrow, dot, title, children }) {
  const { t } = useI18n()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="overlay__backdrop" aria-label={t.app.lesson.close} onClick={onClose} />

      <div className="dlg">
        <header className="dlg__head">
          <div className="stack stack-2">
            {eyebrow && (
              <span className="row dlg__eyebrow">
                {dot && <span className="dot dot--sm" style={{ background: dot }} />}
                <span className="label">{eyebrow}</span>
              </span>
            )}
            <h2 className="title-2">{title}</h2>
          </div>
          <button type="button" className="dlg__close" onClick={onClose} aria-label={t.app.lesson.close}>
            <IconClose size={18} />
          </button>
        </header>

        <div className="dlg__body">{children}</div>
      </div>
    </div>
  )
}

/** Blok met feiten: label boven, waarde eronder. */
export function DialogFacts({ items }) {
  return (
    <dl className="dlg__facts">
      {items
        .filter((item) => item.value)
        .map((item) => (
          <div key={item.label}>
            <dt className="label">{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
    </dl>
  )
}

/** Sectie met een kop en optioneel een doorklik naar een scherm. */
export function DialogSection({ title, action, onAction, children }) {
  return (
    <section className="dlg__section">
      <header className="dlg__sectionHead">
        <span className="card-title">{title}</span>
        {action && onAction && (
          <button type="button" className="dlg__link" onClick={onAction}>
            {action}
            <IconArrow size={15} />
          </button>
        )}
      </header>
      {children}
    </section>
  )
}
