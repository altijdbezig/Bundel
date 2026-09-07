import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const STORAGE_KEY = 'bundel.demo-session'

/**
 * Nep-sessie voor de demo. Zet alleen een vlag in de browser.
 *
 * Zodra er echte auth is: vervang signIn en signOut door aanroepen naar de
 * back-end en lees `signedIn` uit het antwoord van de server. RequireAuth
 * hoeft dan niet te veranderen.
 */

const AuthContext = createContext({ signedIn: false, signIn: () => {}, signOut: () => {} })

function read() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function AuthProvider({ children }) {
  const [signedIn, setSignedIn] = useState(read)

  const signIn = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* private mode: sessie geldt dan alleen dit tabblad */
    }
    setSignedIn(true)
  }, [])

  const signOut = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* niets te doen */
    }
    setSignedIn(false)
  }, [])

  const value = useMemo(() => ({ signedIn, signIn, signOut }), [signedIn, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

/** Stuurt terug naar /login als er geen sessie is. */
export function RequireAuth({ children }) {
  const { signedIn } = useAuth()
  const location = useLocation()

  if (!signedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
