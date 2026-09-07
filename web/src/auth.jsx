import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase, configured } from './supabase'

/**
 * Inloggen via Supabase Auth.
 *
 * De sessie staat in de browser en wordt door supabase-js zelf ververst.
 * De functies hieronder geven geen kant-en-klare zin terug maar een code,
 * zodat het scherm hem in de goede taal kan tonen.
 */

const AuthContext = createContext(null)

/** Vertaalt de melding van Supabase naar een van onze eigen codes. */
function codeFor(error) {
  const message = String(error?.message ?? '').toLowerCase()
  if (message.includes('invalid login')) return 'invalid'
  if (message.includes('already registered') || message.includes('already been registered')) return 'exists'
  if (message.includes('should be different')) return 'samePassword'
  if (message.includes('password')) return 'weakPassword'
  if (message.includes('email')) return 'invalidEmail'
  if (message.includes('rate limit')) return 'tooMany'
  return 'unknown'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(!configured)

  useEffect(() => {
    if (!configured) return undefined

    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session ?? null)
      setReady(true)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null)
    })

    return () => {
      alive = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (!configured) return 'notConfigured'
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return error ? codeFor(error) : null
  }, [])

  const signUp = useCallback(async (email, password, name) => {
    if (!configured) return 'notConfigured'
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name?.trim() || '' } },
    })
    if (error) return codeFor(error)
    /* Zonder sessie staat bevestiging per mail aan en moet de gebruiker eerst klikken. */
    return data.session ? null : 'confirmEmail'
  }, [])

  /** Stuurt een herstelmail. De link daarin komt uit op /wachtwoord. */
  const requestReset = useCallback(async (email) => {
    if (!configured) return 'notConfigured'
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/wachtwoord`,
    })
    return error ? codeFor(error) : null
  }, [])

  /** Zet een nieuw wachtwoord voor wie via de herstellink binnenkomt. */
  const updatePassword = useCallback(async (password) => {
    if (!configured) return 'notConfigured'
    const { error } = await supabase.auth.updateUser({ password })
    return error ? codeFor(error) : null
  }, [])

  const signOut = useCallback(async () => {
    if (configured) await supabase.auth.signOut()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      signedIn: Boolean(session),
      ready,
      signIn,
      signUp,
      signOut,
      requestReset,
      updatePassword,
    }),
    [session, ready, signIn, signUp, signOut, requestReset, updatePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth moet binnen AuthProvider staan')
  return ctx
}

/** Stuurt terug naar /login als er geen sessie is. */
export function RequireAuth({ children }) {
  const { signedIn, ready } = useAuth()
  const location = useLocation()

  /* Even wachten tot de sessie uit de browser is gelezen, anders flitst /login voorbij. */
  if (!ready) return null

  if (!signedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
