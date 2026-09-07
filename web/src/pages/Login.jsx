import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Circles } from '../components/Logo'
import { IconMicrosoft } from '../components/Icons'
import { useI18n } from '../i18n'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Inlogscherm - visueel af, nog niet aangesloten.
 * Zodra er een auth-backend is: vervang handleSubmit en de
 * schoolaccount-knop door echte aanroepen.
 */
export default function Login() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!EMAIL.test(email.trim())) next.email = t.login.invalidEmail
    if (!password) next.password = t.login.emptyPassword
    setErrors(next)
    setNotice(Object.keys(next).length === 0 ? t.login.attempted : '')
  }

  return (
    <section className="auth">
      <div className="page auth__inner">
        <div className="auth__form-wrap">
          <div className="stack stack-4 auth__head">
            <h1 className="title-1">{t.login.title}</h1>
            <p className="body measure">{t.login.lead}</p>
          </div>

          <p className="notice auth__notice">{t.login.prototypeNotice}</p>

          <button type="button" className="btn btn--secondary btn--block btn--lg auth__sso" onClick={() => setNotice(t.login.attempted)}>
            <IconMicrosoft size={17} />
            {t.login.school}
          </button>

          <div className="auth__divider">
            <span className="hair" />
            <span className="meta">{t.login.or}</span>
            <span className="hair" />
          </div>

          <form className="stack stack-4" onSubmit={handleSubmit} noValidate>
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

            <div className="field">
              <span className="auth__labelRow">
                <label htmlFor="login-password">{t.login.password}</label>
                <button type="button" className="meta auth__forgot" onClick={() => setNotice(t.login.forgotNotice)}>
                  {t.login.forgot}
                </button>
              </span>
              <input
                id="login-password"
                className={`input ${errors.password ? 'input--error' : ''}`}
                type="password"
                autoComplete="current-password"
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

            <button type="submit" className="btn btn--primary btn--block btn--lg">
              {t.login.submit}
            </button>

            {notice && (
              <p className="notice" role="status">
                {notice}
              </p>
            )}
          </form>

          <p className="meta auth__foot">
            {t.login.noAccount}{' '}
            <Link to="/download#wachtlijst">{t.login.joinWaitlist}</Link>
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
