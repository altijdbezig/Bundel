import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Mark } from '../components/Logo'
import {
  IconToday,
  IconTasks,
  IconCalendar,
  IconGrades,
  IconGroups,
  IconSources,
  IconPresence,
  IconSearch,
  IconBell,
  IconSettings,
  IconGlobe,
  IconLogout,
  IconChevron,
} from '../components/Icons'
import { fill, useI18n } from '../i18n'
import { useAuth } from '../auth'
import { AppStateProvider, useAppState } from './state'
import { getAssignments, getNotifications, getStudent, getStudentCourse, getSources, sourceName } from './data'
import SearchDialog from './SearchDialog'
import NotificationsPanel from './NotificationsPanel'
import Onboarding from './screens/Onboarding'

/* De zijbalk toont alles. Aanwezigheid staat naast Cijfers, want ze horen bij elkaar. */
const NAV = [
  { to: '/app', end: true, key: 'today', Icon: IconToday },
  { to: '/app/opdrachten', key: 'assignments', Icon: IconTasks },
  { to: '/app/rooster', key: 'schedule', Icon: IconCalendar },
  { to: '/app/cijfers', key: 'grades', Icon: IconGrades },
  { to: '/app/aanwezigheid', key: 'attendance', Icon: IconPresence },
  { to: '/app/groepen', key: 'groups', Icon: IconGroups },
  { to: '/app/bronnen', key: 'sources', Icon: IconSources },
]

/* De onderbalk op mobiel blijft op zes, anders wordt elk tabje te smal.
   Aanwezigheid is daar bereikbaar via Cijfers en via zoeken. */
const TABS = NAV.filter((item) => item.key !== 'attendance')

const SETTINGS_PATH = '/app/instellingen'

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
  const { done, status, noSources, readIds, notificationsOn, notifyKinds } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()

  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const student = getStudent()
  const openCount = getAssignments(lang).filter((a) => !done[a.id]).length
  const sources = getSources(lang)
  const notifications = getNotifications(lang).filter((n) => notifyKinds[n.kind] !== false)
  const unread = notificationsOn ? notifications.filter((n) => !readIds.includes(n.id)).length : 0

  const badges = {
    assignments: openCount ? String(openCount) : '',
    groups: '2',
    sources: sources.some((s) => status(s.key) === 'warn') ? '!' : '',
  }

  // Ctrl+K of Cmd+K opent het zoekvenster.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setNotifOpen(false)
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    setNotifOpen(false)
    setAccountOpen(false)
  }, [location.pathname])

  /* Het accountmenu sluit met Escape, net als de andere vensters. */
  useEffect(() => {
    if (!accountOpen) return
    const onKey = (e) => e.key === 'Escape' && setAccountOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [accountOpen])

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  const onSettings = location.pathname === SETTINGS_PATH
  const takeover = noSources && !onSettings

  return (
    <div className="appshell">
      <aside className="appshell__side">
        <Link to="/" className="appshell__brand" aria-label="Bundel">
          <Mark size={22} />
          <span className="appshell__brandName">Bundel</span>
        </Link>

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
                  title={
                    state === 'ok'
                      ? t.app.sources.connected
                      : state === 'warn'
                        ? t.app.sources.unreachable
                        : t.app.sources.notConnected
                  }
                >
                  {state === 'ok' ? 'ok' : state === 'warn' ? '!' : 'off'}
                </span>
              </span>
            )
          })}
        </div>

        <div className="appshell__foot">
          <button
            type="button"
            className={`account ${accountOpen ? 'is-open' : ''}`}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            onClick={() => setAccountOpen((v) => !v)}
          >
            <span className="appshell__avatar">{student.initials}</span>
            <span className="account__text">
              <span className="account__name">{student.name}</span>
              <span className="account__meta">{getStudentCourse(lang)}</span>
            </span>
            <span className="account__chev" aria-hidden="true">
              <IconChevron size={16} />
            </span>
          </button>

          {accountOpen && (
            <>
              <button
                type="button"
                className="panel-backdrop"
                aria-label={t.app.settings.title}
                onClick={() => setAccountOpen(false)}
              />
              <div className="accountmenu" role="menu">
                <NavLink to={SETTINGS_PATH} className="accountmenu__item" role="menuitem">
                  <IconSettings size={17} />
                  {t.app.settings.title}
                </NavLink>
                <Link to="/" className="accountmenu__item" role="menuitem">
                  <IconGlobe size={17} />
                  {t.app.backToSite}
                </Link>
                <hr className="hair" />
                <button type="button" className="accountmenu__item" role="menuitem" onClick={handleSignOut}>
                  <IconLogout size={17} />
                  {t.app.signOut}
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      <div className="appshell__main">
        <div className="topbar">
          <button type="button" className="topbar__search" onClick={() => setSearchOpen(true)}>
            <IconSearch size={18} />
            <span className="topbar__searchLabel">{t.app.search.open}</span>
            <span className="topbar__kbd data">Ctrl K</span>
          </button>

          <div className="topbar__actions">
            <div className="topbar__bellWrap">
              <button
                type="button"
                className="topbar__icon"
                aria-label={t.app.notifications.open}
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((v) => !v)}
              >
                <IconBell size={19} />
                {unread > 0 && <span className="topbar__unread" aria-hidden="true" />}
              </button>
              <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            <NavLink to={SETTINGS_PATH} className="topbar__icon" aria-label={t.app.settings.title}>
              <IconSettings size={19} />
            </NavLink>
          </div>
        </div>

        <p className="appshell__demo meta">{t.app.demo}</p>
        <UnreachableBanner />

        {takeover ? <Onboarding /> : <Outlet />}
      </div>

      <nav className="appshell__tabbar" aria-label={t.nav.menu}>
        {TABS.map(({ to, end, key, Icon }) => (
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

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
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
