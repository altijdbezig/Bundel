import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { useAuth } from '../../auth'
import { useAppState } from '../state'
import ScreenHeader from '../ScreenHeader'
import { getStudent, getStudentCourse } from '../data'

/* De schermen die je als startscherm kunt kiezen. */
const START_SCREENS = [
  { to: '/app', key: 'today' },
  { to: '/app/opdrachten', key: 'assignments' },
  { to: '/app/rooster', key: 'schedule' },
  { to: '/app/cijfers', key: 'grades' },
  { to: '/app/aanwezigheid', key: 'attendance' },
]

function Row({ title, body, children }) {
  return (
    <div className="setrow">
      <div className="stack stack-2 setrow__text">
        <span className="card-title">{title}</span>
        {body && <span className="meta">{body}</span>}
      </div>
      <div className="setrow__control">{children}</div>
    </div>
  )
}

function Switch({ on, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      className={`switch ${on ? 'is-on' : ''} ${disabled ? 'is-disabled' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
    >
      <span className="switch__track" aria-hidden="true">
        <span className="switch__knob" />
      </span>
    </button>
  )
}

export default function Settings() {
  const { t, lang, setLang } = useI18n()
  const c = t.app.settings
  const { signOut } = useAuth()
  const {
    notificationsOn,
    setNotificationsOn,
    notifyKinds,
    toggleNotifyKind,
    startScreen,
    setStartScreen,
    resetAll,
  } = useAppState()
  const navigate = useNavigate()
  const [reset, setReset] = useState(false)

  const student = getStudent()

  const kinds = [
    { key: 'deadline', label: c.notifyDeadlines },
    { key: 'grade', label: c.notifyGrades },
    { key: 'message', label: c.notifyMessages },
    { key: 'schedule', label: c.notifySchedule },
  ]

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <div className="screen">
      <ScreenHeader title={c.title} subtitle={c.subtitle} />

      {/* Weergave */}
      <section className="stack stack-2">
        <span className="label">{c.sectionDisplay}</span>
        <div className="card setgroup">
          <Row title={c.languageTitle} body={c.languageBody}>
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
          </Row>

          <Row title={c.startScreen} body={c.startScreenBody}>
            <select
              className="input select"
              value={startScreen}
              onChange={(e) => setStartScreen(e.target.value)}
              aria-label={c.startScreen}
            >
              {START_SCREENS.map((s) => (
                <option key={s.to} value={s.to}>
                  {t.app.nav[s.key]}
                </option>
              ))}
            </select>
          </Row>
        </div>
      </section>

      {/* Meldingen */}
      <section className="stack stack-2">
        <span className="label">{c.sectionNotifications}</span>
        <div className="card setgroup">
          <Row title={c.notifyAll} body={c.notificationsBody}>
            <Switch on={notificationsOn} onChange={() => setNotificationsOn((v) => !v)} label={c.notifyAll} />
          </Row>

          {kinds.map((k) => (
            <Row key={k.key} title={k.label}>
              <Switch
                on={notificationsOn && notifyKinds[k.key]}
                disabled={!notificationsOn}
                onChange={() => toggleNotifyKind(k.key)}
                label={k.label}
              />
            </Row>
          ))}

          {!notificationsOn && (
            <div className="setrow">
              <span className="meta">{c.notifyOffNote}</span>
            </div>
          )}
        </div>
      </section>

      {/* Account */}
      <section className="stack stack-2">
        <span className="label">{c.sectionAccount}</span>
        <div className="card setgroup">
          <Row title={c.accountTitle} body={c.accountBody}>
            <span className="row">
              <span className="avatar is-self">{student.initials}</span>
              <span className="stack">
                <span className="card-title">{student.name}</span>
                <span className="meta">{getStudentCourse(lang)}</span>
              </span>
            </span>
          </Row>

          <Row title={c.signOutTitle} body={c.signOutBody}>
            <button type="button" className="btn btn--secondary" onClick={handleSignOut}>
              {t.app.signOut}
            </button>
          </Row>
        </div>
      </section>

      {/* Demo */}
      <section className="stack stack-2">
        <span className="label">{c.sectionDemo}</span>
        <div className="card setgroup">
          <Row title={c.dataTitle} body={c.dataBody}>
            <button type="button" className="btn btn--secondary" onClick={() => { resetAll(); setReset(true) }}>
              {c.reset}
            </button>
          </Row>

          {reset && (
            <div className="setrow">
              <span className="notice notice--ok" role="status">
                {c.resetDone}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
