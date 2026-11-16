import { useEffect } from 'react'
import { Flame, Fuel, ImageDown, MessageCircle, Skull } from 'lucide-react'
import { useApp } from '../context'
import { ensurePost } from '../lib/store'
import { cx, formatCount, isRatioed, timeAgo, topReplyOf } from '../lib/utils'
import Avatar from './Avatar'
import { AuthorName, CityBadge, RatioBadge, SimBadge } from './Badges'

function Action({ icon: Icon, label, count, active, activeClass, hoverClass, onClick }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cx(
        'group flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] transition-colors',
        active ? activeClass : 'text-mute',
        hoverClass,
      )}
    >
      <Icon size={17} className={active ? 'fill-current' : ''} />
      {count !== undefined && (
        <span key={count} className="inline-block min-w-[1ch] animate-pop tabular-nums">
          {formatCount(count)}
        </span>
      )}
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}

// The post an "Aag Lagao" is quoting, shown as a compact card inside it.
export function QuoteEmbed({ postId, interactive = true }) {
  const { postById, openThread } = useApp()
  const original = postById(postId)

  // The original may be older than the loaded window: fetch it once.
  useEffect(() => {
    if (!original) ensurePost(postId)
  }, [original, postId])

  if (!original) {
    return <div className="mt-2 rounded-xl border border-line px-3 py-2 text-sm text-mute">Original kalesh is not available.</div>
  }
  return (
    <div
      role={interactive ? 'link' : undefined}
      onClick={(e) => {
        if (!interactive) return
        e.stopPropagation()
        openThread(original.id)
      }}
      className={cx('mt-2 rounded-xl border border-line px-3 py-2', interactive && 'cursor-pointer transition-colors hover:bg-white/5')}
    >
      <div className="flex items-center gap-2">
        <Avatar handle={original.handle} authorId={original.author_id} size={20} />
        <AuthorName handle={original.handle} authorId={original.author_id} small />
        <span className="shrink-0 text-xs text-mute">· {timeAgo(original.created_at)}</span>
      </div>
      <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm text-text/90">{original.content}</p>
    </div>
  )
}

export default function PostCard({ post, replies, detail = false }) {
  const { reactions, toggleKadakPost, openThread, share, quote, quotesOf } = useApp()
  const quotes = quotesOf(post.id)
  // A post can be ratio'd by a reply or by an Aag Lagao that out-Kadaks it.
  const rivals = quotes.length ? [...replies, ...quotes] : replies
  const ratioed = isRatioed(post, rivals)
  const top = topReplyOf(rivals)
  const open = () => !detail && openThread(post.id)
  const focusReply = () => document.getElementById('reply-input')?.focus()

  return (
    <article
      onClick={open}
      onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && open()}
      tabIndex={detail ? -1 : 0}
      className={cx(
        'animate-rise border-b border-line px-4 py-3 transition-colors',
        !detail && 'cursor-pointer hover:bg-white/[0.03]',
        ratioed && 'bg-danger/[0.04]',
      )}
    >
      {post.quote_post_id && (
        <div className="mb-1 flex items-center gap-1.5 pl-[52px] text-xs font-semibold text-orange-400">
          <Fuel size={13} />
          Aag Lagao
        </div>
      )}
      <div className="flex gap-3">
        <Avatar handle={post.handle} authorId={post.author_id} size={detail ? 46 : 40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <AuthorName handle={post.handle} authorId={post.author_id} />
            <span className="text-sm text-mute">· {timeAgo(post.created_at)}</span>
            <CityBadge city={post.city} />
            {post.is_simulated && <SimBadge label="Mob-tested" />}
            {ratioed && <RatioBadge />}
          </div>

          <p className={cx('mt-1 whitespace-pre-wrap break-words text-text', detail ? 'text-xl leading-7' : 'text-[15px] leading-5')}>
            {post.content}
          </p>

          {post.quote_post_id && <QuoteEmbed postId={post.quote_post_id} />}

          {!detail && ratioed && top && (
            <div className="mt-2 rounded-xl border border-danger/40 bg-card px-3 py-2 text-sm">
              <span className="font-semibold text-danger">{top.handle}</span>
              <span className="text-mute"> ratio’d this with {formatCount(top.kadaks)} Kadaks:</span>
              <p className="mt-0.5 line-clamp-2 text-text/90">{top.content}</p>
            </div>
          )}

          <div className="-ml-2 mt-2 flex items-center justify-between">
            <Action
              icon={MessageCircle}
              label="Reply"
              count={replies.length}
              hoverClass="hover:bg-sky/10 hover:text-sky"
              onClick={() => (detail ? focusReply() : openThread(post.id))}
            />
            <Action
              icon={Flame}
              label="Kadak"
              count={post.kadaks}
              active={reactions.kadakPosts.includes(post.id)}
              activeClass="text-gold"
              hoverClass="hover:bg-gold/10 hover:text-gold"
              onClick={() => toggleKadakPost(post.id)}
            />
            <Action
              icon={Fuel}
              label="Aag Lagao"
              count={quotes.length}
              hoverClass="hover:bg-orange-400/10 hover:text-orange-400"
              onClick={() => quote(post)}
            />
            <Action
              icon={Skull}
              label="Ratio"
              hoverClass="hover:bg-danger/10 hover:text-danger"
              onClick={() => openThread(post.id, true)}
            />
            <Action
              icon={ImageDown}
              label="Share Card"
              hoverClass="hover:bg-sky/10 hover:text-sky"
              onClick={() => share(post, top, ratioed)}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
