export const cx = (...parts) => parts.filter(Boolean).join(' ')

export const uid = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })

export const rand = (n) => Math.floor(Math.random() * n)
export const pick = (arr) => arr[rand(arr.length)]
export const shuffle = (arr) => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function timeAgo(iso) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 45) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatCount(n) {
  if (n < 1000) return String(n)
  if (n < 100000) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, '')}K`
  return `${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`
}

// Stable avatar colour per handle.
export function avatarColor(handle = '') {
  let h = 0
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) % 360
  return `hsl(${h}, 62%, 42%)`
}

export const initialOf = (handle = '') => (handle.replace(/^@/, '')[0] || '?').toUpperCase()

// Short public tag from an author id, e.g. "#7F3A". Two people can pick the
// same handle; they cannot share a tag.
export const tagOf = (authorId) => (authorId ? `#${authorId.replace(/-/g, '').slice(0, 4).toUpperCase()}` : null)

export const topReplyOf = (replies) =>
  replies.reduce((best, r) => (!best || r.kadaks > best.kadaks ? r : best), null)

// A post is ratio'd when any reply in its thread has more Kadaks than it does.
export const isRatioed = (post, replies) => replies.some((r) => r.kadaks > post.kadaks)
