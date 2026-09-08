import { useNavigate } from 'react-router-dom'
import { fill, useI18n } from '../i18n'
import Dialog, { DialogFacts, DialogSection } from './Dialog'
import OpenInSource from './OpenInSource'
import { sourceColor, sourceName } from './data'

const markClass = (value) => (value < 5.5 ? 'is-low' : value >= 8 ? 'is-high' : '')

/**
 * Venster voor één cijfer, met de opmerking die de docent in Magister
 * kan achterlaten. Niet elk cijfer heeft er een.
 */
export default function GradeDialog({ entry, onClose }) {
  const { t, lang } = useI18n()
  const c = t.app.grades
  const navigate = useNavigate()

  if (!entry) return null

  function go(to) {
    onClose()
    navigate(to)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      eyebrow={sourceName('magister', lang)}
      dot={sourceColor('magister')}
      title={entry.what}
    >
      <div className="gradehero">
        <span className={`gradehero__value ${markClass(entry.value)}`}>{entry.value.toFixed(1)}</span>
        <span className="stack stack-2">
          <span className="card-title">{entry.subject}</span>
          <span className="meta">{fill(c.weightValue, { weight: entry.weight })}</span>
        </span>
      </div>

      <DialogFacts
        items={[
          { label: c.what, value: entry.what },
          { label: c.date, value: entry.date },
          { label: c.weight, value: fill(c.weightValue, { weight: entry.weight }) },
          { label: c.teacher, value: entry.teacher },
          { label: c.period, value: entry.period ? fill(c.periodNumber, { number: entry.period }) : null },
        ]}
      />

      <DialogSection title={c.remark} action={c.detail.toSchedule} onAction={() => go('/app/rooster')}>
        {entry.remark ? <p className="remark">{entry.remark}</p> : <p className="meta">{c.noRemark}</p>}
      </DialogSection>

      <OpenInSource source="magister" url={entry.sourceUrl} />
    </Dialog>
  )
}
