/* eslint-disable no-console */
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { I18nProvider } from './i18n'
import { AuthProvider } from './auth'
import { AppStateContext } from './app/state'
import * as store from './app/store'
import Today from './app/screens/Today'
import Assignments from './app/screens/Assignments'
import Schedule from './app/screens/Schedule'
import Grades from './app/screens/Grades'
import Attendance from './app/screens/Attendance'
import Groups from './app/screens/Groups'
import Sources from './app/screens/Sources'
import Settings from './app/screens/Settings'
import Onboarding from './app/screens/Onboarding'
import Home from './pages/Home'
import LoginPage from './pages/Login'
import NewPassword from './pages/NewPassword'
import Download from './pages/Download'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import About from './pages/About'
import NotFound from './pages/NotFound'
import {
  getToday,
  getWeek,
  getWeeks,
  getAssignments,
  getGrades,
  getGradeStats,
  getGroups,
  getAttendance,
  getNotifications,
  getStudent,
  search,
} from './app/data'

/**
 * Rendertest zonder browser. Zet een nep-PostgREST neer, laat de app zichzelf
 * daar vullen, en rendert daarna elk scherm. Zo zie je of het schrijven naar
 * en het lezen uit de database bij elkaar passen en of niets crasht.
 *
 * Draaien: npx vite build --ssr src/__smoke.jsx --outDir .smoke && node .smoke/__smoke.js
 */

// ---------------------------------------------------------------- nep-database

const db = {}
let counter = 0

function respond(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

globalThis.fetch = async (input, options = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url)
  const table = url.pathname.replace('/rest/v1/', '')
  const method = options.method ?? 'GET'
  const headers = new Headers(options.headers ?? {})
  const single = String(headers.get('Accept') ?? '').includes('pgrst.object')
  const rows = (db[table] ??= [])

  /* De echte database vult standaardwaarden in, dus dat doet de nepversie ook. */
  const defaults =
    table === 'profiles'
      ? {
          start_screen: '/app',
          notifications_on: true,
          notify_deadline: true,
          notify_grade: true,
          notify_message: true,
          notify_schedule: true,
          seeded_at: null,
        }
      : {}

  if (method === 'POST') {
    const body = JSON.parse(options.body)
    const added = (Array.isArray(body) ? body : [body]).map((row) => ({
      id: row.id ?? `row-${(counter += 1)}`,
      ...defaults,
      ...row,
    }))
    rows.push(...added)
    return respond(single ? added[0] : added)
  }

  if (method === 'PATCH') {
    const patch = JSON.parse(options.body)
    rows.forEach((row) => Object.assign(row, patch))
    return respond(single ? rows[0] : rows)
  }

  if (method === 'DELETE') {
    db[table] = []
    return respond([])
  }

  /* Filters doen er hier niet toe: elke gebruiker heeft zijn eigen nep-database. */
  if (single && rows.length === 0) {
    return respond({ code: 'PGRST116', details: 'The result contains 0 rows', message: 'no rows' }, 406)
  }
  return respond(single ? rows[0] : rows)
}

// ---------------------------------------------------------------- controle

let failures = 0

function check(label, condition) {
  if (condition) return
  failures += 1
  console.error(`FOUT: ${label}`)
}

function html(label, element) {
  try {
    const out = renderToString(element)
    check(`${label} rendert iets`, out.length > 50)
    return out
  } catch (error) {
    failures += 1
    console.error(`FOUT: ${label} crasht -> ${error.message}`)
    return ''
  }
}

// ---------------------------------------------------------------- draaien

async function main() {


  const user = { id: 'test-user', email: 'test@school.nl', user_metadata: { name: 'Luca Verhoeven' } }

  const state = await store.load(user)

  /* Wat de datalaag na het laden uit de database haalt. */
  check('vijf weken', getWeeks('nl').length === 5)
  check('rooster van deze week heeft vijf dagen', getWeek('nl', 2).length === 5)
  check('maandag heeft vier lessen', getWeek('nl', 2)[0].lessons.length === 4)
  check('lessen hebben een eindtijd na de begintijd', getWeek('nl', 2)[0].lessons.every((l) => l.finish > l.start))
  check('lessen hebben een docent', getWeek('nl', 2)[0].lessons.every((l) => Boolean(l.teacher)))
  check('lege week 39 heeft geen lessen', getWeeks('nl')[4].empty)
  check('elf opdrachten', getAssignments('nl').length === 11)
  check('opdrachten staan op datum', getAssignments('nl')[0].dueDate === '27/08')
  check('opdrachten kennen hun vak', getAssignments('nl').every((a) => a.subject && a.subject !== a.subjectKey))
  check('vijf vakken met cijfers', getGrades('nl').length === 5)
  check('gewogen gemiddelde van Interaction Design is 7.9', getGrades('nl').find((g) => g.subjectKey === 'ixd').average === 7.9)
  check('vier cijfers hebben een opmerking', getGrades('nl').flatMap((g) => g.entries).filter((e) => e.remark).length === 4)
  check('er staat een onvoldoende tussen de cijfers', getGradeStats('nl').lowMarks.length > 0)
  check('twee groepen', getGroups('nl').length === 2)
  check('de eerste groep heeft vier leden', getGroups('nl')[0].members.length === 4)
  check('groepsberichten staan op volgorde', getGroups('nl')[0].messages[0].from === 'Jayden')
  check('vijf meldingen', getNotifications('nl').length === 5)
  check('aanwezigheid is er alleen voor lessen die geweest zijn', getAttendance('nl').every((r) => r.date <= '07/09' || r.date.endsWith('/08')))
  check('aanwezigheid kent afwijkingen', getAttendance('nl').some((r) => r.status === 'late'))
  check('de student heet zoals bij het aanmelden', getStudent().name === 'Luca Verhoeven')
  check('zoeken vindt een les', search('studio', 'nl').some((r) => r.type === 'lesson'))
  check('zoeken vindt een opmerking bij een cijfer', search('herkansen', 'nl').some((r) => r.type === 'grade'))
  check('vandaag heeft lessen', getToday('nl').lessons.length > 0)

  /* De toestand die uit de database komt. */
  check('niets afgevinkt bij de start', Object.keys(state.done).length === 0)
  check('vier bronnen gekoppeld', Object.values(state.sources).every((s) => s.connected))
  check('een groepstaak staat af', Object.values(state.groupTasks).filter(Boolean).length === 2)
  check('geen eigen items bij de start', state.ownItems.length === 0)
  check('meldingen staan aan', state.notificationsOn === true)

  /* Alle schermen renderen met die data. */
  const value = {
    ...state,
    status: () => 'ok',
    unreachable: [],
    noSources: false,
    sentMessages: {},
    isRead: () => false,
    markRead: () => {},
    markAllRead: () => {},
    toggleDone: () => {},
    toggleConnected: () => {},
    toggleReachable: () => {},
    connectAll: () => {},
    sendMessage: () => {},
    toggleGroupTask: () => {},
    toggleNotifyKind: () => {},
    setNotificationsOn: () => {},
    setStartScreen: () => {},
    syncNow: () => {},
    syncing: [],
    addOwnItem: () => {},
    updateOwnItem: () => {},
    removeOwnItem: () => {},
    resetAll: () => {},
  }

  const screens = [
    ['Vandaag', Today],
    ['Opdrachten', Assignments],
    ['Rooster', Schedule],
    ['Cijfers', Grades],
    ['Aanwezigheid', Attendance],
    ['Groepen', Groups],
    ['Bronnen', Sources],
    ['Instellingen', Settings],
    ['Onboarding', Onboarding],
  ]

  screens.forEach(([name, Screen]) => {
    html(
      `scherm ${name}`,
      <I18nProvider>
        <AuthProvider>
          <StaticRouter location="/app">
            <AppStateContext.Provider value={value}>
              <Screen />
            </AppStateContext.Provider>
          </StaticRouter>
        </AuthProvider>
      </I18nProvider>,
    )
  })

  /* En de publieke pagina's, die geen database nodig hebben. */
  const login = html(
    'pagina Login',
    <I18nProvider>
      <AuthProvider>
        <StaticRouter location="/login">
          <LoginPage />
        </StaticRouter>
      </AuthProvider>
    </I18nProvider>,
  )
  check('inloggen biedt aanmelden aan', login.includes('Account aanmaken'))
  check('inloggen biedt wachtwoord vergeten aan', login.includes('Wachtwoord vergeten?'))

  const pages = [
    ['Home', Home],
    ['Download', Download],
    ['Privacy', Privacy],
    ['Voorwaarden', Terms],
    ['Over', About],
    ['404', NotFound],
    ['Nieuw wachtwoord', NewPassword],
  ]

  pages.forEach(([name, Page]) => {
    html(
      `pagina ${name}`,
      <I18nProvider>
        <AuthProvider>
          <StaticRouter location="/">
            <Page />
          </StaticRouter>
        </AuthProvider>
      </I18nProvider>,
    )
  })

  console.log(failures === 0 ? 'alles goed' : `${failures} fout(en)`)
  process.exit(failures === 0 ? 0 : 1)
}

main()
