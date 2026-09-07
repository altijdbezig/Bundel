import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Download from './pages/Download'
import Privacy from './pages/Privacy'
import About from './pages/About'
import NotFound from './pages/NotFound'
import { useI18n } from './i18n'

const TITLES = {
  nl: {
    '/': 'Bundel · rooster, opdrachten en cijfers naast elkaar',
    '/login': 'Inloggen · Bundel',
    '/download': 'Downloaden · Bundel',
    '/privacy': 'Privacy · Bundel',
    '/over': 'Over Bundel',
  },
  en: {
    '/': 'Bundel · timetable, assignments and grades side by side',
    '/login': 'Log in · Bundel',
    '/download': 'Download · Bundel',
    '/privacy': 'Privacy · Bundel',
    '/over': 'About Bundel',
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
    document.title = TITLES[lang][pathname] ?? (lang === 'nl' ? 'Bundel' : 'Bundel')
  }, [lang, pathname])

  return null
}

export default function App() {
  const { t } = useI18n()

  return (
    <div className="app">
      <ScrollManager />
      <DocumentTitle />
      <a className="skip-link" href="#main">
        {t.nav.skip}
      </a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/download" element={<Download />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/over" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
