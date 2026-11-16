import { Home, Pencil, Swords, Zap } from 'lucide-react'
import { useApp } from '../context'
import { SITE_NAME, TAGLINE } from '../lib/constants'
import { cx } from '../lib/utils'
import Avatar from './Avatar'

function NavItem({ icon: Icon, label, active, secondary, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'flex items-center gap-4 whitespace-nowrap rounded-full p-3 transition-colors hover:bg-white/10 xl:pr-6',
        secondary ? 'text-base text-text/80' : 'text-xl',
        active && 'font-extrabold text-text',
      )}
    >
      <Icon size={secondary ? 22 : 26} strokeWidth={active ? 2.6 : 2} className={active ? 'text-gold' : ''} />
      <span className="hidden xl:inline">{label}</span>
    </button>
  )
}

export default function Sidebar() {
  const { identity, view, setView, focusComposer, openIdentity } = useApp()
  return (
    <header className="sticky top-0 hidden h-screen w-[72px] shrink-0 flex-col items-center justify-between px-2 py-3 sm:flex xl:w-[275px] xl:items-stretch">
      <div className="flex flex-col items-center gap-1 xl:items-start">
        <button
          type="button"
          onClick={() => setView('feed')}
          className="mb-2 flex items-center gap-2 rounded-2xl p-3 text-left transition-colors hover:bg-gold/10"
          aria-label={`${SITE_NAME} home`}
        >
          <Zap size={30} className="shrink-0 fill-gold text-gold" />
          <span className="hidden xl:block">
            <span className="block text-2xl font-black leading-6 tracking-tight text-gold">{SITE_NAME}</span>
            <span className="block text-[11px] leading-4 text-mute">{TAGLINE}</span>
          </span>
        </button>
        <NavItem icon={Home} label="Live India Feed" active={view === 'feed'} onClick={() => setView('feed')} />
        <NavItem icon={Swords} label="Test Against the Mob" secondary active={view === 'mob'} onClick={() => setView('mob')} />
        <NavItem icon={Pencil} label="Edit Burner Handle" secondary onClick={openIdentity} />
        <button
          type="button"
          onClick={focusComposer}
          className="mt-3 flex items-center justify-center gap-2 rounded-full bg-sky p-3 font-extrabold text-white transition-opacity hover:opacity-90 xl:w-full xl:py-3.5"
          aria-label="Post Kalesh"
        >
          <Zap size={22} className="fill-current xl:hidden" />
          <span className="hidden xl:inline">Post Kalesh</span>
        </button>
      </div>

      <button
        type="button"
        onClick={openIdentity}
        className="flex items-center gap-3 rounded-full p-2 text-left transition-colors hover:bg-white/10"
        title="Edit your burner identity"
      >
        <Avatar handle={identity.handle} size={40} />
        <span className="hidden min-w-0 xl:block">
          <span className="block truncate text-sm font-bold">{identity.handle}</span>
          <span className="block truncate text-xs text-mute">{identity.city} · no login, ever</span>
        </span>
      </button>
    </header>
  )
}
