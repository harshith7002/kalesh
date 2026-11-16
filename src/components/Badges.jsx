import { Forward, MapPin, FlaskConical } from 'lucide-react'

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

// WhatsApp-style stamp.
export function ForwardedBadge() {
  return (
    <div className="mb-1 flex items-center gap-1 text-xs italic text-mute">
      <span className="flex -space-x-2">
        <Forward size={13} />
        <Forward size={13} />
      </span>
      Forwarded many times
    </div>
  )
}
