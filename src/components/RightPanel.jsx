import { useMemo } from 'react'
import { useApp } from '../context'
import { CITIES } from '../lib/constants'
import { cx, formatCount, isRatioed, topReplyOf } from '../lib/utils'

function Panel({ title, children }) {
  return (
    <section className="rounded-2xl bg-card p-4">
      <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
      {children}
    </section>
  )
}

// Everything here is derived from the live posts and replies in the store,
// so it moves as realtime events arrive.
export function Panels({ posts, repliesByPost, cityFilter, onCity }) {
  const { openThread } = useApp()

  const heat = useMemo(() => {
    const rows = CITIES.slice(1).map((city) => {
      const own = posts.filter((p) => p.city === city)
      const replies = own.reduce((n, p) => n + (repliesByPost.get(p.id)?.length || 0), 0)
      const kadaks = own.reduce((n, p) => n + p.kadaks, 0)
      // Heat = Kadaks plus arguments: a reply counts for more than a like.
      return { city, posts: own.length, replies, score: kadaks + replies * 5 }
    })
    const max = Math.max(1, ...rows.map((r) => r.score))
    return rows.sort((a, b) => b.score - a.score).map((r) => ({ ...r, pct: Math.round((100 * r.score) / max) }))
  }, [posts, repliesByPost])

  const shame = useMemo(
    () =>
      posts
        .map((post) => ({ post, replies: repliesByPost.get(post.id) || [] }))
        .filter(({ post, replies }) => isRatioed(post, replies))
        .map(({ post, replies }) => ({ post, top: topReplyOf(replies) }))
        .sort((a, b) => b.top.kadaks - b.post.kadaks - (a.top.kadaks - a.post.kadaks))
        .slice(0, 4),
    [posts, repliesByPost],
  )

  return (
    <>
      <Panel title="Adda heat">
        <ul className="space-y-1">
          {heat.map(({ city, posts: count, replies, score, pct }) => (
            <li key={city}>
              <button
                type="button"
                onClick={() => onCity(city)}
                className={cx(
                  'w-full rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5',
                  cityFilter === city && 'bg-white/5',
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-bold">{city}</span>
                  <span key={score} className="animate-pop text-sm font-semibold tabular-nums text-gold">
                    🔥 {formatCount(score)}
                  </span>
                </span>
                <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
                </span>
                <span className="mt-1 block text-xs text-mute">
                  {count} {count === 1 ? 'post' : 'posts'} · {replies} {replies === 1 ? 'reply' : 'replies'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Ratio hall of shame 💀">
        {shame.length === 0 ? (
          <p className="text-sm text-mute">Nobody is ratio’d right now. Suspiciously peaceful.</p>
        ) : (
          <ul className="space-y-3">
            {shame.map(({ post, top }) => (
              <li key={post.id}>
                <button type="button" onClick={() => openThread(post.id)} className="w-full text-left hover:opacity-80">
                  <span className="block text-sm font-bold">{post.handle}</span>
                  <span className="line-clamp-2 block text-sm text-mute">{post.content}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-danger">
                    {formatCount(post.kadaks)} vs {formatCount(top.kadaks)} for {top.handle}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <p className="px-2 text-xs text-mute">
        Heat = Kadaks + 5 per reply. A reply with more Kadaks than its post stamps the post RATIO’D. Generated mob
        replies are always labelled.
      </p>
    </>
  )
}

export default function RightPanel(props) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[350px] shrink-0 flex-col gap-4 overflow-y-auto px-6 py-3 lg:flex">
      <Panels {...props} />
    </aside>
  )
}
