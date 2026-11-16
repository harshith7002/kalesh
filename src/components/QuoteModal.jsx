import { useEffect, useState } from 'react'
import { Fuel, X } from 'lucide-react'
import { useApp } from '../context'
import { createPost } from '../lib/store'
import { MAX_LEN } from '../lib/constants'
import Avatar from './Avatar'
import { CharCounter, CityPill } from './Composer'
import { QuoteEmbed } from './PostCard'

// "Aag Lagao": repost someone's take with your own line on top. It lands in
// the feed as a new post with the original embedded underneath.
export default function QuoteModal({ post, onClose }) {
  const { identity, me, setCity, notify } = useApp()
  const [text, setText] = useState('')
  const trimmed = text.trim()
  const ok = trimmed.length > 0 && text.length <= MAX_LEN

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = () => {
    if (!ok) return
    createPost({ handle: identity.handle, city: identity.city, content: trimmed, quote_post_id: post.id })
    notify(`Aag laga di 🔥 Posted to ${identity.city}`)
    onClose(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-sky/10 p-3 pt-[8vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div data-modal role="dialog" aria-modal="true" aria-label="Aag Lagao" className="w-full max-w-xl animate-rise rounded-2xl border border-line bg-black p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <Fuel size={20} className="text-orange-400" />
            Aag Lagao
          </h2>
          <button type="button" onClick={() => onClose()} aria-label="Close" className="rounded-full p-1.5 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        <p className="mt-0.5 text-sm text-mute">Add your line. Out-Kadak the original and it gets ratio’d.</p>

        <div className="mt-3 flex gap-3">
          <Avatar handle={identity.handle} authorId={me} size={40} />
          <div className="min-w-0 flex-1">
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && submit()}
              rows={3}
              placeholder="Add fuel to this…"
              aria-label="Your comment on the quoted post"
              className="w-full resize-none bg-transparent py-1 text-lg leading-6 text-text placeholder:text-mute focus:outline-none"
            />
            <QuoteEmbed postId={post.id} interactive={false} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
          <CityPill value={identity.city} onChange={setCity} />
          <div className="flex items-center gap-3">
            <CharCounter length={text.length} />
            <button
              type="button"
              disabled={!ok}
              onClick={submit}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-orange-500 px-4 py-2 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Fuel size={15} />
              Aag Lagao
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
