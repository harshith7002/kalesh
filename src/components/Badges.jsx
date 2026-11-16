import { MapPin, FlaskConical } from 'lucide-react'
import { useApp } from '../context'
import { cx, tagOf } from '../lib/utils'

export function CityBadge({ city }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold">
      <MapPin size={10} />
      {city}
    </span>
  )
}

export function RatioBadge() {
  return (
    <span className="inline-flex animate-glow items-center rounded-full border border-danger bg-danger/15 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-danger">
      RATIO’D 💀
    </span>
  )
}

export function SimBadge({ label = 'Simulated' }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white/5 px-2 py-0.5 text-[11px] font-medium text-mute">
      <FlaskConical size={10} />
      {label}
    </span>
  )
}

// Handle plus the per-browser tag that tells same-named users apart.
export function AuthorName({ handle, authorId, small = false }) {
  const { me } = useApp()
  const tag = tagOf(authorId)
  return (
    <span className="flex min-w-0 items-baseline gap-1">
      <span className={cx('truncate font-bold text-text', small && 'text-sm')}>{handle}</span>
      {tag && (
        <span className="shrink-0 font-mono text-[11px] text-mute" title="Unique tag for this person's browser">
          {tag}
        </span>
      )}
      {authorId && authorId === me && (
        <span className="shrink-0 rounded bg-sky/15 px-1 text-[10px] font-bold uppercase text-sky">you</span>
      )}
    </span>
  )
}
