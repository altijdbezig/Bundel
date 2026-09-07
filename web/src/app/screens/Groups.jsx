import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconLock, IconInbox } from '../../components/Icons'
import { fill, useI18n } from '../../i18n'
import { useAppState } from '../state'
import ScreenHeader from '../ScreenHeader'
import { getGroups } from '../data'

export default function Groups() {
  const { t, lang } = useI18n()
  const { sentMessages, sendMessage, groupTasks, toggleGroupTask } = useAppState()
  const c = t.app.groups

  const groups = getGroups(lang)
  const [activeId, setActiveId] = useState(groups[0].id)
  const [draft, setDraft] = useState('')

  const active = groups.find((g) => g.id === activeId) ?? groups[0]
  const messages = [...active.messages, ...(sentMessages[active.id] ?? [])]

  const isTaskDone = (task) => (task.id in groupTasks ? groupTasks[task.id] : task.done)
  const doneCount = active.tasks.filter(isTaskDone).length

  function handleSubmit(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    sendMessage(active.id, text)
    setDraft('')
  }

  return (
    <div className="screen">
      <ScreenHeader title={c.title} subtitle={c.subtitle} source="own" />

      <div className="pills">
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`pill ${g.id === active.id ? 'is-active' : ''}`}
            aria-pressed={g.id === active.id}
            onClick={() => setActiveId(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Kop van de projectruimte */}
      <section className="card grouphead">
        <div className="stack stack-2">
          <h2 className="heading">{active.name}</h2>
          <span className="meta">
            {active.subject} · {active.members.length} {c.members}
          </span>
        </div>
        <div className="avatars">
          {active.members.map((m) => (
            <span key={m.initials} className={`avatar ${m.self ? 'is-self' : ''}`} title={m.name}>
              {m.initials}
            </span>
          ))}
        </div>
      </section>

      {/* Gedeelde deadline uit het vak van deze groep */}
      <section className="card stack stack-3">
        <div className="screen__cardHead">
          <span className="label">{c.deadline}</span>
          <Link to="/app/opdrachten" className="meta">
            {t.app.today.all}
          </Link>
        </div>

        {!active.deadline && <p className="meta">{c.noDeadline}</p>}

        {active.deadline && (
          <div className="task">
            <span className="dot dot--sm" style={{ background: active.deadline.sourceColor }} />
            <span className="task__body">
              <span className="task__title">{active.deadline.title}</span>
              <span className="task__meta meta">{active.deadline.sourceName}</span>
            </span>
            <span className={`task__due meta ${active.deadline.urgent ? 'is-urgent' : ''}`}>
              {active.deadline.due}
              {active.deadline.dueTime ? ` · ${active.deadline.dueTime}` : ''}
            </span>
          </div>
        )}
      </section>

      <div className="group">
        {/* Wie doet wat */}
        <section className="card stack stack-3 group__tasks">
          <div className="screen__cardHead">
            <span className="label">{c.tasks}</span>
            <span className="meta data">{fill(c.taskDone, { done: doneCount, total: active.tasks.length })}</span>
          </div>

          <div className="stack">
            {active.tasks.map((task) => {
              const checked = isTaskDone(task)
              return (
                <div key={task.id} className={`grouptask ${checked ? 'is-done' : ''}`}>
                  <button
                    type="button"
                    className={`task__check ${checked ? 'is-checked' : ''}`}
                    aria-pressed={checked}
                    aria-label={task.text}
                    onClick={() => toggleGroupTask(task.id)}
                  />
                  <span className="avatar avatar--sm">{task.who}</span>
                  <span className="grouptask__text">{task.text}</span>
                </div>
              )
            })}
          </div>

          <hr className="hair" />

          <div className="screen__cardHead">
            <span className="label">{c.files}</span>
          </div>

          {active.files.length === 0 && <p className="meta">{c.noFiles}</p>}

          <div className="stack stack-2">
            {active.files.map((f) => (
              <div key={f.name} className="file">
                <span className="file__icon">
                  <IconInbox size={17} />
                </span>
                <span className="file__text">
                  <span className="file__name">{f.name}</span>
                  <span className="meta">
                    {c.by} {f.by} · {f.when}
                  </span>
                </span>
                <span className="meta data">{f.size}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Chat met datumscheiding */}
        <section className="card group__chat">
          <div className="screen__cardHead">
            <span className="label">{c.messages}</span>
            <span className="meta row group__lock">
              <IconLock size={15} />
              {c.encrypted}
            </span>
          </div>

          <div className="chat">
            {messages.map((m, i) => {
              const day = m.day ?? c.today
              const newDay = i === 0 || day !== (messages[i - 1].day ?? c.today)
              return (
                <div key={m.id} className="chat__group">
                  {newDay && (
                    <span className="chat__day">
                      <span className="label">{day}</span>
                    </span>
                  )}
                  <div className={`bubble ${m.self ? 'is-self' : ''}`}>
                    <span className="bubble__head">
                      <span className={`avatar avatar--sm ${m.self ? 'is-self' : ''}`}>{m.initials}</span>
                      <span className="bubble__from">{m.self ? c.you : m.from}</span>
                      <span className="bubble__time data">{m.time}</span>
                    </span>
                    <p className="bubble__text">{m.text}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <form className="chat__form" onSubmit={handleSubmit}>
            <input
              className="input"
              placeholder={c.placeholder}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={c.placeholder}
            />
            <button type="submit" className="btn btn--primary" disabled={!draft.trim()}>
              {c.send}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
