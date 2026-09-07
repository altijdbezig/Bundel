import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { useAuth } from '../../auth'
import { useAppState } from '../state'
import { getStudent, getStudentCourse } from '../data'

export default function Settings() {
  const { t, lang, setLang } = useI18n()
  const c = t.app.settings
  const { signOut } = useAuth()
  const { notificationsOn, setNotificationsOn, resetAll } = useAppState()
  const navigate = useNavigate()
  const [reset, setReset] = useState(false)

  const student = getStudent()

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  function handleReset() {
    resetAll()
    setReset(true)
  }

  return (
    <div className="screen">
      <header className="screen__head">
        <div className="stack stack-2">
          <h1 className="screen__title">{c.title}</h1>
          <span className="meta">{c.subtitle}</span>
        </div>
      </header>

      <div className="settings">
        <section className="card setting">
          <div className="stack stack-2 setting__text">
            <h2 className="card-title">{c.languageTitle}</h2>
            <p className="meta">{c.languageBody}</p>
          </div>
          <div className="lang setting__control" role="group" aria-label={t.nav.langLabel}>
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
        </section>

        <section className="card setting">
          <div className="stack stack-2 setting__text">
            <h2 className="card-title">{c.notificationsTitle}</h2>
            <p className="meta">{c.notificationsBody}</p>
          </div>
          <button
            type="button"
            className={`switch setting__control ${notificationsOn ? 'is-on' : ''}`}
            role="switch"
            aria-checked={notificationsOn}
            onClick={() => setNotificationsOn((v) => !v)}
          >
            <span className="switch__track" aria-hidden="true">
              <span className="switch__knob" />
            </span>
            <span className="switch__label">{notificationsOn ? c.on : c.off}</span>
          </button>
        </section>

        <section className="card setting">
          <div className="stack stack-2 setting__text">
            <h2 className="card-title">{c.accountTitle}</h2>
            <p className="meta">{c.accountBody}</p>
          </div>
          <span className="row setting__control">
            <span className="avatar is-self">{student.initials}</span>
            <span className="stack">
              <span className="card-title">{student.name}</span>
              <span className="meta">{getStudentCourse(lang)}</span>
            </span>
          </span>
        </section>

        <section className="card setting">
          <div className="stack stack-2 setting__text">
            <h2 className="card-title">{c.dataTitle}</h2>
            <p className="meta">{c.dataBody}</p>
            {reset && (
              <span className="notice notice--ok" role="status">
                {c.resetDone}
              </span>
            )}
          </div>
          <button type="button" className="btn btn--secondary setting__control" onClick={handleReset}>
            {c.reset}
          </button>
        </section>

        <section className="card setting">
          <div className="stack stack-2 setting__text">
            <h2 className="card-title">{c.signOutTitle}</h2>
            <p className="meta">{c.signOutBody}</p>
          </div>
          <button type="button" className="btn btn--secondary setting__control" onClick={handleSignOut}>
            {t.app.signOut}
          </button>
        </section>
      </div>
    </div>
  )
}
