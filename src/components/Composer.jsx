import { useRef, useState } from 'react'
import { ChevronDown, MapPin, Zap } from 'lucide-react'
import { useApp } from '../context'
import { createPost } from '../lib/store'
import { CITIES, MAX_LEN } from '../lib/constants'
import { cx } from '../lib/utils'
import Avatar from './Avatar'

// City selector pill: a native select (best on mobile) dressed as a pill.
export function CityPill({ value, onChange }) {
  return (
    <label className="relative inline-flex items-center gap-1 rounded-full border border-gold/50 py-1 pl-2.5 pr-7 text-xs font-bold text-gold transition-colors focus-within:border-gold hover:bg-gold/10">
      <MapPin size={13} />
      <span className="sr-only">Post to city</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-1 font-bold text-gold focus:outline-none"
      >
        {CITIES.map((c) => (
          <option key={c} value={c} className="bg-black text-text">
            {c}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2" />
    </label>
  )
}

// Counter ring like X: fills as you type, turns red past the limit.
export function CharCounter({ length }) {
  const left = MAX_LEN - length
  const r = 9
  const c = 2 * Math.PI * r
  const pct = Math.min(1, length / MAX_LEN)
  const color = left < 0 ? '#F4212E' : left <= 20 ? '#F59E0B' : '#1D9BF0'
  return (
    <span className="flex items-center gap-1.5" aria-label={`${left} characters left`}>
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r={r} fill="none" stroke="#2F3336" strokeWidth="2.5" />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          transform="rotate(-90 12 12)"
        />
      </svg>
      <span className={cx('min-w-[3ch] text-right text-xs tabular-nums', left < 0 ? 'text-danger' : left <= 20 ? 'text-gold' : 'text-mute')}>
        {left}
      </span>
    </span>
  )
}

export function autoGrow(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 320)}px`
}

export default function Composer() {
  const { identity, setCity, notify } = useApp()
  const [text, setText] = useState('')
  const ref = useRef(null)
  const trimmed = text.trim()
  const ok = trimmed.length > 0 && text.length <= MAX_LEN

  const post = () => {
    if (!ok) return
    createPost({ handle: identity.handle, city: identity.city, content: trimmed })
    setText('')
    requestAnimationFrame(() => autoGrow(ref.current))
    notify(`Kalesh posted to ${identity.city} 🔥`)
  }

  return (
    <div className="flex gap-3 border-b border-line px-4 pb-2 pt-3">
      <Avatar handle={identity.handle} size={40} />
      <div className="min-w-0 flex-1">
        <textarea
          id="composer-input"
          ref={ref}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            autoGrow(e.target)
          }}
          onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && post()}
          rows={2}
          placeholder="What's the kalesh today?"
          aria-label="Write a post"
          className="w-full resize-none bg-transparent py-1.5 text-xl leading-7 text-text placeholder:text-mute focus:outline-none"
        />
        <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
          <CityPill value={identity.city} onChange={setCity} />
          <div className="flex items-center gap-2 sm:gap-3">
            <CharCounter length={text.length} />
            <button
              type="button"
              disabled={!ok}
              onClick={post}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-sky px-4 py-2 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Zap size={15} className="hidden fill-current sm:block" />
              Post Kalesh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
