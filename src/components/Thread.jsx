import { useEffect, useMemo, useState } from 'react'
import { CornerDownRight, Flame, Skull, X } from 'lucide-react'
import { useApp } from '../context'
import { createReply } from '../lib/store'
import { MAX_LEN } from '../lib/constants'
import { cx, formatCount, timeAgo } from '../lib/utils'
import Avatar from './Avatar'
import PostCard from './PostCard'
import { AuthorName, SimBadge } from './Badges'
import { CharCounter } from './Composer'

function ReplyBox({ postId, parentId = null, replyingTo, ratioDefault = false, autoFocus = false, compact = false, onDone }) {
  const { identity, me, notify } = useApp()
  const [text, setText] = useState('')
  const [ratio, setRatio] = useState(ratioDefault)
  const trimmed = text.trim()
  const ok = trimmed.length > 0 && text.length <= MAX_LEN

  const submit = () => {
    if (!ok) return
    createReply({
      post_id: postId,
      parent_reply_id: parentId,
      handle: identity.handle,
      city: identity.city,
      content: trimmed,
      is_ratio: ratio,
    })
    setText('')
    notify(ratio ? 'Ratio attempt launched 💀 Now collect Kadaks.' : 'Reply dropped into the thread.')
    onDone?.()
  }

  return (
    <div className={cx('flex gap-3', compact ? 'mt-2' : 'border-b border-line px-4 py-3')}>
      {!compact && <Avatar handle={identity.handle} authorId={me} size={40} />}
      <div className="min-w-0 flex-1">
        {replyingTo && <div className="mb-1 text-xs text-mute">Replying to <span className="text-sky">{replyingTo}</span></div>}
        <textarea
          id={compact ? undefined : 'reply-input'}
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && submit()}
          rows={2}
          placeholder={ratio ? 'Drop the reply that out-Kadaks the original…' : 'Argue back…'}
          aria-label="Write a reply"
          className={cx(
            'w-full resize-none bg-transparent text-text placeholder:text-mute focus:outline-none',
            compact ? 'rounded-lg border border-line p-2 text-sm focus:border-sky' : 'text-lg',
          )}
        />
        <div className="mt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setRatio((r) => !r)}
            aria-pressed={ratio}
            className={cx(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
              ratio ? 'border-danger bg-danger/15 text-danger' : 'border-line text-mute hover:text-danger',
            )}
          >
            <Skull size={13} />
            Ratio attempt
          </button>
          <div className="flex items-center gap-3">
            <CharCounter length={text.length} />
            <button
              type="button"
              disabled={!ok}
              onClick={submit}
              className="rounded-full bg-sky px-4 py-1.5 text-sm font-bold text-white transition-opacity disabled:opacity-40"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReplyItem({ reply, post, childrenOf, depth }) {
  const { reactions, toggleKadakReply } = useApp()
  const [replying, setReplying] = useState(false)
  const kids = childrenOf.get(reply.id) || []
  const kadaked = reactions.kadakReplies.includes(reply.id)
  const beatsPost = reply.kadaks > post.kadaks

  return (
    // Indent caps at depth 4 so long arguments stay readable on phones.
    <div className={cx(depth > 0 && depth <= 4 && 'ml-4 border-l border-line pl-3 sm:ml-5')}>
      <div className={cx('flex animate-rise gap-3 py-3', depth === 0 && 'px-4')}>
        <Avatar handle={reply.handle} authorId={reply.author_id} size={depth === 0 ? 36 : 30} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <AuthorName handle={reply.handle} authorId={reply.author_id} small />
            <span className="text-xs text-mute">· {timeAgo(reply.created_at)}</span>
            {reply.archetype && <SimBadge label={reply.archetype} />}
            {reply.is_ratio && !beatsPost && (
              <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-mute">ratio attempt</span>
            )}
            {beatsPost && (
              <span className="rounded-full bg-danger px-2 py-0.5 text-[11px] font-extrabold text-white">
                RATIO’D THE OP 💀
              </span>
            )}
          </div>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-5 text-text">{reply.content}</p>
          <div className="-ml-2 mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleKadakReply(reply.id)}
              aria-pressed={kadaked}
              aria-label="Kadak this reply"
              className={cx(
                'flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] transition-colors hover:bg-gold/10 hover:text-gold',
                kadaked ? 'text-gold' : 'text-mute',
              )}
            >
              <Flame size={15} className={kadaked ? 'fill-current' : ''} />
              <span key={reply.kadaks} className="inline-block animate-pop tabular-nums">
                {formatCount(reply.kadaks)}
              </span>
              Kadak
            </button>
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] text-mute transition-colors hover:bg-sky/10 hover:text-sky"
            >
              <CornerDownRight size={15} />
              Reply
            </button>
          </div>
          {replying && (
            <ReplyBox
              postId={post.id}
              parentId={reply.id}
              replyingTo={reply.handle}
              compact
              autoFocus
              onDone={() => setReplying(false)}
            />
          )}
        </div>
      </div>
      {kids.map((kid) => (
        <div key={kid.id} className={cx(depth === 0 && 'px-4')}>
          <ReplyItem reply={kid} post={post} childrenOf={childrenOf} depth={depth + 1} />
        </div>
      ))}
    </div>
  )
}

// Slide-in thread drawer: full screen on phones, right-hand panel on desktop.
export default function ThreadDrawer({ post, replies, ratioMode, live, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      // Let a modal stacked above the drawer take Escape first.
      if (e.key === 'Escape' && !document.querySelector('[data-modal]')) onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const { roots, childrenOf } = useMemo(() => {
    const ids = new Set(replies.map((r) => r.id))
    const map = new Map()
    const top = []
    const sorted = replies.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    for (const r of sorted) {
      // Orphans (parent not loaded) surface at the top level instead of vanishing.
      if (r.parent_reply_id && ids.has(r.parent_reply_id)) {
        if (!map.has(r.parent_reply_id)) map.set(r.parent_reply_id, [])
        map.get(r.parent_reply_id).push(r)
      } else top.push(r)
    }
    top.sort((a, b) => b.kadaks - a.kadaks || new Date(a.created_at) - new Date(b.created_at))
    return { roots: top, childrenOf: map }
  }, [replies])

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-sky/10 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Thread"
        className="absolute inset-y-0 right-0 flex w-full max-w-[600px] animate-slide flex-col border-line bg-black shadow-2xl sm:border-l"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-line px-3 py-2.5">
          <button type="button" onClick={onClose} aria-label="Close thread" className="rounded-full p-2 transition-colors hover:bg-white/10">
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold">Thread</h2>
          <span className="text-sm text-mute">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
          {live && (
            <span className="ml-auto flex items-center gap-1.5 pr-2 text-xs font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              updating live
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain pb-10">
          <PostCard post={post} replies={replies} detail />
          <ReplyBox key={`${post.id}-${ratioMode}`} postId={post.id} ratioDefault={ratioMode} autoFocus={ratioMode} />

          {roots.length === 0 ? (
            <p className="px-6 py-12 text-center text-mute">No replies yet. Somebody has to start the kalesh.</p>
          ) : (
            <div className="divide-y divide-line">
              {roots.map((r) => (
                <ReplyItem key={r.id} reply={r} post={post} childrenOf={childrenOf} depth={0} />
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
