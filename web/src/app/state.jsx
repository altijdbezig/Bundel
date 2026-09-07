import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SOURCE_KEYS, getStudent } from './data'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import * as store from './store'

/**
 * De toestand van de app terwijl je hem gebruikt, met de database eronder.
 *
 * Bij het openen wordt alles van de ingelogde gebruiker geladen. Daarna
 * reageert het scherm meteen op wat je doet en gaat de wijziging er in
 * dezelfde beweging achteraan naar Supabase. Mislukt dat, dan blijft de
 * database de bron en klopt het bij de volgende keer laden weer.
 */

/* Ook los geëxporteerd, zodat de rendertest een gevulde toestand kan aanbieden. */
export const AppStateContext = createContext(null)

const emptySources = () =>
  SOURCE_KEYS.reduce((acc, key) => {
    acc[key] = { connected: true, reachable: true }
    return acc
  }, {})

const NOTIFY_COLUMN = {
  deadline: 'notify_deadline',
  grade: 'notify_grade',
  message: 'notify_message',
  schedule: 'notify_schedule',
}

function Loading({ text }) {
  return (
    <div className="appboot" role="status">
      <span className="appboot__text meta">{text}</span>
    </div>
  )
}

function Failed({ text, retry, label }) {
  return (
    <div className="appboot">
      <p className="notice notice--warn">{text}</p>
      <button type="button" className="btn btn--secondary" onClick={retry}>
        {label}
      </button>
    </div>
  )
}

export function AppStateProvider({ children }) {
  const { user } = useAuth()
  const { t } = useI18n()

  const [status, setStatus] = useState('loading')
  const [done, setDone] = useState({})
  const [sources, setSources] = useState(emptySources)
  const [sentMessages, setSentMessages] = useState({})
  const [readIds, setReadIds] = useState([])
  const [notificationsOn, setNotificationsOnLocal] = useState(true)
  const [groupTasks, setGroupTasks] = useState({})
  const [syncing, setSyncing] = useState([])
  const [syncedAt, setSyncedAt] = useState({})
  const [startScreen, setStartScreenLocal] = useState('/app')
  const [ownItems, setOwnItems] = useState([])
  const [notifyKinds, setNotifyKinds] = useState({
    deadline: true,
    grade: true,
    message: true,
    schedule: true,
  })

  const userId = user?.id ?? null

  /** Zet alles wat uit de database komt in een keer klaar. */
  const apply = useCallback((loaded) => {
    setDone(loaded.done)
    setGroupTasks(loaded.groupTasks)
    setSources(loaded.sources)
    setSyncedAt(loaded.syncedAt)
    setReadIds(loaded.readIds)
    setOwnItems(loaded.ownItems)
    setNotificationsOnLocal(loaded.notificationsOn)
    setStartScreenLocal(loaded.startScreen)
    setNotifyKinds(loaded.notifyKinds)
    setSentMessages({})
  }, [])

  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!user) {
      store.unload()
      setStatus('loading')
      return undefined
    }

    let alive = true
    setStatus('loading')

    store
      .load(user)
      .then((loaded) => {
        if (!alive) return
        apply(loaded)
        setStatus('ready')
      })
      .catch((error) => {
        console.error('Bundel: laden mislukt', error.message)
        if (alive) setStatus('error')
      })

    return () => {
      alive = false
    }
  }, [user, apply, attempt])

  const value = useMemo(() => {
    const toggleDone = (id) => {
      const next = !done[id]
      setDone((d) => ({ ...d, [id]: next }))
      store.setAssignmentDone(userId, id, next)
    }

    const writeSource = (key, patch) => {
      setSources((s) => ({ ...s, [key]: { ...s[key], ...patch } }))
      store.setSource(userId, key, patch)
    }

    const toggleConnected = (key) =>
      writeSource(key, { connected: !sources[key].connected, reachable: true })

    const toggleReachable = (key) => writeSource(key, { reachable: !sources[key].reachable })

    const connectAll = () => {
      setSources(emptySources())
      SOURCE_KEYS.forEach((key) => store.setSource(userId, key, { connected: true, reachable: true }))
    }

    const sendMessage = (groupId, text) => {
      const me = getStudent()
      const stamp = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
      const message = {
        id: `own-${Date.now()}`,
        from: me.name.split(' ')[0],
        initials: me.initials,
        time: stamp,
        self: true,
        text,
      }
      setSentMessages((m) => ({ ...m, [groupId]: [...(m[groupId] ?? []), message] }))
      store.addMessage(userId, groupId, {
        from: message.from,
        initials: message.initials,
        time: stamp,
        text,
        position: 1000 + (sentMessages[groupId]?.length ?? 0),
      })
    }

    const toggleGroupTask = (id) => {
      const next = !groupTasks[id]
      setGroupTasks((g) => ({ ...g, [id]: next }))
      store.setGroupTaskDone(userId, id, next)
    }

    const addOwnItem = async (item) => {
      /* Eerst een tijdelijk nummer, zodat het blok meteen in het rooster staat. */
      const temporary = `new-${Date.now()}`
      setOwnItems((list) => [...list, { ...item, id: temporary }])
      const id = await store.addOwnItem(userId, item)
      if (id) setOwnItems((list) => list.map((entry) => (entry.id === temporary ? { ...entry, id } : entry)))
    }

    const updateOwnItem = (id, patch) => {
      setOwnItems((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)))
      store.updateOwnItem(userId, id, patch)
    }

    const removeOwnItem = (id) => {
      setOwnItems((list) => list.filter((item) => item.id !== id))
      store.removeOwnItem(userId, id)
    }

    const toggleNotifyKind = (kind) => {
      const next = !notifyKinds[kind]
      setNotifyKinds((k) => ({ ...k, [kind]: next }))
      store.setProfile(userId, { [NOTIFY_COLUMN[kind]]: next })
    }

    const setNotificationsOn = (next) => {
      setNotificationsOnLocal(next)
      store.setProfile(userId, { notifications_on: next })
    }

    const setStartScreen = (next) => {
      setStartScreenLocal(next)
      store.setProfile(userId, { start_screen: next })
    }

    /** Haalt een bron opnieuw op. Doet nog niets echts, want er is nog geen koppeling. */
    const syncNow = (key) => {
      if (syncing.includes(key)) return
      setSyncing((list) => [...list, key])
      const stamp = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
      window.setTimeout(() => {
        setSyncedAt((map) => ({ ...map, [key]: stamp }))
        setSyncing((list) => list.filter((k) => k !== key))
        store.setSource(userId, key, { last_sync: stamp, synced_at: new Date().toISOString() })
      }, 900)
    }

    const status_ = (key) => {
      const s = sources[key]
      if (!s?.connected) return 'off'
      if (!s.reachable) return 'warn'
      return 'ok'
    }

    /** Bronnen die gekoppeld zijn maar niet reageren. Voedt de balk bovenaan. */
    const unreachable = SOURCE_KEYS.filter((key) => sources[key].connected && !sources[key].reachable)

    /** Geen enkele bron gekoppeld: dan neemt het onboarding-scherm het over. */
    const noSources = SOURCE_KEYS.every((key) => !sources[key].connected)

    const isRead = (id) => readIds.includes(id)

    const markRead = (id) => {
      if (readIds.includes(id)) return
      setReadIds((r) => [...r, id])
      store.setNotificationsRead(userId, [id])
    }

    const markAllRead = (ids) => {
      setReadIds(ids)
      store.setNotificationsRead(userId, ids)
    }

    /** Zet de demodata terug zoals hij was. Zit onder Instellingen. */
    const resetAll = async () => {
      try {
        apply(await store.reset(user))
      } catch (error) {
        console.error('Bundel: opnieuw beginnen mislukt', error.message)
        setStatus('error')
      }
    }

    return {
      done,
      toggleDone,
      sources,
      toggleConnected,
      toggleReachable,
      connectAll,
      status: status_,
      unreachable,
      noSources,
      sentMessages,
      sendMessage,
      readIds,
      isRead,
      markRead,
      markAllRead,
      notificationsOn,
      setNotificationsOn,
      notifyKinds,
      toggleNotifyKind,
      groupTasks,
      toggleGroupTask,
      syncing,
      syncedAt,
      syncNow,
      startScreen,
      setStartScreen,
      ownItems,
      addOwnItem,
      updateOwnItem,
      removeOwnItem,
      resetAll,
    }
  }, [
    user,
    userId,
    apply,
    done,
    sources,
    sentMessages,
    readIds,
    notificationsOn,
    notifyKinds,
    groupTasks,
    syncing,
    syncedAt,
    startScreen,
    ownItems,
  ])

  if (status === 'loading') return <Loading text={t.app.loading} />
  if (status === 'error') {
    return <Failed text={t.app.loadFailed} retry={() => setAttempt((n) => n + 1)} label={t.app.retry} />
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState moet binnen AppStateProvider staan')
  return ctx
}
