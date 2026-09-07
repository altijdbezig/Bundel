import { createClient } from '@supabase/supabase-js'

/**
 * De verbinding met Supabase. De sleutels staan in omgevingsvariabelen,
 * niet in de code. Lokaal in `.env.local`, op Vercel bij Project Settings ·
 * Environment Variables. De publieke sleutel mag in de browser staan: wat
 * een gebruiker mag zien is afgeschermd met RLS in de database zelf.
 */

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Zonder sleutels draait de site nog, maar inloggen doet dan niets. */
export const configured = Boolean(url && key)

export const supabase = configured
  ? createClient(url, key, {
      /* detectSessionInUrl staat aan voor de herstellink uit de mail: die brengt
         het token mee in de URL en supabase-js leest hem daar zelf uit. */
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
