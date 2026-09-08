import { fill, useI18n } from '../i18n'

/**
 * Wat de bron over een opdracht zegt: nog te doen, ingeleverd, nagekeken of
 * te laat.
 *
 * Dit is niet hetzelfde als jouw eigen vinkje. De bron weet of er iets is
 * ingeleverd, Bundel niet, dus bij een verschil wint de bron altijd. Je vinkje
 * staat ernaast als notitie voor jezelf.
 */
export default function StatusBadge({ status, source, title = true }) {
  const { t } = useI18n()
  const label = t.app.status[status] ?? t.app.status.open

  return (
    <span
      className={`status status--${status}`}
      title={title && source ? fill(t.app.status.fromSource, { source }) : undefined}
    >
      {label}
    </span>
  )
}
