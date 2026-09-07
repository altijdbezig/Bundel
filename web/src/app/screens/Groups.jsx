import { useState } from 'react'
import { IconLock } from '../../components/Icons'
import { useI18n } from '../../i18n'
import { useAppState } from '../state'
import { getGroups } from '../data'

export default function Groups() {
  const { t, lang } = useI18n()
  const { sentMessages, sendMessage } = useAppState()
  const c = t.app.groups

  const groups = getGroups(lang)
  const [activeId, setActiveId] = useState(groups[0].id)
  const [draft, setDraft] = useState('')

  const active = groups.find((g) => g.id === activeId) ?? groups[0]
  const messages = [...active.messages, ...(sentMessages[active.id] ?? [])]

  function handleSubmit(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    sendMessage(active.id, text)
    setDraft('')
  }

  return (
    <div className="screen">
      <header className="screen__head">
        <h1 className="screen__title">{c.title}</h1>
      </header>

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

      <div className="group">
        <section className="card stack stack-4 group__info">
          <div className="stack stack-2">
            <h2 className="heading">{active.name}</h2>
            <span className="meta">
              {active.members.length} {c.members} · {c.linkedTo} {active.subject}
            </span>
          </div>

          <div className="stack stack-2">
            {active.members.map((m) => (
              <span key={m.initials} className="member">
                <span className={`avatar ${m.self ? 'is-self' : ''}`}>{m.initials}</span>
                <span className="member__name">{m.name}</span>
              </span>
            ))}
          </div>

          <span className="meta row group__lock">
            <IconLock size={17} />
            {c.encrypted}
          </span>
        </section>

        <section className="card group__chat">
          <div className="chat">
            {messages.map((m) => (
              <div key={m.id} className={`bubble ${m.self ? 'is-self' : ''}`}>
                <span className="bubble__head">
                  <span className={`avatar avatar--sm ${m.self ? 'is-self' : ''}`}>{m.initials}</span>
                  <span className="bubble__from">{m.from}</span>
                  <span className="bubble__time data">{m.time}</span>
                </span>
                <p className="bubble__text">{m.text}</p>
              </div>
            ))}
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
