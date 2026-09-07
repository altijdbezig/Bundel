/**
 * Datalaag van de app-demo.
 *
 * DIT IS DE ENIGE PLEK MET NEPDATA. De schermen roepen alleen de functies
 * onderaan aan en weten niet waar de data vandaan komt. Zodra de back-end
 * er is, vervang je de bodies van die functies door API-aanroepen en
 * blijven alle schermen ongewijzigd. Houd de vorm van wat je teruggeeft
 * gelijk aan wat hier staat.
 *
 * Alle functies nemen `lang` ('nl' of 'en') en geven kant-en-klare strings.
 */

const t = (nl, en) => ({ nl, en })
const pick = (value, lang) => (value && typeof value === 'object' && 'nl' in value ? value[lang] ?? value.nl : value)

// ---------------------------------------------------------------- bronnen

export const SOURCE_KEYS = ['canvas', 'teams', 'magister', 'own']

const SOURCES = {
  canvas: {
    name: 'Canvas',
    color: 'var(--source-canvas)',
    about: t(
      'Open REST API met OAuth2. Cursussen, opdrachten en deadlines. Makkelijkste bron.',
      'Open REST API with OAuth2. Courses, assignments and deadlines. The easiest source.',
    ),
    sync: t('sync elke 15 min', 'syncs every 15 min'),
    lastSync: '12:04',
  },
  teams: {
    name: 'Microsoft Teams',
    color: 'var(--source-teams)',
    about: t(
      'Microsoft Graph, OAuth2. De schoolbeheerder moet de app eerst goedkeuren.',
      'Microsoft Graph, OAuth2. The school administrator has to approve the app first.',
    ),
    sync: t('sync via webhook', 'syncs via webhook'),
    lastSync: '12:11',
  },
  magister: {
    name: 'Magister',
    color: 'var(--source-magister)',
    about: t(
      'Geen officiële publieke API. Voorlopig handmatig invoeren of een export uploaden.',
      'No official public API. For now you enter grades by hand or upload an export.',
    ),
    sync: t('handmatig', 'manual'),
    lastSync: '09:40',
  },
  own: {
    name: t('Eigen', 'Bundel'),
    color: 'var(--source-own)',
    about: t(
      'Eigen taken, notities en groepswerk. Deze data staat alleen bij ons.',
      'Your own tasks, notes and group work. This data lives with us only.',
    ),
    sync: t('realtime', 'real time'),
    lastSync: '12:12',
  },
}

// ---------------------------------------------------------------- vakken

const SUBJECTS = {
  theory: t('Mediatheorie', 'Media Theory'),
  ixd: t('Interaction Design', 'Interaction Design'),
  concepting: t('Concepting', 'Concepting'),
  project: t('Projecturen', 'Project hours'),
  design: t('Vormgeving', 'Design'),
  english: t('Engels', 'English'),
  career: t('Loopbaan', 'Career'),
}

// ---------------------------------------------------------------- rooster

const TODAY_LESSONS = [
  { time: '08:30 - 09:20', subject: 'theory', room: 'B1.04', now: false },
  { time: '09:30 - 11:00', subject: 'ixd', room: 'A2.11', now: true },
  { time: '11:15 - 12:45', subject: 'concepting', room: 'A2.11', now: false },
  { time: '13:30 - 15:30', subject: 'project', room: 'Studio 3', now: false },
]

const WEEK = [
  {
    day: t('Maandag', 'Monday'),
    date: '07/09',
    today: true,
    lessons: [
      { time: '08:30', subject: 'theory', room: 'B1.04' },
      { time: '09:30', subject: 'ixd', room: 'A2.11' },
      { time: '11:15', subject: 'concepting', room: 'A2.11' },
      { time: '13:30', subject: 'project', room: 'Studio 3' },
    ],
  },
  {
    day: t('Dinsdag', 'Tuesday'),
    date: '08/09',
    today: false,
    lessons: [
      { time: '09:30', subject: 'design', room: 'A1.02' },
      { time: '11:15', subject: 'english', room: 'C0.07' },
    ],
  },
  {
    day: t('Woensdag', 'Wednesday'),
    date: '09/09',
    today: false,
    lessons: [
      { time: '08:30', subject: 'project', room: 'Studio 3' },
      { time: '13:30', subject: 'career', room: 'B0.11' },
    ],
  },
  {
    day: t('Donderdag', 'Thursday'),
    date: '10/09',
    today: false,
    lessons: [
      { time: '09:30', subject: 'ixd', room: 'A2.11' },
      { time: '11:15', subject: 'theory', room: 'B1.04' },
      { time: '14:00', subject: 'project', room: 'Studio 3' },
    ],
  },
  {
    day: t('Vrijdag', 'Friday'),
    date: '11/09',
    today: false,
    lessons: [{ time: '10:00', subject: 'design', room: 'A1.02' }],
  },
]

// ---------------------------------------------------------------- opdrachten

const ASSIGNMENTS = [
  {
    id: 't1',
    title: t('Moodboard interactief concept inleveren', 'Hand in interactive concept moodboard'),
    subject: 'ixd',
    source: 'canvas',
    due: t('vandaag 17:00', 'today 17:00'),
    urgent: true,
  },
  {
    id: 't2',
    title: t('Assets exporteren voor Jayden', 'Export assets for Jayden'),
    subject: 'project',
    source: 'own',
    due: t('di 8 sep', 'Tue 8 Sep'),
    urgent: true,
  },
  {
    id: 't3',
    title: t('Onderzoeksverslag doelgroep', 'Audience research report'),
    subject: 'theory',
    source: 'canvas',
    due: t('wo 10 sep', 'Wed 10 Sep'),
    urgent: false,
  },
  {
    id: 't4',
    title: t('Storyboard uploaden in kanaal', 'Upload storyboard to the channel'),
    subject: 'concepting',
    source: 'teams',
    due: t('do 11 sep', 'Thu 11 Sep'),
    urgent: false,
  },
  {
    id: 't5',
    title: t('Toets kleurtheorie voorbereiden', 'Prepare colour theory test'),
    subject: 'design',
    source: 'magister',
    due: t('vr 12 sep', 'Fri 12 Sep'),
    urgent: false,
  },
  {
    id: 't6',
    title: t('Planning inleveren', 'Hand in planning'),
    subject: 'career',
    source: 'canvas',
    due: t('vr 4 sep', 'Fri 4 Sep'),
    urgent: false,
  },
]

// ---------------------------------------------------------------- cijfers

const GRADES = [
  { subject: 'ixd', last: t('laatste 4 sep', 'last 4 Sep'), marks: [7.5, 8.0, 8.0] },
  { subject: 'theory', last: t('laatste 2 sep', 'last 2 Sep'), marks: [5.8, 7.0] },
  { subject: 'concepting', last: t('laatste 29 aug', 'last 29 Aug'), marks: [8.4, 8.0] },
  { subject: 'design', last: t('laatste 28 aug', 'last 28 Aug'), marks: [7.2, 6.8, 7.4] },
  { subject: 'english', last: t('laatste 26 aug', 'last 26 Aug'), marks: [8.0] },
]

const RECENT_GRADES = [
  { subject: 'ixd', what: t('Prototype v1', 'Prototype v1'), mark: 8.0 },
  { subject: 'theory', what: t('Deeltoets', 'Partial test'), mark: 7.0 },
  { subject: 'concepting', what: t('Pitch', 'Pitch'), mark: 8.4 },
]

// ---------------------------------------------------------------- groepen

const GROUPS = [
  {
    id: 'g1',
    name: t('Groep 4 · App-project', 'Group 4 · App project'),
    subject: 'ixd',
    members: [
      { name: 'Luca Verhoeven', initials: 'LV', self: true },
      { name: 'Jayden Bakker', initials: 'JB', self: false },
      { name: 'Noor Kramer', initials: 'NK', self: false },
      { name: 'Sam de Wit', initials: 'SW', self: false },
    ],
    messages: [
      {
        id: 1,
        from: 'Jayden',
        initials: 'JB',
        time: '09:12',
        self: false,
        text: t(
          'Tokenrefresh werkt. Canvas-assignments komen nu binnen als Task.',
          'Token refresh works. Canvas assignments now arrive as Task.',
        ),
      },
      {
        id: 2,
        from: 'Noor',
        initials: 'NK',
        time: '09:20',
        self: false,
        text: t(
          'Top. Ik zet de deadlines in het moodboard zodat we ze kunnen tonen.',
          'Good. I will put the deadlines in the moodboard so we can show them.',
        ),
      },
      {
        id: 3,
        from: 'Luca',
        initials: 'LV',
        time: '09:31',
        self: true,
        text: t(
          'Ik pak vandaag het Vandaag-scherm. Rooster en taken naast elkaar.',
          'I am taking the Today screen. Timetable and tasks side by side.',
        ),
      },
      {
        id: 4,
        from: 'Jayden',
        initials: 'JB',
        time: '10:02',
        self: false,
        text: t(
          'Denk aan de foutstatus per bron, niet de hele pagina leeg als Canvas plat gaat.',
          'Remember the per-source error state, not a blank page when Canvas goes down.',
        ),
      },
    ],
  },
  {
    id: 'g2',
    name: t('Mediatheorie duo', 'Media Theory duo'),
    subject: 'theory',
    members: [
      { name: 'Luca Verhoeven', initials: 'LV', self: true },
      { name: 'Sam de Wit', initials: 'SW', self: false },
    ],
    messages: [
      {
        id: 1,
        from: 'Sam',
        initials: 'SW',
        time: 'gisteren',
        self: false,
        text: t('Ik heb de bronnenlijst aangevuld.', 'I added to the source list.'),
      },
    ],
  },
]

// ================================================================
// Publieke functies. Alleen deze worden door de schermen gebruikt.
// ================================================================

export function getStudent() {
  return {
    name: 'Luca Verhoeven',
    initials: 'LV',
    course: t('Mediavormgeving · lj 3', 'Media Design · yr 3'),
  }
}

export function getStudentCourse(lang) {
  return pick(getStudent().course, lang)
}

export function getToday(lang) {
  return {
    label: lang === 'en' ? 'Mon 7 Sep' : 'Ma 7 sep',
    title: lang === 'en' ? 'Monday 7 September' : 'Maandag 7 september',
    lessons: TODAY_LESSONS.map((l) => ({ ...l, subject: pick(SUBJECTS[l.subject], lang) })),
  }
}

export function getWeek(lang) {
  return WEEK.map((d) => ({
    ...d,
    day: pick(d.day, lang),
    lessons: d.lessons.map((l) => ({ ...l, subject: pick(SUBJECTS[l.subject], lang) })),
  }))
}

export function getAssignments(lang) {
  return ASSIGNMENTS.map((a) => ({
    ...a,
    title: pick(a.title, lang),
    subject: pick(SUBJECTS[a.subject], lang),
    due: pick(a.due, lang),
    sourceName: pick(SOURCES[a.source].name, lang),
    sourceColor: SOURCES[a.source].color,
  }))
}

export function getGrades(lang) {
  return GRADES.map((g) => {
    const average = g.marks.reduce((a, b) => a + b, 0) / g.marks.length
    return {
      subject: pick(SUBJECTS[g.subject], lang),
      last: pick(g.last, lang),
      marks: g.marks,
      average: Math.round(average * 10) / 10,
      count: g.marks.length,
    }
  })
}

export function getAverage() {
  const all = GRADES.flatMap((g) => g.marks)
  return Math.round((all.reduce((a, b) => a + b, 0) / all.length) * 10) / 10
}

export function getRecentGrades(lang) {
  return RECENT_GRADES.map((g) => ({
    ...g,
    subject: pick(SUBJECTS[g.subject], lang),
    what: pick(g.what, lang),
  }))
}

export function getGroups(lang) {
  return GROUPS.map((g) => ({
    ...g,
    name: pick(g.name, lang),
    subject: pick(SUBJECTS[g.subject], lang),
    messages: g.messages.map((m) => ({ ...m, text: pick(m.text, lang) })),
  }))
}

export function getSources(lang) {
  return SOURCE_KEYS.map((key) => ({
    key,
    name: pick(SOURCES[key].name, lang),
    color: SOURCES[key].color,
    about: pick(SOURCES[key].about, lang),
    sync: pick(SOURCES[key].sync, lang),
    lastSync: SOURCES[key].lastSync,
  }))
}

/** Kleur van een bron, voor stippen en randjes. Nooit als vlak gebruiken. */
export function sourceColor(key) {
  return SOURCES[key]?.color ?? 'var(--ink-600)'
}

export function sourceName(key, lang) {
  return pick(SOURCES[key]?.name, lang) ?? key
}
