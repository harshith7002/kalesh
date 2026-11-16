import { createClient } from '@supabase/supabase-js'

// The client wants the bare project URL. Supabase's dashboard also shows the
// REST endpoint (…/rest/v1/), which is easy to paste by mistake, so drop any path.
const url = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/^(https?:\/\/[^/]+).*$/, '$1')
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(url && key)

export const supabase = isSupabaseConfigured
  ? createClient(url, key, { auth: { persistSession: false } })
  : null
