import { useSyncExternalStore } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import { buildSeed } from './seed'
import { uid } from './utils'

const LS_KEY = 'kalesh.db.v1'

let state = {
  posts: [],
  replies: [],
  loading: true,
  mode: isSupabaseConfigured ? 'supabase' : 'local', // 'supabase' | 'local'
  live: false, // realtime channel subscribed
  error: null,
}
const listeners = new Set()
const set = (patch) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const useStore = () => useSyncExternalStore(subscribe, () => state)
export const clearError = () => set({ error: null })

const upsert = (list, row) => {
  const i = list.findIndex((r) => r.id === row.id)
  if (i === -1) return [...list, row]
  const copy = list.slice()
  copy[i] = { ...copy[i], ...row }
  return copy
}
const remove = (list, id) => list.filter((r) => r.id !== id)

/* ---------- localStorage backend ---------- */

function writeLocal() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ posts: state.posts, replies: state.replies }))
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}
function readLocal() {
  try {
    const data = JSON.parse(localStorage.getItem(LS_KEY))
    if (Array.isArray(data?.posts) && Array.isArray(data?.replies)) return data
  } catch {
    /* corrupt: reseed below */
  }
  return null
}
function startLocal() {
  const data = readLocal() || buildSeed()
  set({ ...data, loading: false, mode: 'local' })
  writeLocal()
  // Other tabs on the same browser stay in sync.
  window.addEventListener('storage', (e) => {
    if (e.key !== LS_KEY) return
    const next = readLocal()
    if (next) set(next)
  })
}

/* ---------- Supabase backend ---------- */

async function fetchRemote() {
  const [p, r] = await Promise.all([
    supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('replies').select('*').order('created_at', { ascending: false }).limit(2000),
  ])
  if (p.error || r.error) throw new Error((p.error || r.error).message)
  return { posts: p.data, replies: r.data }
}

function subscribeRemote() {
  const onChange = (key) => (payload) => {
    if (payload.eventType === 'DELETE') set({ [key]: remove(state[key], payload.old.id) })
    else set({ [key]: upsert(state[key], payload.new) })
  }
  supabase
    .channel('kalesh-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, onChange('posts'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'replies' }, onChange('replies'))
    .subscribe((status) => {
      const live = status === 'SUBSCRIBED'
      // Reconnected after a drop: pull whatever was missed while offline.
      if (live && everLive) resync()
      if (live) everLive = true
      set({ live })
    })
  // Phones suspend sockets in background tabs; catch up when the tab returns.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resync()
  })
}

let everLive = false
const merge = (list, rows) => {
  const byId = new Map(list.map((r) => [r.id, r]))
  for (const r of rows) byId.set(r.id, { ...byId.get(r.id), ...r })
  return [...byId.values()]
}
async function resync() {
  try {
    const data = await fetchRemote()
    set({ posts: merge(state.posts, data.posts), replies: merge(state.replies, data.replies) })
  } catch {
    /* still offline: the next reconnect retries */
  }
}

// Deep links (?post=<id>) may point at a post older than the loaded window.
export async function ensurePost(id) {
  if (state.mode !== 'supabase' || state.posts.some((p) => p.id === id)) return
  if (!/^[0-9a-f-]{36}$/i.test(id)) return
  const [p, r] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).maybeSingle(),
    supabase.from('replies').select('*').eq('post_id', id),
  ])
  if (p.data) set({ posts: merge(state.posts, [p.data]), replies: merge(state.replies, r.data || []) })
}

// Run a Supabase write; on failure surface the error and resync from the server.
async function remote(query) {
  const { error } = await query
  if (!error) return true
  set({ error: error.message })
  try {
    set(await fetchRemote())
  } catch {
    /* keep optimistic state; the error banner is already up */
  }
  return false
}

/* ---------- init ---------- */

let started = false
export async function init() {
  if (started) return
  started = true
  if (!isSupabaseConfigured) return startLocal()
  try {
    set({ ...(await fetchRemote()), loading: false })
    subscribeRemote()
  } catch (err) {
    // Keys present but backend unreachable or tables missing: stay usable.
    startLocal()
    set({ error: `Supabase unavailable (${err.message}). Running in local demo mode.` })
  }
}

/* ---------- actions (optimistic) ---------- */

const isRemote = () => state.mode === 'supabase'
const commit = (patch) => {
  set(patch)
  if (!isRemote()) writeLocal()
}

export function createPost({ handle, city, content }) {
  const row = {
    id: uid(),
    handle,
    city,
    content,
    kadaks: 0,
    forwards: 0,
    is_simulated: false,
    ratio_score: null,
    created_at: new Date().toISOString(),
  }
  commit({ posts: upsert(state.posts, row) })
  if (isRemote()) remote(supabase.from('posts').insert(row))
  return row
}

export function createReply({ post_id, parent_reply_id = null, handle, city, content, is_ratio = false }) {
  const row = {
    id: uid(),
    post_id,
    parent_reply_id,
    handle,
    city,
    content,
    kadaks: 0,
    is_ratio,
    archetype: null,
    created_at: new Date().toISOString(),
  }
  commit({ replies: upsert(state.replies, row) })
  if (isRemote()) remote(supabase.from('replies').insert(row))
  return row
}

export function bumpPost(id, field, delta) {
  const post = state.posts.find((p) => p.id === id)
  if (!post) return
  commit({ posts: upsert(state.posts, { id, [field]: Math.max(0, post[field] + delta) }) })
  if (isRemote()) remote(supabase.rpc('bump_post', { pid: id, field, delta }))
}

export function bumpReply(id, delta) {
  const reply = state.replies.find((r) => r.id === id)
  if (!reply) return
  commit({ replies: upsert(state.replies, { id, kadaks: Math.max(0, reply.kadaks + delta) }) })
  if (isRemote()) remote(supabase.rpc('bump_reply', { rid: id, delta }))
}

// Publish a simulated post plus its generated mob replies to the live feed.
export async function publishSimulation({ handle, city, content, kadaks, ratio_score, replies }) {
  const now = Date.now()
  const post = {
    id: uid(),
    handle,
    city,
    content,
    kadaks,
    forwards: 0,
    is_simulated: true,
    ratio_score,
    created_at: new Date(now).toISOString(),
  }
  const rows = replies.map((r, i) => ({
    id: uid(),
    post_id: post.id,
    parent_reply_id: null,
    handle: r.handle,
    city,
    content: r.content,
    kadaks: r.kadaks,
    is_ratio: false,
    archetype: r.archetype,
    created_at: new Date(now + (i + 1) * 1000).toISOString(),
  }))
  commit({ posts: upsert(state.posts, post), replies: [...state.replies, ...rows] })
  if (isRemote()) {
    // Post first: replies carry a foreign key to it.
    if (await remote(supabase.from('posts').insert(post))) await remote(supabase.from('replies').insert(rows))
  }
  return post
}

// Supabase mode with an empty table: pour in the starter posts.
export async function seedRemote() {
  const seed = buildSeed()
  commit({ posts: [...state.posts, ...seed.posts], replies: [...state.replies, ...seed.replies] })
  if (isRemote()) {
    if (await remote(supabase.from('posts').insert(seed.posts))) await remote(supabase.from('replies').insert(seed.replies))
  }
}
