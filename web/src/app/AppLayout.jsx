import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Mark } from '../components/Logo'
import {
  IconToday,
  IconTasks,
  IconCalendar,
  IconGrades,
  IconGroups,
  IconSources,
} from '../components/Icons'
import { fill, useI18n } from '../i18n'
import { useAuth } from '../auth'
import { AppStateProvider, useAppState } from './state'
import { getAssignments, getStudent, getStudentCourse, getSources, sourceName } from './data'

const NAV = [
  { to: '/app', end: true, key: 'today', Icon: IconToday },
  { to: '/app/opdrachten', key: 'assignments', Icon: IconTasks },
  { to: '/app/rooster', key: 'schedule', Icon: IconCalendar },
  { to: '/app/cijfers', key: 'grades', Icon: IconGrades },
  { to: '/app/groepen', key: 'groups', Icon: IconGroups },
  { to: '/app/bronnen', key: 'sources', Icon: IconSources },
]

function UnreachableBanner() {
  const { t, lang } = useI18n()
  const { unreachable, toggleReachable } = useAppState()
  if (unreachable.length === 0) return null

  const key = unreachable[0]
  const source = getSources(lang).find((s) => s.key === key)

  return (
    <div className="notice appshell__banner" role="status">
      <span className="dot dot--sm appshell__pulse" style={{ background: 'var(--warn-dot)' }} />
      <span className="appshell__bannerText">
        {fill(t.app.unreachable, { source: sourceName(key, lang), time: source?.lastSync ?? '' })}
      </span>
      <button type="button" className="btn btn--secondary appshell__retry" onClick={() => toggleReachable(key)}>
        {t.app.retry}
      </button>
    </div>
  )
}

function Shell() {
  const { t, lang } = useI18n()
  const { signOut } = useAuth()
  const { done, status } = useAppState()
  const navigate = useNavigate()

  const student = getStudent()
  const openCount = getAssignments(lang).filter((a) => !done[a.id]).length
  const sources = getSources(lang)

  const badges = {
    assignments: openCount ? String(openCount) : '',
    groups: '2',
    sources: sources.some((s) => status(s.key) === 'warn') ? '!' : '',
  }

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <div className="appshell">
      <aside className="appshell__side">
        <Link to="/" className="appshell__brand" aria-label="Bundel">
          <Mark size={22} />
          <span className="appshell__brandName">Bundel</span>
        </Link>

        <div className="appshell__user">
          <span className="appshell__avatar">{student.initials}</span>
          <span className="appshell__userText">
            <span className="appshell__userName">{student.name}</span>
            <span className="appshell__userMeta">{getStudentCourse(lang)}</span>
          </span>
        </div>

        <nav className="appshell__nav" aria-label={t.nav.menu}>
          {NAV.map(({ to, end, key, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `appshell__navItem ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={19} />
              <span className="appshell__navLabel">{t.app.nav[key]}</span>
              {badges[key] && (
                <span className={`appshell__badge data ${badges[key] === '!' ? 'is-warn' : ''}`}>{badges[key]}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="appshell__sources">
          <span className="label">{t.app.sourcesLabel}</span>
          {sources.map((s) => {
            const state = status(s.key)
            return (
              <span key={s.key} className="appshell__source">
                <span className="dot dot--sm" style={{ background: state === 'off' ? 'var(--ink-300)' : s.color }} />
                <span className="appshell__sourceName">{s.name}</span>
                <span
                  className={`appshell__sourceState data is-${state}`}
                  title={state === 'ok' ? t.app.sources.connected : state === 'warn' ? t.app.sources.unreachable : t.app.sources.notConnected}
                >
                  {state === 'ok' ? 'ok' : state === 'warn' ? '!' : 'off'}
                </span>
              </span>
            )
          })}
        </div>

        <div className="appshell__foot">
          <Link to="/" className="appshell__footLink">
            {t.app.backToSite}
          </Link>
          <button type="button" className="appshell__footLink" onClick={handleSignOut}>
            {t.app.signOut}
          </button>
        </div>
      </aside>

      <div className="appshell__main">
        <p className="appshell__demo meta">{t.app.demo}</p>
        <UnreachableBanner />
        <Outlet />
      </div>

      <nav className="appshell__tabbar" aria-label={t.nav.menu}>
        {NAV.map(({ to, end, key, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `appshell__tab ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={20} />
            <span>{t.app.nav[key]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default function AppLayout() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  )
}
