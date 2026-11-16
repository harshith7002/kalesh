import { CITIES } from '../lib/constants'
import { cx } from '../lib/utils'

export default function CityTabs({ value, onChange }) {
  return (
    <div className="no-scrollbar flex overflow-x-auto" role="tablist" aria-label="Filter by adda">
      {CITIES.map((city) => {
        const active = city === value
        return (
          <button
            key={city}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(city)}
            className={cx(
              'relative shrink-0 px-4 py-3 text-sm transition-colors hover:bg-white/5',
              active ? 'font-bold text-text' : 'font-medium text-mute',
            )}
          >
            {city}
            {active && <span className="absolute inset-x-3 bottom-0 h-1 rounded-full bg-gold" />}
          </button>
        )
      })}
    </div>
  )
}
