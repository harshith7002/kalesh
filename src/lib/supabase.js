import { createClient } from '@supabase/supabase-js'

// The client wants the bare project URL. Supabase's dashboard also shows the
// REST endpoint (…/rest/v1/), which is easy to paste by mistake, so drop any path.
const url = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/^(https?:\/\/[^/]+).*$/, '$1')
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

// Add ?demo to the address to force Local Demo Mode even when keys are set.
const forceDemo = new URLSearchParams(window.location.search).has('demo')

export const isSupabaseConfigured = Boolean(url && key) && !forceDemo

// The session is persisted so a browser keeps the same anonymous user id,
// and therefore the same #tag, across visits.
export const supabase = isSupabaseConfigured ? createClient(url, key) : null

// Silent, password-less identity. Returns the user id, or null when anonymous
// sign-ins are switched off in the Supabase project (the app still works,
// posts just carry no tag).
export async function anonymousUserId() {
  try {
    const { data } = await supabase.auth.getSession()
    if (data.session) return data.session.user.id
    const res = await supabase.auth.signInAnonymously()
    if (res.error) throw res.error
    return res.data.user?.id ?? null
  } catch (err) {
    console.warn('[kalesh] anonymous sign-in unavailable:', err.message)
    return null
  }
}
