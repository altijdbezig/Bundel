import { useId, useState } from 'react'
import { useI18n } from '../i18n'
import { joinWaitlist } from '../app/store'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Wachtlijstformulier. Het adres gaat naar de tabel `waitlist` in Supabase.
 * Daar mag iedereen in schrijven en niemand uit lezen, dus een bezoeker kan
 * niet zien wie zich nog meer heeft aangemeld.
 */
export default function WaitlistForm({ compact = false }) {
  const { t, lang } = useI18n()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const id = useId()

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy) return
    if (!EMAIL.test(email.trim())) {
      setError(t.waitlist.invalid)
      return
    }

    setError('')
    setBusy(true)
    try {
      await joinWaitlist(email.trim().toLowerCase(), lang)
      setDone(true)
    } catch (problem) {
      console.error('Bundel: wachtlijst mislukt', problem.message)
      setError(t.waitlist.failed)
    } finally {
      setBusy(false)
    }
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
      <button type="submit" className="btn btn--primary waitlist__submit" disabled={busy}>
        {busy ? t.waitlist.busy : t.waitlist.submit}
      </button>
      <span className="meta waitlist__note" id={`${id}-note`}>
        {t.waitlist.note}
      </span>
    </form>
  )
}
