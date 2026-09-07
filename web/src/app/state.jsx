import { createContext, useContext, useMemo, useState } from 'react'
import { SOURCE_KEYS } from './data'

/**
 * Losse schermtoestand van de demo: afgevinkte taken, bronstatus, gelezen
 * meldingen en voorkeuren. Leeft alleen zolang de app open staat.
 * Later vervangt de back-end dit.
 */

const AppStateContext = createContext(null)

const initialSources = () =>
  SOURCE_KEYS.reduce((acc, key) => {
    acc[key] = { connected: true, reachable: true }
    return acc
  }, {})

export function AppStateProvider({ children }) {
  const [done, setDone] = useState({})
  const [sources, setSources] = useState(initialSources)
  const [sentMessages, setSentMessages] = useState({})
  const [readIds, setReadIds] = useState([])
  const [notificationsOn, setNotificationsOn] = useState(true)
  const [groupTasks, setGroupTasks] = useState({})
  const [syncing, setSyncing] = useState([])
  const [syncedAt, setSyncedAt] = useState({})
  const [startScreen, setStartScreen] = useState('/app')

  /* Meldingen per soort. De kaartjes in data.js hebben een kind. */
  const [notifyKinds, setNotifyKinds] = useState({
    deadline: true,
    grade: true,
    message: true,
    schedule: true,
  })

  const value = useMemo(() => {
    const toggleDone = (id) => setDone((d) => ({ ...d, [id]: !d[id] }))

    const toggleConnected = (key) =>
      setSources((s) => ({ ...s, [key]: { ...s[key], connected: !s[key].connected, reachable: true } }))

    const toggleReachable = (key) =>
      setSources((s) => ({ ...s, [key]: { ...s[key], reachable: !s[key].reachable } }))

    const connectAll = () => setSources(initialSources())

    const sendMessage = (groupId, text) =>
      setSentMessages((m) => ({
        ...m,
        [groupId]: [
          ...(m[groupId] ?? []),
          { id: `own-${Date.now()}`, from: 'Luca', initials: 'LV', time: 'nu', self: true, text },
        ],
      }))

    const toggleGroupTask = (id) => setGroupTasks((g) => ({ ...g, [id]: !g[id] }))

    const toggleNotifyKind = (kind) => setNotifyKinds((k) => ({ ...k, [kind]: !k[kind] }))

    /** Doet alsof een bron opnieuw ophaalt en zet de synctijd op nu. */
    const syncNow = (key) => {
      if (syncing.includes(key)) return
      setSyncing((list) => [...list, key])
      const stamp = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
      window.setTimeout(() => {
        setSyncedAt((map) => ({ ...map, [key]: stamp }))
        setSyncing((list) => list.filter((k) => k !== key))
      }, 900)
    }

    const status = (key) => {
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
    const markRead = (id) => setReadIds((r) => (r.includes(id) ? r : [...r, id]))
    const markAllRead = (ids) => setReadIds(ids)

    /** Wist alles wat de demo onthoudt. Zit onder Instellingen. */
    const resetAll = () => {
      setDone({})
      setSources(initialSources())
      setSentMessages({})
      setReadIds([])
      setNotificationsOn(true)
      setNotifyKinds({ deadline: true, grade: true, message: true, schedule: true })
      setGroupTasks({})
      setSyncedAt({})
      setStartScreen('/app')
    }

    return {
      done,
      toggleDone,
      sources,
      toggleConnected,
      toggleReachable,
      connectAll,
      status,
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
      resetAll,
    }
  }, [done, sources, sentMessages, readIds, notificationsOn, notifyKinds, groupTasks, syncing, syncedAt, startScreen])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState moet binnen AppStateProvider staan')
  return ctx
}
