import { useI18n } from '../i18n'

/**
 * Contactblok met een zichtbaar gemarkeerde placeholder.
 * Zoek op "emailPlaceholder" in src/i18n.jsx om het echte adres in te vullen,
 * en haal dan de .placeholder-opmaak en de note weg.
 */
export default function ContactCard() {
  const { t } = useI18n()
  const c = t.contact

  return (
    <div className="panel contact-card">
      <div className="stack stack-2">
        <span className="label">{c.label}</span>
        <p className="body measure">{c.intro}</p>
      </div>
      <span className="placeholder">{c.emailPlaceholder}</span>
      <span className="meta">{c.note}</span>
    </div>
  )
}
