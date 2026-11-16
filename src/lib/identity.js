import { CITIES } from './constants'
import { pick, rand, uid } from './utils'

const ID_KEY = 'kalesh.identity.v1'
const REACT_KEY = 'kalesh.reactions.v1'

const FIRST = [
  'FilterKaapi', 'Koramangala', 'Potheri', 'Bandra', 'CuttingChai', 'Marina', 'SilkBoard',
  'Gurgaon', 'Biryani', 'IraniChai', 'Dadar', 'HSR', 'Velachery', 'Howrah', 'Jalebi',
  'MasalaDosa', 'VadaPav', 'Charminar', 'Rosogolla', 'SouthDelhi', 'Andheri', 'Tambaram',
]
const SECOND = [
  'Refugee', 'NightOwl', 'Survivor', 'Philosopher', 'Intern', 'Uncle', 'Critic', 'Commuter',
  'Supremacist', 'Dropout', 'Overthinker', 'Warrior', 'Loyalist', 'Insomniac', 'Enjoyer',
]

export function randomHandle() {
  const first = pick(FIRST)
  return Math.random() < 0.4 ? `@${first}_${10 + rand(90)}` : `@${first}_${pick(SECOND)}`
}

export function sanitizeHandle(raw) {
  const body = String(raw || '').replace(/[^A-Za-z0-9_]/g, '').slice(0, 20)
  return body.length >= 2 ? `@${body}` : null
}

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked: identity just won't persist */
  }
}

export function loadIdentity() {
  const saved = read(ID_KEY)
  if (saved?.handle && CITIES.includes(saved.city)) return saved
  const fresh = { handle: randomHandle(), city: 'All India' }
  write(ID_KEY, fresh)
  return fresh
}
export const saveIdentity = (identity) => write(ID_KEY, identity)

// Local Demo Mode only: a random id that stands in for the Supabase user id.
const DEVICE_KEY = 'kalesh.device.v1'
export function loadDeviceId() {
  const saved = read(DEVICE_KEY)
  if (typeof saved === 'string' && saved.length >= 8) return saved
  const fresh = uid()
  write(DEVICE_KEY, fresh)
  return fresh
}

const EMPTY = { kadakPosts: [], kadakReplies: [] }
export function loadReactions() {
  return { ...EMPTY, ...(read(REACT_KEY) || {}) }
}
export const saveReactions = (reactions) => write(REACT_KEY, reactions)
