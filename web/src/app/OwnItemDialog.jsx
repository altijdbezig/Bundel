import { useState } from 'react'
import { useI18n } from '../i18n'
import { useAppState } from './state'
import Dialog from './Dialog'
import { sourceColor } from './data'

const KINDS = ['appointment', 'work', 'study', 'reminder']

const emptyItem = (weekIndex) => ({
  kind: 'appointment',
  title: '',
  weekIndex,
  dayIndex: 0,
  time: '13:00',
  end: '14:00',
  place: '',
  note: '',
  weekly: false,
})

/**
 * Venster om zelf iets in het rooster te zetten of aan te passen.
 * Een herinnering heeft geen eindtijd, de rest wel.
 */
export default function OwnItemDialog({ open, draft, days, weekIndex, onClose }) {
  if (!open) return null

  /* De sleutel zorgt dat het formulier opnieuw begint bij een ander item,
     zodat de waarden er meteen in staan en niet pas na een effect. */
  return <OwnItemForm key={draft?.id ?? 'new'} draft={draft} days={days} weekIndex={weekIndex} onClose={onClose} />
}

function OwnItemForm({ draft, days, weekIndex, onClose }) {
  const { t } = useI18n()
  const c = t.app.own
  const { addOwnItem, updateOwnItem, removeOwnItem } = useAppState()

  const [form, setForm] = useState(() => ({ ...emptyItem(weekIndex), ...(draft ?? {}) }))
  const [error, setError] = useState('')

  const isNew = !form.id
  const isReminder = form.kind === 'reminder'
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  function handleSave() {
    if (!form.title.trim()) {
      setError(c.needName)
      return
    }
    if (!isReminder && form.end <= form.time) {
      setError(c.needEnd)
      return
    }

    const item = { ...form, title: form.title.trim(), end: isReminder ? null : form.end }
    if (isNew) addOwnItem(item)
    else updateOwnItem(form.id, item)
    onClose()
  }

  function handleRemove() {
    removeOwnItem(form.id)
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      eyebrow={c.mine}
      dot={sourceColor('own')}
      title={isNew ? c.addTitle : c.editTitle}
    >
      <div className="stack stack-2">
        <span className="label">{c.kind}</span>
        <div className="pills">
          {KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              className={`pill ${form.kind === kind ? 'is-active' : ''}`}
              aria-pressed={form.kind === kind}
              onClick={() => set({ kind })}
            >
              {c.kinds[kind]}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="own-title">{c.name}</label>
        <input
          id="own-title"
          className="input"
          value={form.title}
          placeholder={c.namePlaceholder}
          onChange={(e) => set({ title: e.target.value })}
        />
      </div>

      <div className="ownform">
        <div className="field">
          <label htmlFor="own-day">{c.day}</label>
          <select
            id="own-day"
            className="input select"
            value={form.dayIndex}
            onChange={(e) => set({ dayIndex: Number(e.target.value) })}
          >
            {days.map((d, i) => (
              <option key={d.date} value={i}>
                {d.day}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="own-from">{c.from}</label>
          <input
            id="own-from"
            className="input"
            type="time"
            value={form.time}
            onChange={(e) => set({ time: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="own-to">{c.to}</label>
          {isReminder ? (
            <span className="meta ownform__none">{c.noEnd}</span>
          ) : (
            <input
              id="own-to"
              className="input"
              type="time"
              value={form.end ?? ''}
              onChange={(e) => set({ end: e.target.value })}
            />
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="own-place">{c.place}</label>
        <input
          id="own-place"
          className="input"
          value={form.place}
          placeholder={c.placePlaceholder}
          onChange={(e) => set({ place: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="own-note">{c.note}</label>
        <input
          id="own-note"
          className="input"
          value={form.note}
          placeholder={c.notePlaceholder}
          onChange={(e) => set({ note: e.target.value })}
        />
      </div>

      <label className="checkline">
        <button
          type="button"
          className={`task__check ${form.weekly ? 'is-checked' : ''}`}
          role="switch"
          aria-checked={form.weekly}
          aria-label={c.weekly}
          onClick={() => set({ weekly: !form.weekly })}
        />
        <span className="stack stack-2">
          <span className="card-title">{c.weekly}</span>
          <span className="meta">{c.weeklyNote}</span>
        </span>
      </label>

      {error && <p className="field-error">{error}</p>}

      <div className="dlg__foot ownfoot">
        {!isNew && (
          <button type="button" className="btn btn--ghost ownfoot__remove" onClick={handleRemove}>
            {c.remove}
          </button>
        )}
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          {c.cancel}
        </button>
        <button type="button" className="btn btn--primary" onClick={handleSave}>
          {c.save}
        </button>
      </div>
    </Dialog>
  )
}
