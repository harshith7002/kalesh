import { Home, Swords, TrendingUp, User } from 'lucide-react'
import { cx } from '../lib/utils'

const ITEMS = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'mob', label: 'Mob', icon: Swords },
  { id: 'heat', label: 'Heat', icon: TrendingUp },
]

// Phone-only tab bar, so the site feels like an app when opened from X.
export default function BottomNav({ view, onView, onIdentity }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-black/90 backdrop-blur sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const active = view === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onView(id)}
            aria-current={active ? 'page' : undefined}
            className={cx('flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold', active ? 'text-gold' : 'text-mute')}
          >
            <Icon size={22} strokeWidth={active ? 2.6 : 2} />
            {label}
          </button>
        )
      })}
      <button type="button" onClick={onIdentity} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-mute">
        <User size={22} />
        You
      </button>
    </nav>
  )
}
