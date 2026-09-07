import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Circles } from '../components/Logo'
import { IconMicrosoft } from '../components/Icons'
import { useI18n } from '../i18n'
import { useAuth } from '../auth'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_PASSWORD = 6

/**
 * Inloggen, aanmelden en wachtwoord vergeten, alle drie in hetzelfde paneel.
 * Het echte werk doet Supabase Auth via ../auth.jsx. Die geeft een foutcode
 * terug, hier wordt daar een zin bij gezocht in de taal van de bezoeker.
 */
export default function Login() {
  const { t } = useI18n()
  const [mode, setMode] = useState('signIn')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const { signIn, signUp, requestReset } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /* Wie net een nieuw wachtwoord heeft gekozen komt hier binnen met een melding. */
  const [notice, setNotice] = useState(location.state?.reset ? t.login.resetDone : '')

  const signingUp = mode === 'signUp'
  const resetting = mode === 'reset'
  const target = location.state?.from ?? '/app'

  function switchMode(next) {
    setMode(next)
    setErrors({})
    setNotice('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy) return

    const next = {}
    if (signingUp && !name.trim()) next.name = t.login.emptyName
    if (!EMAIL.test(email.trim())) next.email = t.login.invalidEmail
    if (!resetting) {
      if (!password) next.password = t.login.emptyPassword
      else if (signingUp && password.length < MIN_PASSWORD) next.password = t.login.shortPassword
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setNotice('')
    setBusy(true)
    const code = resetting
      ? await requestReset(email)
      : signingUp
        ? await signUp(email, password, name)
        : await signIn(email, password)
    setBusy(false)

    if (code) {
      setNotice(t.login.errors[code] ?? t.login.errors.unknown)
      return
    }

    /* Bij herstellen blijf je hier staan, want de link komt per mail. */
    if (resetting) {
      setNotice(t.login.resetSent)
      return
    }

    navigate(target, { replace: true })
  }

  return (
    <section className="auth">
      <div className="page auth__inner">
        <div className="auth__form-wrap">
          <div className="stack stack-4 auth__head">
            <h1 className="title-1">
              {resetting ? t.login.resetTitle : signingUp ? t.login.signUp : t.login.title}
            </h1>
            <p className="body measure">{resetting ? t.login.resetLead : t.login.lead}</p>
          </div>

          {!resetting && <p className="notice auth__notice">{t.login.prototypeNotice}</p>}

          {!resetting && (
            <div className="auth__modes" role="group">
              <button
                type="button"
                className={`auth__mode ${signingUp ? '' : 'auth__mode--on'}`}
                aria-pressed={!signingUp}
                onClick={() => switchMode('signIn')}
              >
                {t.login.signIn}
              </button>
              <button
                type="button"
                className={`auth__mode ${signingUp ? 'auth__mode--on' : ''}`}
                aria-pressed={signingUp}
                onClick={() => switchMode('signUp')}
              >
                {t.login.signUp}
              </button>
            </div>
          )}

          {!resetting && (
            <>
              <button
                type="button"
                className="btn btn--secondary btn--block btn--lg auth__sso"
                onClick={() => setNotice(t.login.ssoNotice)}
              >
                <IconMicrosoft size={17} />
                {t.login.school}
              </button>

              <div className="auth__divider">
                <span className="hair" />
                <span className="meta">{t.login.or}</span>
                <span className="hair" />
              </div>
            </>
          )}

          <form className="stack stack-4" onSubmit={handleSubmit} noValidate>
            {signingUp && (
              <div className="field">
                <label htmlFor="login-name">{t.login.name}</label>
                <input
                  id="login-name"
                  className={`input ${errors.name ? 'input--error' : ''}`}
                  type="text"
                  autoComplete="name"
                  placeholder={t.login.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={errors.name ? 'true' : undefined}
                  aria-describedby={errors.name ? 'login-name-error' : undefined}
                />
                {errors.name && (
                  <span className="field-error" id="login-name-error">
                    {errors.name}
                  </span>
                )}
              </div>
            )}

            <div className="field">
              <label htmlFor="login-email">{t.login.email}</label>
              <input
                id="login-email"
                className={`input ${errors.email ? 'input--error' : ''}`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t.login.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? 'true' : undefined}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
              />
              {errors.email && (
                <span className="field-error" id="login-email-error">
                  {errors.email}
                </span>
              )}
            </div>

            {!resetting && (
            <div className="field">
              <span className="auth__labelRow">
                <label htmlFor="login-password">{t.login.password}</label>
                {!signingUp && (
                  <button type="button" className="meta auth__forgot" onClick={() => switchMode('reset')}>
                    {t.login.forgot}
                  </button>
                )}
              </span>
              <input
                id="login-password"
                className={`input ${errors.password ? 'input--error' : ''}`}
                type="password"
                autoComplete={signingUp ? 'new-password' : 'current-password'}
                placeholder={t.login.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={errors.password ? 'true' : undefined}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
              />
              {errors.password && (
                <span className="field-error" id="login-password-error">
                  {errors.password}
                </span>
              )}
            </div>
            )}

            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
              {busy
                ? t.login.busy
                : resetting
                  ? t.login.resetSubmit
                  : signingUp
                    ? t.login.signUp
                    : t.login.submit}
            </button>

            {notice && (
              <p className="notice" role="status">
                {notice}
              </p>
            )}
          </form>

          <p className="meta auth__foot">
            {resetting ? (
              <button type="button" className="auth__switch" onClick={() => switchMode('signIn')}>
                {t.login.backToSignIn}
              </button>
            ) : (
              <>
                {signingUp ? t.login.haveAccount : t.login.noAccount}{' '}
                <button
                  type="button"
                  className="auth__switch"
                  onClick={() => switchMode(signingUp ? 'signIn' : 'signUp')}
                >
                  {signingUp ? t.login.signInInstead : t.login.createAccount}
                </button>
              </>
            )}
          </p>
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
