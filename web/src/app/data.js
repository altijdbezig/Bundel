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

/* Docent per vak. Nepdata, net als de rest. */
const TEACHERS = {
  theory: 'M. de Groot',
  ixd: 'S. Willems',
  concepting: 'S. Willems',
  project: 'R. Aydin',
  design: 'K. Peters',
  english: 'L. Janssen',
  career: 'R. Aydin',
}

/**
 * Vaste "nu" van de demo: maandag 10:15, midden in Interaction Design.
 * Zo staat de nu-streep altijd op dezelfde plek, ongeacht wanneer je kijkt.
 * Vervang dit door de echte klok zodra de app live data toont.
 */
export const DEMO_NOW_MINUTES = 10 * 60 + 15

/** "09:30" naar minuten sinds middernacht. */
export function toMinutes(time) {
  const [h, m] = String(time).split(':').map(Number)
  return h * 60 + m
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
    short: t('ma', 'Mon'),
    date: '07/09',
    today: true,
    lessons: [
      { time: '08:30', end: '09:20', subject: 'theory', room: 'B1.04' },
      { time: '09:30', end: '11:00', subject: 'ixd', room: 'A2.11' },
      { time: '11:15', end: '12:45', subject: 'concepting', room: 'A2.11' },
      { time: '13:30', end: '15:30', subject: 'project', room: 'Studio 3' },
    ],
  },
  {
    day: t('Dinsdag', 'Tuesday'),
    short: t('di', 'Tue'),
    date: '08/09',
    today: false,
    lessons: [
      { time: '09:30', end: '11:00', subject: 'design', room: 'A1.02' },
      { time: '11:15', end: '12:45', subject: 'english', room: 'C0.07' },
    ],
  },
  {
    day: t('Woensdag', 'Wednesday'),
    short: t('wo', 'Wed'),
    date: '09/09',
    today: false,
    lessons: [
      { time: '08:30', end: '12:00', subject: 'project', room: 'Studio 3' },
      { time: '13:30', end: '14:30', subject: 'career', room: 'B0.11' },
    ],
  },
  {
    day: t('Donderdag', 'Thursday'),
    short: t('do', 'Thu'),
    date: '10/09',
    today: false,
    lessons: [
      { time: '09:30', end: '11:00', subject: 'ixd', room: 'A2.11' },
      { time: '11:15', end: '12:45', subject: 'theory', room: 'B1.04' },
      { time: '14:00', end: '16:00', subject: 'project', room: 'Studio 3' },
    ],
  },
  {
    day: t('Vrijdag', 'Friday'),
    short: t('vr', 'Fri'),
    date: '11/09',
    today: false,
    lessons: [{ time: '10:00', end: '12:00', subject: 'design', room: 'A1.02' }],
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
    dueDate: '07/09',
    urgent: true,
  },
  {
    id: 't2',
    title: t('Assets exporteren voor Jayden', 'Export assets for Jayden'),
    subject: 'project',
    source: 'own',
    due: t('di 8 sep', 'Tue 8 Sep'),
    dueDate: '08/09',
    urgent: true,
  },
  {
    id: 't3',
    title: t('Onderzoeksverslag doelgroep', 'Audience research report'),
    subject: 'theory',
    source: 'canvas',
    due: t('wo 10 sep', 'Wed 10 Sep'),
    dueDate: '09/09',
    urgent: false,
  },
  {
    id: 't4',
    title: t('Storyboard uploaden in kanaal', 'Upload storyboard to the channel'),
    subject: 'concepting',
    source: 'teams',
    due: t('do 11 sep', 'Thu 11 Sep'),
    dueDate: '10/09',
    urgent: false,
  },
  {
    id: 't5',
    title: t('Toets kleurtheorie voorbereiden', 'Prepare colour theory test'),
    subject: 'design',
    source: 'magister',
    due: t('vr 12 sep', 'Fri 12 Sep'),
    dueDate: '11/09',
    urgent: false,
  },
  {
    id: 't6',
    title: t('Planning inleveren', 'Hand in planning'),
    subject: 'career',
    source: 'canvas',
    due: t('vr 4 sep', 'Fri 4 Sep'),
    dueDate: null,
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

// ---------------------------------------------------------------- meldingen

const NOTIFICATIONS = [
  {
    id: 'n1',
    kind: 'deadline',
    source: 'canvas',
    time: '12:04',
    title: t('Moodboard moet vandaag om 17:00 in', 'Moodboard is due today at 17:00'),
    body: t('Interaction Design', 'Interaction Design'),
    to: '/app/opdrachten',
  },
  {
    id: 'n2',
    kind: 'grade',
    source: 'magister',
    time: '09:41',
    title: t('Nieuw cijfer: 8.0 voor Prototype v1', 'New grade: 8.0 for Prototype v1'),
    body: t('Interaction Design', 'Interaction Design'),
    to: '/app/cijfers',
  },
  {
    id: 'n3',
    kind: 'message',
    source: 'own',
    time: '10:02',
    title: t('Jayden schreef in Groep 4', 'Jayden posted in Group 4'),
    body: t('Denk aan de foutstatus per bron.', 'Remember the per-source error state.'),
    to: '/app/groepen',
  },
  {
    id: 'n4',
    kind: 'grade',
    source: 'magister',
    time: 'gisteren',
    title: t('Nieuw cijfer: 7.0 voor Deeltoets', 'New grade: 7.0 for the partial test'),
    body: t('Mediatheorie', 'Media Theory'),
    to: '/app/cijfers',
  },
  {
    id: 'n5',
    kind: 'schedule',
    source: 'magister',
    time: 'gisteren',
    title: t('Lokaalwijziging donderdag', 'Room change on Thursday'),
    body: t('Projecturen nu in Studio 3', 'Project hours now in Studio 3'),
    to: '/app/rooster',
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
    short: pick(d.short, lang),
    lessons: d.lessons.map((l) => ({
      ...l,
      subjectKey: l.subject,
      subject: pick(SUBJECTS[l.subject], lang),
      teacher: TEACHERS[l.subject],
      start: toMinutes(l.time),
      finish: toMinutes(l.end),
      /* Hoort er die dag een deadline bij dit vak? Dat verbindt rooster en opdrachten. */
      deadline: ASSIGNMENTS.some((a) => a.dueDate === d.date && a.subject === l.subject),
    })),
  }))
}

/** Vroegste begintijd en laatste eindtijd van de week, in minuten. */
export function getWeekBounds() {
  const all = WEEK.flatMap((d) => d.lessons)
  if (all.length === 0) return { from: 8 * 60, to: 16 * 60 }
  return {
    from: Math.min(...all.map((l) => toMinutes(l.time))),
    to: Math.max(...all.map((l) => toMinutes(l.end))),
  }
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

export function getNotifications(lang) {
  return NOTIFICATIONS.map((n) => ({
    ...n,
    title: pick(n.title, lang),
    body: pick(n.body, lang),
    sourceName: pick(SOURCES[n.source].name, lang),
    sourceColor: SOURCES[n.source].color,
  }))
}

/**
 * Zoekt door opdrachten, lessen, groepen en berichten.
 * Geeft platte resultaten terug met het type erbij, zodat het scherm
 * niet hoeft te weten waar iets vandaan komt.
 */
export function search(query, lang) {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const hit = (text) => String(text).toLowerCase().includes(q)
  const results = []

  getAssignments(lang).forEach((a) => {
    if (hit(a.title) || hit(a.subject)) {
      results.push({
        id: `a-${a.id}`,
        type: 'assignment',
        title: a.title,
        meta: `${a.subject} · ${a.due}`,
        color: a.sourceColor,
        sourceName: a.sourceName,
        to: '/app/opdrachten',
      })
    }
  })

  getWeek(lang).forEach((d) => {
    d.lessons.forEach((l) => {
      if (hit(l.subject) || hit(l.room)) {
        results.push({
          id: `l-${d.date}-${l.time}-${l.subject}`,
          type: 'lesson',
          title: l.subject,
          meta: `${d.day} ${l.time} · ${l.room}`,
          color: SOURCES.magister.color,
          sourceName: pick(SOURCES.magister.name, lang),
          to: '/app/rooster',
        })
      }
    })
  })

  getGrades(lang).forEach((g) => {
    if (hit(g.subject)) {
      results.push({
        id: `g-${g.subject}`,
        type: 'grade',
        title: g.subject,
        meta: `${g.average.toFixed(1)} ${lang === 'en' ? 'average' : 'gemiddeld'}`,
        color: SOURCES.magister.color,
        sourceName: pick(SOURCES.magister.name, lang),
        to: '/app/cijfers',
      })
    }
  })

  getGroups(lang).forEach((group) => {
    if (hit(group.name) || hit(group.subject)) {
      results.push({
        id: `gr-${group.id}`,
        type: 'group',
        title: group.name,
        meta: group.subject,
        color: SOURCES.own.color,
        sourceName: pick(SOURCES.own.name, lang),
        to: '/app/groepen',
      })
    }
    group.messages.forEach((m) => {
      if (hit(m.text)) {
        results.push({
          id: `m-${group.id}-${m.id}`,
          type: 'message',
          title: m.text,
          meta: `${m.from} · ${group.name}`,
          color: SOURCES.own.color,
          sourceName: pick(SOURCES.own.name, lang),
          to: '/app/groepen',
        })
      }
    })
  })

  return results
}

/** Kleur van een bron, voor stippen en randjes. Nooit als vlak gebruiken. */
export function sourceColor(key) {
  return SOURCES[key]?.color ?? 'var(--ink-600)'
}

export function sourceName(key, lang) {
  return pick(SOURCES[key]?.name, lang) ?? key
}
