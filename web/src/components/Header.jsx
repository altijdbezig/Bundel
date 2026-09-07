import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { useI18n } from '../i18n'
import { useAuth } from '../auth'

function LangToggle() {
  const { lang, setLang, t } = useI18n()
  return (
    <div className="lang" role="group" aria-label={t.nav.langLabel}>
      {['nl', 'en'].map((code) => (
        <button
          key={code}
          type="button"
          className={`lang__btn ${lang === code ? 'is-active' : ''}`}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default function Header() {
  const { t } = useI18n()
  const { signedIn } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const links = [
    { to: '/#functies', label: t.nav.product },
    { to: '/privacy', label: t.nav.privacy },
    { to: '/over', label: t.nav.over },
  ]

  return (
    <header className="site-header">
      <div className="page site-header__inner">
        <Link to="/" className="site-header__brand" aria-label="Bundel">
          <Logo size={19} />
        </Link>

        <nav className="site-header__nav" aria-label={t.nav.menu}>
          {links.map((l) =>
            l.to.includes('#') ? (
              <a key={l.to} href={l.to} className="navlink">
                {l.label}
              </a>
            ) : (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `navlink ${isActive ? 'is-active' : ''}`}>
                {l.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="site-header__actions">
          <LangToggle />
          <Link to="/download" className="btn btn--secondary site-header__download">
            {t.nav.download}
          </Link>
          <Link to={signedIn ? '/app' : '/login'} className="btn btn--primary">
            {signedIn ? t.app.nav.today : t.nav.login}
          </Link>
        </div>

        <button
          type="button"
          className="site-header__burger"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={t.nav.menu}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`burger ${open ? 'is-open' : ''}`} aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      {open && (
        <div className="site-header__mobile" id="mobile-menu">
          <div className="page stack stack-3">
            {links.map((l) =>
              l.to.includes('#') ? (
                <a key={l.to} href={l.to} className="navlink navlink--block">
                  {l.label}
                </a>
              ) : (
                <NavLink key={l.to} to={l.to} className="navlink navlink--block">
                  {l.label}
                </NavLink>
              ),
            )}
            <hr className="hair" />
            <Link to="/download" className="btn btn--secondary btn--block">
              {t.nav.download}
            </Link>
            <Link to={signedIn ? '/app' : '/login'} className="btn btn--primary btn--block">
              {signedIn ? t.app.nav.today : t.nav.login}
            </Link>
            <LangToggle />
          </div>
        </div>
      )}
    </header>
  )
}
