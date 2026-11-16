import { useEffect, useState } from 'react'
import { Dices, X } from 'lucide-react'
import { CITIES } from '../lib/constants'
import { randomHandle, sanitizeHandle } from '../lib/identity'
import { cx } from '../lib/utils'
import Avatar from './Avatar'

export default function IdentityModal({ identity, tag, verified, onSave, onClose }) {
  const [handle, setHandle] = useState(identity.handle.replace(/^@/, ''))
  const [city, setCity] = useState(identity.city)
  const clean = sanitizeHandle(handle)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-sky/10 p-4 pt-[10vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div data-modal role="dialog" aria-modal="true" aria-label="Edit burner identity" className="w-full max-w-md animate-rise rounded-2xl border border-line bg-black p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Your burner identity</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        <p className="mt-1 text-sm text-mute">No email, no password, no OTP. Saved only in this browser.</p>
        {tag && (
          <p className="mt-2 rounded-lg border border-line px-3 py-2 text-xs text-mute">
            Your tag is <span className="font-mono font-bold text-text">{tag}</span>. It shows next to your handle on everything you post, so
            people can tell you apart from anyone else using the same name.{' '}
            {verified ? 'It is tied to this browser and nobody else can post with it.' : 'In Local Demo Mode it is only a local label.'}
          </p>
        )}

        <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-mute" htmlFor="handle-input">
          Handle
        </label>
        <div className="mt-1 flex items-center gap-2">
          <Avatar handle={clean || '@?'} size={40} />
          <div className="flex flex-1 items-center rounded-lg border border-line px-3 focus-within:border-sky">
            <span className="text-mute">@</span>
            <input
              id="handle-input"
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/[^A-Za-z0-9_]/g, '').slice(0, 20))}
              className="w-full bg-transparent py-2.5 pl-0.5 text-text focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <button
            type="button"
            onClick={() => setHandle(randomHandle().slice(1))}
            title="Roll a new handle"
            aria-label="Roll a new handle"
            className="rounded-lg border border-line p-2.5 text-gold transition-colors hover:bg-gold/10"
          >
            <Dices size={20} />
          </button>
        </div>
        {!clean && <p className="mt-1 text-xs text-danger">At least 2 letters, numbers or underscores.</p>}

        <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-mute">Your adda</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCity(c)}
              aria-pressed={c === city}
              className={cx(
                'rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors',
                c === city ? 'border-gold bg-gold text-black' : 'border-line text-text hover:bg-white/10',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!clean}
          onClick={() => onSave({ handle: clean, city })}
          className="mt-6 w-full rounded-full bg-text py-2.5 font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  )
}
