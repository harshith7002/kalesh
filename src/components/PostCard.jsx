import { Flame, Forward, ImageDown, MessageCircle, Skull } from 'lucide-react'
import { useApp } from '../context'
import { cx, formatCount, isRatioed, timeAgo, topReplyOf } from '../lib/utils'
import Avatar from './Avatar'
import { CityBadge, ForwardedBadge, RatioBadge, SimBadge } from './Badges'

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

export default function PostCard({ post, replies, detail = false }) {
  const { reactions, toggleKadakPost, toggleForward, openThread, share } = useApp()
  const ratioed = isRatioed(post, replies)
  const top = topReplyOf(replies)
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
      {post.forwards > 0 && <ForwardedBadge />}
      <div className="flex gap-3">
        <Avatar handle={post.handle} size={detail ? 46 : 40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate font-bold text-text">{post.handle}</span>
            <span className="text-sm text-mute">· {timeAgo(post.created_at)}</span>
            <CityBadge city={post.city} />
            {post.is_simulated && <SimBadge label="Mob-tested" />}
            {ratioed && <RatioBadge />}
          </div>

          <p className={cx('mt-1 whitespace-pre-wrap break-words text-text', detail ? 'text-xl leading-7' : 'text-[15px] leading-5')}>
            {post.content}
          </p>

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
              icon={Forward}
              label="Aunty Forward"
              count={post.forwards}
              active={reactions.forwards.includes(post.id)}
              activeClass="text-emerald-400"
              hoverClass="hover:bg-emerald-400/10 hover:text-emerald-400"
              onClick={() => toggleForward(post.id)}
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
