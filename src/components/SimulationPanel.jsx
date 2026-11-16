import { useEffect, useState } from 'react'
import { Flame, ImageDown, Megaphone, RefreshCw, X } from 'lucide-react'
import { useApp } from '../context'
import { publishSimulation } from '../lib/store'
import { cx, formatCount, topReplyOf } from '../lib/utils'
import Avatar from './Avatar'
import { SimBadge } from './Badges'

const TONE = {
  danger: { text: 'text-danger', bar: 'bg-danger' },
  gold: { text: 'text-gold', bar: 'bg-gold' },
  safe: { text: 'text-emerald-400', bar: 'bg-emerald-400' },
}

export default function SimulationPanel({ sim, text, onClose, onRerun, onPublished }) {
  const { identity, share, notify } = useApp()
  const [shown, setShown] = useState(0)
  const done = shown >= sim.replies.length
  const tone = TONE[sim.verdict.tone]
  const top = topReplyOf(sim.replies)

  // Replies erupt one at a time.
  useEffect(() => {
    const timer = setInterval(() => {
      setShown((n) => {
        if (n >= sim.replies.length) {
          clearInterval(timer)
          return n
        }
        return n + 1
      })
    }, 190)
    return () => clearInterval(timer)
  }, [sim])

  const draft = {
    id: 'draft',
    handle: identity.handle,
    city: identity.city,
    content: text,
    kadaks: sim.postKadaks,
    forwards: 0,
    is_simulated: true,
  }

  const publish = async () => {
    await publishSimulation({
      handle: identity.handle,
      city: identity.city,
      content: text,
      kadaks: sim.postKadaks,
      ratio_score: sim.score,
      replies: sim.replies,
    })
    notify('Chaos published to the live feed 🔥')
    onPublished()
  }

  return (
    <section className="border-b border-line bg-gradient-to-b from-gold/[0.07] to-transparent" aria-label="Mob simulation result">
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-bold text-gold">Test Against the Mob</span>
          <span className="text-mute">· detected: {sim.topics.join(', ')}</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Close simulation" className="rounded-full p-1.5 text-mute hover:bg-white/10 hover:text-text">
          <X size={18} />
        </button>
      </div>

      <div className="mx-4 mt-3 rounded-2xl border border-line bg-card p-4">
        <div className="flex gap-3">
          <Avatar handle={draft.handle} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{draft.handle}</span>
              <SimBadge label="Not posted yet" />
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-5">{text}</p>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-gold">
              <Flame size={15} className="fill-current" />
              {formatCount(sim.postKadaks)} Kadaks
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-2xl border border-line bg-card p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mute">Ratio Score</div>
            <div className={cx('text-4xl font-black tabular-nums', done ? tone.text : 'text-mute')}>
              {done ? sim.score : '··'}
              <span className="text-lg font-bold text-mute">/100</span>
            </div>
          </div>
          <div className="text-right">
            <div className={cx('text-sm font-extrabold tracking-wide', done ? tone.text : 'text-mute')}>
              {done ? sim.verdict.label : 'MOB ASSEMBLING…'}
            </div>
            <div className="mt-0.5 max-w-[16rem] text-xs text-mute">{done ? sim.verdict.line : sim.openingLine}</div>
          </div>
        </div>
        <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={cx('h-full rounded-full transition-all duration-700', tone.bar)}
            style={{ width: `${done ? sim.score : 4}%` }}
          />
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/60" title="Ratio line" />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-mute">
          <span>safe</span>
          <span>ratio line</span>
          <span>cooked</span>
        </div>
      </div>

      <div className="mt-2">
        {sim.replies.slice(0, shown).map((r) => {
          const beats = r.kadaks > sim.postKadaks
          return (
            <div key={r.id} className="flex animate-rise gap-3 border-t border-line/60 px-4 py-3">
              <Avatar handle={r.handle} size={34} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-bold">{r.handle}</span>
                  <SimBadge label={r.archetype} />
                  {beats && (
                    <span className="rounded-full bg-danger px-2 py-0.5 text-[11px] font-extrabold text-white">RATIO 💀</span>
                  )}
                </div>
                <p className="mt-0.5 break-words text-[15px] leading-5">{r.content}</p>
                <div className={cx('mt-1 flex items-center gap-1 text-xs', beats ? 'text-danger' : 'text-mute')}>
                  <Flame size={13} />
                  {formatCount(r.kadaks)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line/60 px-4 py-3">
        <button
          type="button"
          disabled={!done}
          onClick={publish}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-extrabold text-black transition-opacity disabled:opacity-40"
        >
          <Megaphone size={16} />
          Publish This Chaos to Live Feed
        </button>
        <button
          type="button"
          disabled={!done}
          onClick={() => share(draft, top, sim.ratioed)}
          className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold transition-colors hover:bg-white/10 disabled:opacity-40"
        >
          <ImageDown size={16} />
          Share Card
        </button>
        <button
          type="button"
          onClick={onRerun}
          className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold transition-colors hover:bg-white/10"
        >
          <RefreshCw size={16} />
          Again
        </button>
      </div>
    </section>
  )
}
