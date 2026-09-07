import { createContext, useContext, useMemo, useState } from 'react'
import { SOURCE_KEYS } from './data'

/**
 * Losse schermtoestand van de demo: welke taken afgevinkt zijn en welke
 * bronnen gekoppeld of onbereikbaar zijn. Leeft alleen zolang de app open
 * staat. Later vervangt de back-end dit.
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

  const value = useMemo(() => {
    const toggleDone = (id) => setDone((d) => ({ ...d, [id]: !d[id] }))

    const toggleConnected = (key) =>
      setSources((s) => ({ ...s, [key]: { ...s[key], connected: !s[key].connected, reachable: true } }))

    const toggleReachable = (key) =>
      setSources((s) => ({ ...s, [key]: { ...s[key], reachable: !s[key].reachable } }))

    const sendMessage = (groupId, text) =>
      setSentMessages((m) => ({
        ...m,
        [groupId]: [...(m[groupId] ?? []), { id: `own-${Date.now()}`, from: 'Luca', initials: 'LV', time: 'nu', self: true, text }],
      }))

    const status = (key) => {
      const s = sources[key]
      if (!s?.connected) return 'off'
      if (!s.reachable) return 'warn'
      return 'ok'
    }

    /** Bronnen die gekoppeld zijn maar niet reageren. Voedt de balk bovenaan. */
    const unreachable = SOURCE_KEYS.filter((key) => sources[key].connected && !sources[key].reachable)

    return { done, toggleDone, sources, toggleConnected, toggleReachable, status, unreachable, sentMessages, sendMessage }
  }, [done, sources, sentMessages])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState moet binnen AppStateProvider staan')
  return ctx
}
