import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Circles } from '../components/Logo'
import { useI18n } from '../i18n'
import { useAuth } from '../auth'

const MIN_PASSWORD = 6

/**
 * Hier kom je binnen via de herstellink uit de mail. Die link brengt een token
 * mee in de URL, en supabase-js leest die zelf uit en maakt er een sessie van.
 * Is er geen sessie, dan was de link verlopen of al gebruikt.
 */
export default function NewPassword() {
  const { t } = useI18n()
  const c = t.newPassword
  const { ready, signedIn, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy) return

    const next = {}
    if (password.length < MIN_PASSWORD) next.password = c.short
    else if (password !== repeat) next.repeat = c.mismatch
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setNotice('')
    setBusy(true)
    const code = await updatePassword(password)

    if (code) {
      setBusy(false)
      setNotice(t.login.errors[code] ?? t.login.errors.unknown)
      return
    }

    /* Je bent door de link ingelogd. Uitloggen, zodat je het nieuwe wachtwoord meteen gebruikt. */
    await signOut()
    navigate('/login', { replace: true, state: { reset: true } })
  }

  return (
    <section className="auth">
      <div className="page auth__inner">
        <div className="auth__form-wrap">
          {!ready ? (
            <p className="meta">{c.checking}</p>
          ) : !signedIn ? (
            <div className="stack stack-4">
              <h1 className="title-1">{c.expiredTitle}</h1>
              <p className="body measure">{c.expiredBody}</p>
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={() => navigate('/login', { replace: true })}
              >
                {c.expiredAction}
              </button>
            </div>
          ) : (
            <>
              <div className="stack stack-4 auth__head">
                <h1 className="title-1">{c.title}</h1>
                <p className="body measure">{c.lead}</p>
              </div>

              <form className="stack stack-4" onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="new-password">{c.password}</label>
                  <input
                    id="new-password"
                    className={`input ${errors.password ? 'input--error' : ''}`}
                    type="password"
                    autoComplete="new-password"
                    placeholder={c.placeholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={errors.password ? 'true' : undefined}
                    aria-describedby={errors.password ? 'new-password-error' : undefined}
                  />
                  {errors.password && (
                    <span className="field-error" id="new-password-error">
                      {errors.password}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="repeat-password">{c.repeat}</label>
                  <input
                    id="repeat-password"
                    className={`input ${errors.repeat ? 'input--error' : ''}`}
                    type="password"
                    autoComplete="new-password"
                    placeholder={c.placeholder}
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value)}
                    aria-invalid={errors.repeat ? 'true' : undefined}
                    aria-describedby={errors.repeat ? 'repeat-password-error' : undefined}
                  />
                  {errors.repeat && (
                    <span className="field-error" id="repeat-password-error">
                      {errors.repeat}
                    </span>
                  )}
                </div>

                <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
                  {busy ? c.busy : c.submit}
                </button>

                {notice && (
                  <p className="notice" role="status">
                    {notice}
                  </p>
                )}
              </form>
            </>
          )}
        </div>

        <aside className="auth__aside">
          <span className="auth__mark" aria-hidden="true">
            <Circles size={104} color="#FFFFFF" />
          </span>
          <blockquote className="auth__quote">{t.login.quote}</blockquote>
          <span className="auth__quoteBy label label--onbrand">{t.login.quoteBy}</span>
          <ul className="auth__list">
            {t.login.aside.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
