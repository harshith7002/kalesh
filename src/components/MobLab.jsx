import { useState } from 'react'
import { Swords } from 'lucide-react'
import { useApp } from '../context'
import { simulateMob } from '../lib/simulator'
import { MAX_LEN } from '../lib/constants'
import Avatar from './Avatar'
import { CharCounter, CityPill } from './Composer'
import SimulationPanel from './SimulationPanel'

const STARTERS = [
  'Hot take: 30 LPA in Bengaluru is poverty once you count rent',
  'Unpopular opinion: Hyderabadi biryani is overrated',
  'AI will replace every developer by next year',
  'My parents still think Sharma ji’s son is doing better than me',
]

// Secondary tab: rehearse a take against generated replies before posting it.
export default function MobLab({ onPublished }) {
  const { identity, setCity } = useApp()
  const [text, setText] = useState('')
  const [sim, setSim] = useState(null) // { text, result }
  const trimmed = text.trim()
  const ok = trimmed.length > 0 && text.length <= MAX_LEN

  const run = (value) => setSim({ text: value, result: simulateMob(value, identity.city) })

  return (
    <div>
      <div className="sticky top-0 z-20 border-b border-line bg-black/80 px-4 py-3 backdrop-blur">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Swords size={20} className="text-gold" />
          Test Against the Mob
        </h1>
        <p className="mt-0.5 text-sm text-mute">
          A rehearsal room. Replies here are generated in your browser, nothing is posted until you publish.
        </p>
      </div>

      <div className="flex gap-3 border-b border-line px-4 pb-2 pt-3">
        <Avatar handle={identity.handle} size={40} />
        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && ok && run(trimmed)}
            rows={3}
            placeholder="Type the take you are scared to post…"
            aria-label="Draft a take to simulate"
            className="w-full resize-none bg-transparent py-1.5 text-xl leading-7 text-text placeholder:text-mute focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
            <CityPill value={identity.city} onChange={setCity} />
            <div className="flex items-center gap-3">
              <CharCounter length={text.length} />
              <button
                type="button"
                disabled={!ok}
                onClick={() => run(trimmed)}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-4 py-2 text-sm font-extrabold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Swords size={15} />
                Simulate
              </button>
            </div>
          </div>
        </div>
      </div>

      {sim ? (
        <SimulationPanel
          key={sim.result.runId}
          sim={sim.result}
          text={sim.text}
          onClose={() => setSim(null)}
          onRerun={() => run(sim.text)}
          onPublished={() => {
            setSim(null)
            setText('')
            onPublished()
          }}
        />
      ) : (
        <div className="px-4 py-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-mute">Or try one of these</div>
          <div className="mt-2 flex flex-col gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setText(s)
                  run(s)
                }}
                className="rounded-xl border border-line bg-card px-3 py-2.5 text-left text-[15px] transition-colors hover:border-gold/60"
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-mute">
            The mob reacts to keywords: money and CTC, food, traffic, cities, tech and AI, cricket, parents.
          </p>
        </div>
      )}
    </div>
  )
}
