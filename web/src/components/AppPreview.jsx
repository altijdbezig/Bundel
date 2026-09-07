import { useI18n } from '../i18n'

/**
 * Verkleinde weergave van het "Vandaag"-scherm uit het prototype.
 * Zelfde data, zelfde tokens - bedoeld als eerlijk beeld van de app,
 * niet als screenshot. Decoratief: buiten de leesvolgorde gehouden.
 */

const copy = {
  nl: {
    student: 'Luca Verhoeven',
    course: 'Mediavormgeving · lj 3',
    nav: ['Vandaag', 'Opdrachten', 'Rooster', 'Cijfers', 'Groepen', 'Bronnen'],
    sourcesLabel: 'Bronnen',
    dateLabel: 'Ma 7 sep',
    dateTitle: 'Maandag 7 september',
    summary: '4 lessen · 2 deadlines',
    scheduleLabel: 'Rooster vandaag',
    tasksLabel: 'Deze week af',
    all: 'alles',
    lessons: [
      { time: '08:30', name: 'Mediatheorie', room: 'B1.04', now: false },
      { time: '09:30', name: 'Interaction Design', room: 'A2.11', now: true },
      { time: '11:15', name: 'Concepting', room: 'A2.11', now: false },
      { time: '13:30', name: 'Projecturen', room: 'Studio 3', now: false },
    ],
    tasks: [
      { title: 'Moodboard inleveren', source: 'canvas', due: 'vandaag 17:00', urgent: true },
      { title: 'Assets exporteren', source: 'own', due: 'di 8 sep', urgent: false },
      { title: 'Onderzoeksverslag', source: 'canvas', due: 'wo 10 sep', urgent: false },
    ],
    syncNote: 'Laatste sync 12:04',
  },
  en: {
    student: 'Luca Verhoeven',
    course: 'Media Design · yr 3',
    nav: ['Today', 'Assignments', 'Timetable', 'Grades', 'Groups', 'Sources'],
    sourcesLabel: 'Sources',
    dateLabel: 'Mon 7 Sep',
    dateTitle: 'Monday 7 September',
    summary: '4 classes · 2 deadlines',
    scheduleLabel: "Today's timetable",
    tasksLabel: 'Due this week',
    all: 'all',
    lessons: [
      { time: '08:30', name: 'Media Theory', room: 'B1.04', now: false },
      { time: '09:30', name: 'Interaction Design', room: 'A2.11', now: true },
      { time: '11:15', name: 'Concepting', room: 'A2.11', now: false },
      { time: '13:30', name: 'Project hours', room: 'Studio 3', now: false },
    ],
    tasks: [
      { title: 'Hand in moodboard', source: 'canvas', due: 'today 17:00', urgent: true },
      { title: 'Export assets', source: 'own', due: 'Tue 8 Sep', urgent: false },
      { title: 'Audience research', source: 'canvas', due: 'Wed 10 Sep', urgent: false },
    ],
    syncNote: 'Last sync 12:04',
  },
}

const sources = [
  { key: 'canvas', name: 'Canvas', color: 'var(--source-canvas)', state: 'ok' },
  { key: 'teams', name: 'Teams', color: 'var(--source-teams)', state: 'ok' },
  { key: 'magister', name: 'Magister', color: 'var(--source-magister)', state: 'ok' },
  { key: 'own', name: 'Eigen', color: 'var(--source-own)', state: 'ok' },
]

export default function AppPreview() {
  const { lang } = useI18n()
  const c = copy[lang] ?? copy.nl

  return (
    <div className="preview" aria-hidden="true">
      <div className="preview__chrome">
        <span className="preview__dot" />
        <span className="preview__dot" />
        <span className="preview__dot" />
        <span className="preview__url data">bundel.app</span>
      </div>

      <div className="preview__body">
        <aside className="preview__side">
          <div className="preview__user">
            <span className="preview__avatar">LV</span>
            <span className="preview__userText">
              <span className="preview__userName">{c.student}</span>
              <span className="preview__userMeta">{c.course}</span>
            </span>
          </div>

          <nav className="preview__nav">
            {c.nav.map((item, i) => (
              <span key={item} className={`preview__navItem ${i === 0 ? 'is-active' : ''}`}>
                {item}
                {i === 1 && <span className="preview__badge data">5</span>}
                {i === 4 && <span className="preview__badge data">2</span>}
              </span>
            ))}
          </nav>

          <div className="preview__sources">
            <span className="label">{c.sourcesLabel}</span>
            {sources.map((s) => (
              <span key={s.key} className="preview__source">
                <span className="dot dot--sm" style={{ background: s.color }} />
                <span className="preview__sourceName">{s.name}</span>
                <span className="preview__sourceState data">ok</span>
              </span>
            ))}
          </div>
        </aside>

        <main className="preview__main">
          <div className="preview__head">
            <span className="preview__date">{c.dateTitle}</span>
            <span className="preview__summary">{c.summary}</span>
          </div>

          <div className="preview__cols">
            <div className="preview__card">
              <span className="label">{c.scheduleLabel}</span>
              <div className="preview__rows">
                {c.lessons.map((l) => (
                  <span key={l.time} className={`preview__lesson ${l.now ? 'is-now' : ''}`}>
                    <span className="preview__time data">{l.time}</span>
                    <span className="preview__lessonName">{l.name}</span>
                    <span className="preview__room">{l.room}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="preview__card">
              <div className="preview__cardHead">
                <span className="label">{c.tasksLabel}</span>
                <span className="preview__all">{c.all}</span>
              </div>
              <div className="preview__rows">
                {c.tasks.map((t) => (
                  <span key={t.title} className="preview__task">
                    <span className="preview__check" />
                    <span
                      className="dot dot--sm"
                      style={{ background: t.source === 'own' ? 'var(--source-own)' : 'var(--source-canvas)' }}
                    />
                    <span className="preview__taskTitle">{t.title}</span>
                    <span className={`preview__due ${t.urgent ? 'is-urgent' : ''}`}>{t.due}</span>
                  </span>
                ))}
              </div>
              <span className="preview__sync data">{c.syncNote}</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
