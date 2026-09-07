import { useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Download from './pages/Download'
import Privacy from './pages/Privacy'
import About from './pages/About'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import AppLayout from './app/AppLayout'
import Today from './app/screens/Today'
import Assignments from './app/screens/Assignments'
import Schedule from './app/screens/Schedule'
import Grades from './app/screens/Grades'
import Groups from './app/screens/Groups'
import Sources from './app/screens/Sources'
import { RequireAuth } from './auth'
import { useI18n } from './i18n'

const TITLES = {
  nl: {
    '/': 'Bundel · rooster, opdrachten en cijfers naast elkaar',
    '/login': 'Inloggen · Bundel',
    '/download': 'Downloaden · Bundel',
    '/privacy': 'Privacy · Bundel',
    '/over': 'Over Bundel',
    '/voorwaarden': 'Voorwaarden · Bundel',
    '/app': 'Vandaag · Bundel',
    '/app/opdrachten': 'Opdrachten · Bundel',
    '/app/rooster': 'Rooster · Bundel',
    '/app/cijfers': 'Cijfers · Bundel',
    '/app/groepen': 'Groepen · Bundel',
    '/app/bronnen': 'Bronnen · Bundel',
  },
  en: {
    '/': 'Bundel · timetable, assignments and grades side by side',
    '/login': 'Log in · Bundel',
    '/download': 'Download · Bundel',
    '/privacy': 'Privacy · Bundel',
    '/over': 'About Bundel',
    '/voorwaarden': 'Terms · Bundel',
    '/app': 'Today · Bundel',
    '/app/opdrachten': 'Assignments · Bundel',
    '/app/rooster': 'Timetable · Bundel',
    '/app/cijfers': 'Grades · Bundel',
    '/app/groepen': 'Groups · Bundel',
    '/app/bronnen': 'Sources · Bundel',
  },
}

/** Naar boven bij paginawissel, of naar het anker als de URL er een heeft. */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname, hash])

  return null
}

function DocumentTitle() {
  const { lang } = useI18n()
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = TITLES[lang][pathname] ?? 'Bundel'
  }, [lang, pathname])

  return null
}

/** De publieke site: header, inhoud, footer. */
function SiteLayout() {
  const { t } = useI18n()

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        {t.nav.skip}
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <DocumentTitle />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/download" element={<Download />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/over" element={<About />} />
          <Route path="/voorwaarden" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Today />} />
          <Route path="opdrachten" element={<Assignments />} />
          <Route path="rooster" element={<Schedule />} />
          <Route path="cijfers" element={<Grades />} />
          <Route path="groepen" element={<Groups />} />
          <Route path="bronnen" element={<Sources />} />
        </Route>
      </Routes>
    </>
  )
}
