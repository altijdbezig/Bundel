import { useId, useState } from 'react'
import { useI18n } from '../i18n'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Wachtlijstformulier. Prototype: valideert en bevestigt, maar
 * verstuurt of bewaart nog niets. Eén plek om later een echte
 * endpoint aan te hangen -> handleSubmit.
 */
export default function WaitlistForm({ compact = false }) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const id = useId()

  function handleSubmit(e) {
    e.preventDefault()
    if (!EMAIL.test(email.trim())) {
      setError(t.waitlist.invalid)
      return
    }
    setError('')
    setDone(true)
  }

  if (done) {
    return (
      <p className="notice notice--ok" role="status">
        {t.waitlist.done}
      </p>
    )
  }

  return (
    <form className={`waitlist ${compact ? 'waitlist--compact' : ''}`} onSubmit={handleSubmit} noValidate>
      <div className="field waitlist__field">
        <label htmlFor={id}>{t.waitlist.label}</label>
        <input
          id={id}
          className={`input ${error ? 'input--error' : ''}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t.waitlist.placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError('')
          }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-note`}
        />
        {error && (
          <span className="field-error" id={`${id}-error`}>
            {error}
          </span>
        )}
      </div>
      <button type="submit" className="btn btn--primary waitlist__submit">
        {t.waitlist.submit}
      </button>
      <span className="meta waitlist__note" id={`${id}-note`}>
        {t.waitlist.note}
      </span>
    </form>
  )
}
