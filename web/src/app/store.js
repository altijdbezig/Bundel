import { supabase } from '../supabase'
import { setDataset, clearDataset, getSources, SOURCE_KEYS } from './data'
import {
  STUDENT,
  SUBJECTS,
  TEACHERS,
  WEEKS,
  ASSIGNMENTS,
  GRADES,
  GROUPS,
  NOTIFICATIONS,
  ATTENDANCE,
} from './demo'

/**
 * Alles wat met de database praat staat hier.
 *
 * De schermen weten hier niets van. Zij lezen uit `data.js`, en `data.js`
 * krijgt zijn inhoud van `load()` hieronder. Schrijven gaat via `state.jsx`,
 * dat de functies onderaan dit bestand aanroept.
 */

/* 'DD/MM' naar een getal, zodat rijen op datum kunnen staan. */
const dateKey = (value) => {
  if (!value) return Number.MAX_SAFE_INTEGER
  const [day, month] = String(value).split('/').map(Number)
  return month * 100 + day
}

const pair = (nl, en) => ({ nl, en: en ?? nl })
const byPosition = (a, b) => a.position - b.position

// ---------------------------------------------------------------- lezen

const TABLES = [
  'subjects',
  'user_sources',
  'weeks',
  'lessons',
  'assignments',
  'grades',
  'groups',
  'group_members',
  'group_tasks',
  'group_files',
  'group_messages',
  'attendance',
  'notifications',
  'own_items',
]

async function fetchAll(userId) {
  const results = await Promise.all(
    TABLES.map((table) => supabase.from(table).select('*').eq('user_id', userId)),
  )

  const rows = {}
  results.forEach((result, index) => {
    if (result.error) throw result.error
    rows[TABLES[index]] = result.data ?? []
  })
  return rows
}

/** Bouwt van de losse tabellen de vorm die de schermen verwachten. */
function shape(profile, rows) {
  const subjects = {}
  const teachers = {}
  rows.subjects.forEach((s) => {
    subjects[s.key] = pair(s.name_nl, s.name_en)
    teachers[s.key] = s.teacher
  })

  const weeks = [...rows.weeks]
    .sort((a, b) => a.idx - b.idx)
    .map((w) => ({
      number: w.number,
      range: pair(w.range_nl, w.range_en),
      note: w.note_nl ? pair(w.note_nl, w.note_en) : null,
      days: (w.day_dates ?? []).map((date, dayIdx) => ({
        date,
        lessons: rows.lessons
          .filter((l) => l.week_idx === w.idx && l.day_idx === dayIdx)
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
          .map((l) => ({ time: l.start_time, end: l.end_time, subject: l.subject_key, room: l.room })),
      })),
    }))

  const assignments = rows.assignments.map((a) => ({
    id: a.key,
    title: pair(a.title_nl, a.title_en),
    subject: a.subject_key,
    source: a.source,
    due: pair(a.due_nl, a.due_en),
    dueDate: a.due_date,
    dueTime: a.due_time,
    urgent: a.urgent,
  }))

  const subjectKeys = [...new Set(rows.grades.map((g) => g.subject_key))]
  const grades = subjectKeys.map((key) => ({
    subject: key,
    entries: rows.grades
      .filter((g) => g.subject_key === key)
      .sort((a, b) => dateKey(a.on_date) - dateKey(b.on_date))
      .map((g) => ({
        id: g.key,
        value: Number(g.value),
        date: g.on_date,
        weight: g.weight,
        what: pair(g.what_nl, g.what_en),
        remark: g.remark_nl ? pair(g.remark_nl, g.remark_en) : null,
      })),
  }))

  const groups = rows.groups.map((g) => ({
    id: g.key,
    name: pair(g.name_nl, g.name_en),
    subject: g.subject_key,
    members: rows.group_members
      .filter((m) => m.group_key === g.key)
      .sort(byPosition)
      .map((m) => ({ name: m.name, initials: m.initials, self: m.is_self })),
    tasks: rows.group_tasks
      .filter((task) => task.group_key === g.key)
      .sort(byPosition)
      .map((task) => ({ id: task.key, who: task.who, done: task.done, text: pair(task.body_nl, task.body_en) })),
    files: rows.group_files
      .filter((f) => f.group_key === g.key)
      .sort(byPosition)
      .map((f) => ({ name: f.name, by: f.uploaded_by, size: f.size_label, when: pair(f.added_nl, f.added_en) })),
    messages: rows.group_messages
      .filter((m) => m.group_key === g.key)
      .sort(byPosition)
      .map((m) => ({
        id: m.id,
        from: m.sender,
        initials: m.initials,
        time: m.at_time,
        day: m.day_nl ? pair(m.day_nl, m.day_en) : null,
        self: m.is_self,
        text: pair(m.body_nl, m.body_en),
      })),
  }))

  const notifications = [...rows.notifications].sort(byPosition).map((n) => ({
    id: n.key,
    kind: n.kind,
    source: n.source,
    time: n.at_time,
    title: pair(n.title_nl, n.title_en),
    body: pair(n.body_nl, n.body_en),
    to: n.target,
  }))

  const attendance = {}
  rows.attendance.forEach((a) => {
    attendance[`${a.on_date} ${a.at_time}`] = {
      status: a.status,
      minutes: a.minutes ?? undefined,
      reason: a.reason_nl ? pair(a.reason_nl, a.reason_en) : undefined,
    }
  })

  const lastSync = {}
  rows.user_sources.forEach((s) => {
    if (s.last_sync) lastSync[s.key] = s.last_sync
  })

  return {
    student: {
      name: profile.name,
      initials: profile.initials,
      course: pair(profile.course_nl, profile.course_en),
    },
    subjects,
    teachers,
    weeks,
    assignments,
    grades,
    groups,
    notifications,
    attendance,
    lastSync,
  }
}

/** De toestand die de gebruiker zelf verandert, los van de dataset. */
function toState(rows) {
  const done = {}
  rows.assignments.forEach((a) => {
    if (a.done) done[a.key] = true
  })

  const groupTasks = {}
  rows.group_tasks.forEach((task) => {
    groupTasks[task.key] = task.done
  })

  const sources = {}
  SOURCE_KEYS.forEach((key) => {
    const row = rows.user_sources.find((s) => s.key === key)
    sources[key] = { connected: row?.connected ?? true, reachable: row?.reachable ?? true }
  })

  const syncedAt = {}
  rows.user_sources.forEach((s) => {
    if (s.synced_at) syncedAt[s.key] = s.last_sync
  })

  return {
    done,
    groupTasks,
    sources,
    syncedAt,
    readIds: rows.notifications.filter((n) => n.is_read).map((n) => n.key),
    ownItems: rows.own_items
      .map((item) => ({
        id: item.id,
        kind: item.kind,
        title: item.title,
        weekIndex: item.week_idx,
        dayIndex: item.day_idx,
        time: item.start_time,
        end: item.end_time,
        weekly: item.weekly,
      }))
      .sort((a, b) => a.time.localeCompare(b.time)),
  }
}

function initialsOf(name) {
  const parts = String(name).trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/**
 * Haalt het profiel op. De trigger in de database maakt het aan bij het
 * aanmelden. Bestaat het toch niet, dan maken we het hier alsnog.
 */
async function ensureProfile(user) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error) throw error
  if (data) return data

  const fallback = user.user_metadata?.name || user.email?.split('@')[0] || STUDENT.name
  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: user.id, name: fallback, initials: initialsOf(fallback) })
    .select()
    .single()
  if (insertError) throw insertError
  return created
}

/** Laadt alles van een gebruiker en zet de dataset klaar voor de schermen. */
export async function load(user) {
  let profile = await ensureProfile(user)
  if (!profile.seeded_at) profile = await seed(user, profile)

  const rows = await fetchAll(user.id)
  setDataset(shape(profile, rows))

  return {
    ...toState(rows),
    notificationsOn: profile.notifications_on,
    startScreen: profile.start_screen,
    notifyKinds: {
      deadline: profile.notify_deadline,
      grade: profile.notify_grade,
      message: profile.notify_message,
      schedule: profile.notify_schedule,
    },
  }
}

export function unload() {
  clearDataset()
}

// ---------------------------------------------------------------- vullen

/**
 * Zet de demodata klaar voor een nieuw account. Elke gebruiker krijgt zijn
 * eigen rijen, dus wat hij afvinkt of toevoegt raakt niemand anders.
 * Zodra de koppelingen echt zijn vullen die dezelfde tabellen en kan dit weg.
 */
async function seed(user, profile) {
  const id = user.id
  const name = profile.name || STUDENT.name
  const initials = profile.initials || initialsOf(name)

  /* `is_demo` staat op elke gevulde rij, zodat de demo er later in een query
     uit kan zodra een echte koppeling dezelfde tabellen vult. */
  const rows = (table, data) => ({ table, data: data.map((row) => ({ ...row, user_id: id, is_demo: true })) })

  const batches = [
    rows(
      'subjects',
      Object.entries(SUBJECTS).map(([key, label]) => ({
        key,
        name_nl: label.nl,
        name_en: label.en,
        teacher: TEACHERS[key],
      })),
    ),
    rows(
      'user_sources',
      getSources('nl').map((s) => ({ key: s.key, connected: true, reachable: true, last_sync: s.lastSync })),
    ),
    rows(
      'weeks',
      WEEKS.map((w, idx) => ({
        idx,
        number: w.number,
        range_nl: w.range.nl,
        range_en: w.range.en,
        note_nl: w.note?.nl ?? null,
        note_en: w.note?.en ?? null,
        day_dates: w.days.map((d) => d.date),
      })),
    ),
    rows(
      'lessons',
      WEEKS.flatMap((w, weekIdx) =>
        w.days.flatMap((d, dayIdx) =>
          d.lessons.map((l) => ({
            week_idx: weekIdx,
            day_idx: dayIdx,
            on_date: d.date,
            start_time: l.time,
            end_time: l.end,
            subject_key: l.subject,
            room: l.room,
          })),
        ),
      ),
    ),
    rows(
      'assignments',
      ASSIGNMENTS.map((a) => ({
        key: a.id,
        title_nl: a.title.nl,
        title_en: a.title.en,
        subject_key: a.subject,
        source: a.source,
        due_nl: a.due.nl,
        due_en: a.due.en,
        due_date: a.dueDate,
        due_time: a.dueTime,
        urgent: a.urgent,
      })),
    ),
    rows(
      'grades',
      GRADES.flatMap((g) =>
        g.entries.map((e) => ({
          key: e.id,
          subject_key: g.subject,
          value: e.value,
          on_date: e.date,
          weight: e.weight,
          what_nl: e.what.nl,
          what_en: e.what.en,
          remark_nl: e.remark?.nl ?? null,
          remark_en: e.remark?.en ?? null,
        })),
      ),
    ),
    rows(
      'groups',
      GROUPS.map((g) => ({ key: g.id, name_nl: g.name.nl, name_en: g.name.en, subject_key: g.subject })),
    ),
    rows(
      'group_members',
      GROUPS.flatMap((g) =>
        g.members.map((m, index) => ({
          group_key: g.id,
          /* Je bent zelf lid van je eigen groepen, dus daar staat jouw naam. */
          name: m.self ? name : m.name,
          initials: m.self ? initials : m.initials,
          is_self: m.self,
          position: index,
        })),
      ),
    ),
    rows(
      'group_tasks',
      GROUPS.flatMap((g) =>
        g.tasks.map((task, index) => ({
          group_key: g.id,
          key: task.id,
          who: task.who,
          done: task.done,
          body_nl: task.text.nl,
          body_en: task.text.en,
          position: index,
        })),
      ),
    ),
    rows(
      'group_files',
      GROUPS.flatMap((g) =>
        g.files.map((f, index) => ({
          group_key: g.id,
          name: f.name,
          uploaded_by: f.by,
          size_label: f.size,
          added_nl: f.when.nl,
          added_en: f.when.en,
          position: index,
        })),
      ),
    ),
    rows(
      'group_messages',
      GROUPS.flatMap((g) =>
        g.messages.map((m, index) => ({
          group_key: g.id,
          sender: m.self ? name.split(' ')[0] : m.from,
          initials: m.self ? initials : m.initials,
          at_time: m.time,
          day_nl: m.day?.nl ?? null,
          day_en: m.day?.en ?? null,
          is_self: m.self,
          body_nl: m.text.nl,
          body_en: m.text.en,
          position: index,
        })),
      ),
    ),
    rows(
      'attendance',
      Object.entries(ATTENDANCE).map(([slot, record]) => {
        const [onDate, atTime] = slot.split(' ')
        return {
          on_date: onDate,
          at_time: atTime,
          status: record.status,
          minutes: record.minutes ?? null,
          reason_nl: record.reason?.nl ?? null,
          reason_en: record.reason?.en ?? null,
        }
      }),
    ),
    rows(
      'notifications',
      NOTIFICATIONS.map((n, index) => ({
        key: n.id,
        kind: n.kind,
        source: n.source,
        at_time: n.time,
        title_nl: n.title.nl,
        title_en: n.title.en,
        body_nl: n.body?.nl ?? null,
        body_en: n.body?.en ?? null,
        target: n.to,
        position: index,
      })),
    ),
  ]

  for (const batch of batches) {
    const { error } = await supabase.from(batch.table).insert(batch.data)
    if (error) throw error
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      name,
      initials,
      course_nl: STUDENT.course.nl,
      course_en: STUDENT.course.en,
      seeded_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Wist alles van deze gebruiker en zet de demodata opnieuw klaar. */
export async function reset(user) {
  for (const table of TABLES) {
    const { error } = await supabase.from(table).delete().eq('user_id', user.id)
    if (error) throw error
  }
  const { error } = await supabase.from('profiles').update({ seeded_at: null }).eq('id', user.id)
  if (error) throw error
  return load(user)
}

// ---------------------------------------------------------------- schrijven

/**
 * Schrijven gaat naast de schermtoestand, niet ervoor. Het scherm reageert
 * meteen en de rij volgt. Gaat er iets mis, dan komt dat bij de volgende keer
 * laden vanzelf goed, want de database blijft de bron.
 */
const fail = (label) => (result) => {
  if (result?.error) console.error(`Bundel: ${label} mislukt`, result.error.message)
  return result
}

export function setAssignmentDone(userId, key, done) {
  return supabase
    .from('assignments')
    .update({ done })
    .eq('user_id', userId)
    .eq('key', key)
    .then(fail('opdracht bijwerken'))
}

export function setGroupTaskDone(userId, key, done) {
  return supabase
    .from('group_tasks')
    .update({ done })
    .eq('user_id', userId)
    .eq('key', key)
    .then(fail('groepstaak bijwerken'))
}

export function setNotificationsRead(userId, keys) {
  if (keys.length === 0) return Promise.resolve()
  return supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .in('key', keys)
    .then(fail('melding markeren'))
}

export function setSource(userId, key, patch) {
  return supabase.from('user_sources').update(patch).eq('user_id', userId).eq('key', key).then(fail('bron bijwerken'))
}

export function setProfile(userId, patch) {
  return supabase.from('profiles').update(patch).eq('id', userId).then(fail('voorkeur opslaan'))
}

export async function addOwnItem(userId, item) {
  const { data, error } = await supabase
    .from('own_items')
    .insert({
      user_id: userId,
      kind: item.kind,
      title: item.title,
      week_idx: item.weekIndex,
      day_idx: item.dayIndex,
      start_time: item.time,
      end_time: item.end ?? null,
      weekly: Boolean(item.weekly),
    })
    .select()
    .single()
  if (error) {
    console.error('Bundel: eigen item opslaan mislukt', error.message)
    return null
  }
  return data.id
}

export function updateOwnItem(userId, id, patch) {
  const columns = {}
  if ('kind' in patch) columns.kind = patch.kind
  if ('title' in patch) columns.title = patch.title
  if ('weekIndex' in patch) columns.week_idx = patch.weekIndex
  if ('dayIndex' in patch) columns.day_idx = patch.dayIndex
  if ('time' in patch) columns.start_time = patch.time
  if ('end' in patch) columns.end_time = patch.end ?? null
  if ('weekly' in patch) columns.weekly = Boolean(patch.weekly)

  return supabase.from('own_items').update(columns).eq('user_id', userId).eq('id', id).then(fail('eigen item bijwerken'))
}

export function removeOwnItem(userId, id) {
  return supabase.from('own_items').delete().eq('user_id', userId).eq('id', id).then(fail('eigen item verwijderen'))
}

export async function addMessage(userId, groupKey, message) {
  const { data, error } = await supabase
    .from('group_messages')
    .insert({
      user_id: userId,
      group_key: groupKey,
      sender: message.from,
      initials: message.initials,
      at_time: message.time,
      day_nl: message.dayNl ?? null,
      day_en: message.dayEn ?? null,
      is_self: true,
      body_nl: message.text,
      body_en: message.text,
      position: message.position,
    })
    .select()
    .single()
  if (error) {
    console.error('Bundel: bericht versturen mislukt', error.message)
    return null
  }
  return data.id
}

/** Aanmelden voor de wachtlijst. De enige tabel waar je niet voor hoeft in te loggen. */
export async function joinWaitlist(email, lang) {
  if (!supabase) throw new Error('Supabase is niet ingesteld')
  const { error } = await supabase.from('waitlist').insert({ email, lang })
  if (error) throw error
}
