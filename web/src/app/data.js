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

// ---------------------------------------------------------------- de dataset

/**
 * Alles wat bij een ingelogde gebruiker hoort. Wordt gevuld door `load()` in
 * store.js, dat het uit Supabase haalt. Zolang dit leeg is toont de app een
 * laadscherm, dus de functies hieronder gaan ervan uit dat het klaarstaat.
 */
let STUDENT = { name: '', initials: '', course: t('', '') }
let SUBJECTS = {}
let TEACHERS = {}
let WEEKS = []
let ASSIGNMENTS = []
let GRADES = []
let GROUPS = []
let NOTIFICATIONS = []
let ATTENDANCE = {}
let LAST_SYNC = {}

/** Zet de geladen data klaar. Alleen store.js roept dit aan. */
export function setDataset(next) {
  STUDENT = next.student
  SUBJECTS = next.subjects
  TEACHERS = next.teachers
  WEEKS = next.weeks
  ASSIGNMENTS = next.assignments
  GRADES = next.grades
  GROUPS = next.groups
  NOTIFICATIONS = next.notifications
  ATTENDANCE = next.attendance
  LAST_SYNC = next.lastSync ?? {}
}

/** Leeggooien bij uitloggen, zodat de volgende gebruiker niets van de vorige ziet. */
export function clearDataset() {
  setDataset({
    student: { name: '', initials: '', course: t('', '') },
    subjects: {},
    teachers: {},
    weeks: [],
    assignments: [],
    grades: [],
    groups: [],
    notifications: [],
    attendance: {},
  })
}

// ---------------------------------------------------------------- rooster

/* Dagnamen staan een keer, de weken verwijzen ernaar op volgorde. */
const DAY_NAMES = [
  { day: t('Maandag', 'Monday'), short: t('ma', 'Mon') },
  { day: t('Dinsdag', 'Tuesday'), short: t('di', 'Tue') },
  { day: t('Woensdag', 'Wednesday'), short: t('wo', 'Wed') },
  { day: t('Donderdag', 'Thursday'), short: t('do', 'Thu') },
  { day: t('Vrijdag', 'Friday'), short: t('vr', 'Fri') },
]

/* Welke dag van de week "vandaag" is in de demo. 0 is maandag. */
const TODAY_INDEX = 0

/* De demo loopt over vijf weken. Index 2 is de week waar je in zit. */
const CURRENT_WEEK = 2

// ================================================================
// Publieke functies. Alleen deze worden door de schermen gebruikt.
// ================================================================

export function getStudent() {
  return STUDENT
}

export function getStudentCourse(lang) {
  return pick(getStudent().course, lang)
}

export const CURRENT_WEEK_INDEX = CURRENT_WEEK

/** Overzicht van de weken, voor de bladerknoppen. */
export function getWeeks(lang) {
  return WEEKS.map((w, index) => ({
    index,
    number: w.number,
    range: pick(w.range, lang),
    note: w.note ? pick(w.note, lang) : null,
    empty: w.days.every((d) => d.lessons.length === 0),
    current: index === CURRENT_WEEK,
    past: index < CURRENT_WEEK,
  }))
}

export function getToday(lang) {
  const day = getWeek(lang, CURRENT_WEEK)[TODAY_INDEX] ?? { lessons: [] }
  return {
    label: lang === 'en' ? 'Mon 7 Sep' : 'Ma 7 sep',
    title: lang === 'en' ? 'Monday 7 September' : 'Maandag 7 september',
    lessons: day.lessons.map((l) => ({
      ...l,
      now: DEMO_NOW_MINUTES >= l.start && DEMO_NOW_MINUTES < l.finish,
    })),
  }
}

export function getWeek(lang, index = CURRENT_WEEK) {
  const week = WEEKS[index] ?? WEEKS[CURRENT_WEEK] ?? { days: [] }

  return week.days.map((d, dayIndex) => ({
    date: d.date,
    day: pick(DAY_NAMES[dayIndex].day, lang),
    short: pick(DAY_NAMES[dayIndex].short, lang),
    today: index === CURRENT_WEEK && dayIndex === TODAY_INDEX,
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

/**
 * Vroegste begintijd en laatste eindtijd over alle weken. Het raster houdt
 * daarmee dezelfde hoogte terwijl je bladert, zodat er niets verspringt.
 */
export function getWeekBounds() {
  const all = WEEKS.flatMap((w) => w.days.flatMap((d) => d.lessons))
  if (all.length === 0) return { from: 8 * 60, to: 16 * 60 }
  return {
    from: Math.min(...all.map((l) => toMinutes(l.time))),
    to: Math.max(...all.map((l) => toMinutes(l.end))),
  }
}

/** Alles wat bij een vak hoort, voor de pop-up als je op een les klikt. */
export function getSubjectDetail(subjectKey, lang) {
  const grade = getGrades(lang).find((g) => g.subjectKey === subjectKey)
  const group = GROUPS.find((g) => g.subject === subjectKey)

  return {
    assignments: getAssignments(lang).filter((a) => a.subjectKey === subjectKey),
    grade: grade ? { marks: grade.marks, entries: grade.entries, last: grade.last, average: grade.average } : null,
    group: group ? { id: group.id, name: pick(group.name, lang), members: group.members } : null,
  }
}

/* De datum van "vandaag" in de demo. */
export const TODAY_DATE = '07/09'

/* 'DD/MM' naar een getal, zodat opdrachten op datum kunnen staan. */
const dateKey = (value) => {
  if (!value) return Number.MAX_SAFE_INTEGER
  const [day, month] = value.split('/').map(Number)
  return month * 100 + day
}

export function getAssignments(lang) {
  return [...ASSIGNMENTS].sort((a, b) => dateKey(a.dueDate) - dateKey(b.dueDate)).map((a) => ({
    ...a,
    title: pick(a.title, lang),
    subjectKey: a.subject,
    subject: pick(SUBJECTS[a.subject], lang),
    due: pick(a.due, lang),
    sourceName: pick(SOURCES[a.source].name, lang),
    sourceColor: SOURCES[a.source].color,
  }))
}

/* De data van de huidige week, voor het bepalen van "deze week". */
const currentWeekDates = () => (WEEKS[CURRENT_WEEK]?.days ?? []).map((d) => d.date)

/**
 * In welke bak een opdracht hoort: verlopen, vandaag, deze week of later.
 * De schermen groeperen hierop, zodat de logica op een plek staat.
 */
export function assignmentTerm(dueDate) {
  if (!dueDate) return 'later'
  if (dueDate === TODAY_DATE) return 'today'
  if (dateKey(dueDate) < dateKey(TODAY_DATE)) return 'overdue'
  if (currentWeekDates().includes(dueDate)) return 'week'
  return 'later'
}

/**
 * Lessen en deadlines van vandaag door elkaar, op volgorde van tijd.
 * Dit is de kern van Bundel: niet gesorteerd op bron, maar op wanneer.
 */
export function getTimeline(lang, ownItems = []) {
  const day = getWeek(lang, CURRENT_WEEK)[TODAY_INDEX]

  const lessons = day.lessons.map((l) => ({
    ...l,
    kind: 'lesson',
    key: `l-${l.time}-${l.subjectKey}`,
    at: l.start,
    now: DEMO_NOW_MINUTES >= l.start && DEMO_NOW_MINUTES < l.finish,
    past: DEMO_NOW_MINUTES >= l.finish,
    remaining: Math.max(0, l.finish - DEMO_NOW_MINUTES),
  }))

  const deadlines = getAssignments(lang)
    .filter((a) => a.dueDate === TODAY_DATE)
    .map((a) => ({
      ...a,
      kind: 'deadline',
      key: `d-${a.id}`,
      at: toMinutes(a.dueTime ?? '17:00'),
      past: DEMO_NOW_MINUTES >= toMinutes(a.dueTime ?? '17:00'),
    }))

  const own = ownItems
    .filter((item) => (item.weekly || item.weekIndex === CURRENT_WEEK) && item.dayIndex === TODAY_INDEX)
    .map((item) => ({
      ...item,
      /* kind wordt 'own' voor de tijdlijn, dus het soort gaat apart mee. */
      ownKind: item.kind,
      kind: 'own',
      key: `o-${item.id}`,
      at: toMinutes(item.time),
      start: toMinutes(item.time),
      finish: item.end ? toMinutes(item.end) : toMinutes(item.time) + 30,
      past: DEMO_NOW_MINUTES >= (item.end ? toMinutes(item.end) : toMinutes(item.time) + 30),
      now: item.end
        ? DEMO_NOW_MINUTES >= toMinutes(item.time) && DEMO_NOW_MINUTES < toMinutes(item.end)
        : false,
    }))

  return [...lessons, ...deadlines, ...own].sort((a, b) => a.at - b.at)
}

/* Gewogen gemiddelde, zoals Magister het rekent. */
const weighted = (entries) => {
  const total = entries.reduce((n, e) => n + e.weight, 0)
  if (total === 0) return 0
  return Math.round((entries.reduce((n, e) => n + e.value * e.weight, 0) / total) * 10) / 10
}

/** Eén cijfer, klaar om te tonen. */
const gradeEntry = (entry, subjectKey, lang) => ({
  ...entry,
  what: pick(entry.what, lang),
  remark: entry.remark ? pick(entry.remark, lang) : null,
  subjectKey,
  subject: pick(SUBJECTS[subjectKey], lang),
  teacher: TEACHERS[subjectKey],
})

export function getGrades(lang) {
  return GRADES.map((g) => {
    const entries = g.entries.map((e) => gradeEntry(e, g.subject, lang))
    const values = entries.map((e) => e.value)
    /* Trend: het laatste cijfer tegenover het cijfer daarvoor. */
    const trend = values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0

    return {
      subjectKey: g.subject,
      subject: pick(SUBJECTS[g.subject], lang),
      teacher: TEACHERS[g.subject],
      entries,
      marks: values,
      average: weighted(g.entries),
      count: entries.length,
      last: entries[entries.length - 1].date,
      trend: Math.round(trend * 10) / 10,
    }
  })
}

/** Alle cijfers op volgorde van datum, nieuwste eerst. */
export function getRecentGrades(lang) {
  return GRADES.flatMap((g) => g.entries.map((e) => gradeEntry(e, g.subject, lang))).sort(
    (a, b) => dateKey(b.date) - dateKey(a.date),
  )
}

export function getAverage() {
  return weighted(GRADES.flatMap((g) => g.entries))
}

/** Verdeling van alle cijfers en de vakken die onder de 5.5 staan. */
export function getGradeStats(lang) {
  const all = GRADES.flatMap((g) => g.entries.map((e) => e.value))
  const buckets = [4, 5, 6, 7, 8, 9].map((n) => ({
    n,
    count: all.filter((m) => Math.floor(m) === n).length,
  }))
  const grades = getGrades(lang)
  const failing = grades.filter((g) => g.average < 5.5)
  const lowMarks = grades.filter((g) => g.marks.some((m) => m < 5.5))
  const withRemark = getRecentGrades(lang).filter((e) => e.remark).length

  return { total: all.length, buckets, max: Math.max(...buckets.map((b) => b.count)), failing, lowMarks, withRemark }
}

export function getGroups(lang) {
  return GROUPS.map((g) => ({
    ...g,
    subjectKey: g.subject,
    name: pick(g.name, lang),
    subject: pick(SUBJECTS[g.subject], lang),
    messages: g.messages.map((m) => ({ ...m, text: pick(m.text, lang), day: pick(m.day, lang) })),
    tasks: g.tasks.map((task) => ({ ...task, text: pick(task.text, lang) })),
    files: g.files.map((f) => ({ ...f, when: pick(f.when, lang) })),
    /* De eerstvolgende openstaande opdracht voor het vak van deze groep. */
    deadline: getAssignments(lang).find((a) => a.subjectKey === g.subject) ?? null,
  }))
}

export function getSources(lang) {
  return SOURCE_KEYS.map((key) => ({
    key,
    name: pick(SOURCES[key].name, lang),
    color: SOURCES[key].color,
    about: pick(SOURCES[key].about, lang),
    sync: pick(SOURCES[key].sync, lang),
    lastSync: LAST_SYNC[key] ?? SOURCES[key].lastSync,
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

  WEEKS.forEach((_, weekIndex) => {
    getWeek(lang, weekIndex).forEach((d) => {
      d.lessons.forEach((l) => {
        if (hit(l.subject) || hit(l.room)) {
          results.push({
            id: `l-${d.date}-${l.time}-${l.subject}`,
            type: 'lesson',
            title: l.subject,
            meta: `${d.day} ${d.date} · ${l.time} · ${l.room}`,
            color: SOURCES.magister.color,
            sourceName: pick(SOURCES.magister.name, lang),
            /* Neem de week mee, anders open je het rooster op de verkeerde week. */
            to: `/app/rooster?week=${weekIndex}`,
          })
        }
      })
    })
  })

  getRecentGrades(lang).forEach((e) => {
    if (hit(e.subject) || hit(e.what) || (e.remark && hit(e.remark))) {
      results.push({
        id: `g-${e.id}`,
        type: 'grade',
        title: `${e.subject} · ${e.what}`,
        meta: `${e.value.toFixed(1)} · ${e.date}${e.remark ? ` · ${lang === 'en' ? 'with remark' : 'met opmerking'}` : ''}`,
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

const PERMISSIONS = {
  canvas: [
    t('Cursussen waar jij in zit', 'Courses you are enrolled in'),
    t('Opdrachten en inleverdata', 'Assignments and hand-in dates'),
    t('Schrijft niets terug', 'Writes nothing back'),
  ],
  teams: [
    t('Kanalen waar jij lid van bent', 'Channels you are a member of'),
    t('Berichten in die kanalen', 'Messages in those channels'),
    t('Geen chats van anderen', 'No chats belonging to others'),
  ],
  magister: [
    t('Je rooster', 'Your timetable'),
    t('Je cijfers', 'Your grades'),
    t('Niets van klasgenoten', 'Nothing about classmates'),
  ],
  own: [
    t('Je eigen taken en groepen', 'Your own tasks and groups'),
    t('Berichten zijn end-to-end versleuteld', 'Messages are end-to-end encrypted'),
    t('Blijft bij Bundel, gaat nergens heen', 'Stays with Bundel, goes nowhere else'),
  ],
}

const SYNC_HISTORY = {
  canvas: [
    { time: '12:04', ok: true },
    { time: '11:49', ok: true },
    { time: '11:34', ok: false },
  ],
  teams: [
    { time: '12:11', ok: true },
    { time: '11:38', ok: true },
    { time: '10:52', ok: true },
  ],
  magister: [
    { time: '09:40', ok: true },
    { time: 'gisteren', ok: true },
  ],
  own: [
    { time: '12:12', ok: true },
    { time: '12:09', ok: true },
    { time: '12:01', ok: true },
  ],
}

/**
 * Wat elke bron bijdraagt, welke rechten Bundel vraagt en de laatste syncs.
 * De aantallen worden uit de bestaande data geteld, niet apart bijgehouden.
 */
export function getSourceStats(lang) {
  const lessons = WEEKS.flatMap((w) => w.days.flatMap((d) => d.lessons))
  const marks = GRADES.reduce((n, g) => n + g.entries.length, 0)
  const messages = GROUPS.reduce((n, g) => n + g.messages.length, 0)
  const bySource = (key) => ASSIGNMENTS.filter((a) => a.source === key)

  const counts = {
    canvas: [
      { label: pick(t('opdrachten', 'assignments'), lang), value: bySource('canvas').length },
      { label: pick(t('vakken', 'subjects'), lang), value: new Set(bySource('canvas').map((a) => a.subject)).size },
    ],
    teams: [
      { label: pick(t('opdrachten', 'assignments'), lang), value: bySource('teams').length },
      { label: pick(t('kanalen', 'channels'), lang), value: GROUPS.length },
    ],
    magister: [
      { label: pick(t('lessen', 'classes'), lang), value: lessons.length },
      { label: pick(t('cijfers', 'grades'), lang), value: marks },
      { label: pick(t('presenties', 'attendance records'), lang), value: getAttendance(lang).length },
    ],
    own: [
      { label: pick(t('taken', 'tasks'), lang), value: bySource('own').length },
      { label: pick(t('berichten', 'messages'), lang), value: messages },
    ],
  }

  return SOURCE_KEYS.reduce((acc, key) => {
    acc[key] = {
      counts: counts[key],
      permissions: PERMISSIONS[key].map((line) => pick(line, lang)),
      history: SYNC_HISTORY[key],
    }
    return acc
  }, {})
}

/* Onder dit percentage zegt de app er iets van. */
export const ATTENDANCE_LIMIT = 80

/* Een cijfer dat zoveel lager is dan het vorige telt als dalende trend. */
const TREND_LIMIT = -0.5

/** Is deze les al geweest? Alleen dan is er aanwezigheid. */
function isPast(date, finish) {
  if (dateKey(date) < dateKey(TODAY_DATE)) return true
  if (date === TODAY_DATE) return DEMO_NOW_MINUTES >= finish
  return false
}

/** Alle lessen die geweest zijn, met hun status, nieuwste eerst. */
export function getAttendance(lang) {
  const rows = []

  WEEKS.forEach((_, weekIndex) => {
    getWeek(lang, weekIndex).forEach((d) => {
      d.lessons.forEach((l) => {
        if (!isPast(d.date, l.finish)) return
        const record = ATTENDANCE[`${d.date} ${l.time}`]
        rows.push({
          key: `${d.date}-${l.time}-${l.subjectKey}`,
          date: d.date,
          day: d.day,
          time: l.time,
          end: l.end,
          room: l.room,
          teacher: l.teacher,
          subject: l.subject,
          subjectKey: l.subjectKey,
          status: record?.status ?? 'present',
          minutes: record?.minutes ?? null,
          reason: record?.reason ? pick(record.reason, lang) : null,
        })
      })
    })
  })

  return rows.sort((a, b) => dateKey(b.date) - dateKey(a.date) || toMinutes(b.time) - toMinutes(a.time))
}

/** Telt een status als aanwezig? Te laat wel, gemeld afwezig telt niet mee. */
const countsAsPresent = (status) => status === 'present' || status === 'late'

function summarise(rows) {
  const excused = rows.filter((r) => r.status === 'excused').length
  const counted = rows.length - excused
  const attended = rows.filter((r) => countsAsPresent(r.status)).length
  return {
    total: rows.length,
    counted,
    attended,
    late: rows.filter((r) => r.status === 'late').length,
    absent: rows.filter((r) => r.status === 'absent').length,
    excused,
    /* Gemelde absentie telt niet tegen je, dus die valt uit de noemer. */
    rate: counted === 0 ? 100 : Math.round((attended / counted) * 100),
  }
}

/** Percentage over alles en per vak, met een markering waar het te laag is. */
export function getAttendanceSummary(lang) {
  const rows = getAttendance(lang)
  const keys = [...new Set(rows.map((r) => r.subjectKey))]

  const bySubject = keys
    .map((key) => {
      const own = rows.filter((r) => r.subjectKey === key)
      return {
        subjectKey: key,
        subject: own[0].subject,
        teacher: own[0].teacher,
        ...summarise(own),
        low: summarise(own).rate < ATTENDANCE_LIMIT,
      }
    })
    .sort((a, b) => a.rate - b.rate)

  return { ...summarise(rows), bySubject }
}

/** Aanwezigheid voor één vak, voor de lespop-up. */
export function getSubjectAttendance(subjectKey, lang) {
  return getAttendanceSummary(lang).bySubject.find((s) => s.subjectKey === subjectKey) ?? null
}

/**
 * Gaat dit vak slecht? Geeft de redenen terug die daar aanleiding toe geven,
 * zodat het scherm ze kan tonen in plaats van een oordeel te verzinnen.
 * `doneMap` komt uit de schermtoestand, want afgevinkte opdrachten tellen niet.
 */
export function getSubjectSignal(subjectKey, lang, doneMap = {}) {
  const reasons = []
  const grade = getGrades(lang).find((g) => g.subjectKey === subjectKey)
  const attendance = getSubjectAttendance(subjectKey, lang)
  const overdue = getAssignments(lang).filter(
    (a) => a.subjectKey === subjectKey && !doneMap[a.id] && assignmentTerm(a.dueDate) === 'overdue',
  )

  if (grade && grade.average < 5.5) {
    reasons.push({ kind: 'average', value: grade.average.toFixed(1) })
  }
  if (grade && grade.trend <= TREND_LIMIT) {
    reasons.push({ kind: 'trend', value: Math.abs(grade.trend).toFixed(1) })
  }
  if (attendance && attendance.low) {
    reasons.push({ kind: 'attendance', value: attendance.rate, attended: attendance.attended, counted: attendance.counted })
  }
  if (overdue.length > 0) {
    reasons.push({ kind: 'overdue', value: overdue.length })
  }

  return { level: reasons.length >= 2 ? 'high' : reasons.length === 1 ? 'low' : 'none', reasons }
}

/**
 * De eigen items die in deze week horen. Een item met `weekly` verschijnt
 * in elke week op dezelfde dag en tijd.
 */
export function ownItemsFor(items, weekIndex) {
  return (items ?? [])
    .filter((item) => item.weekly || item.weekIndex === weekIndex)
    .map((item) => ({
      ...item,
      own: true,
      start: toMinutes(item.time),
      finish: item.end ? toMinutes(item.end) : toMinutes(item.time) + 30,
    }))
}

/** Alle vakken waar iets mee is, voor de regel op Vandaag. */
export function getSignals(lang, doneMap = {}) {
  return Object.keys(SUBJECTS)
    .map((key) => ({ subjectKey: key, subject: pick(SUBJECTS[key], lang), ...getSubjectSignal(key, lang, doneMap) }))
    .filter((s) => s.reasons.length > 0)
    .sort((a, b) => b.reasons.length - a.reasons.length)
}

/** Kleur van een bron, voor stippen en randjes. Nooit als vlak gebruiken. */
export function sourceColor(key) {
  return SOURCES[key]?.color ?? 'var(--ink-600)'
}

export function sourceName(key, lang) {
  return pick(SOURCES[key]?.name, lang) ?? key
}
