import { useEffect, useRef, useState } from 'react'
import { Download, Link2, Loader2, X } from 'lucide-react'
import { useApp } from '../context'
import { downloadCard } from '../lib/shareCard'
import { SITE_HOST, SITE_NAME, SITE_URL, TAGLINE } from '../lib/constants'
import { avatarColor, formatCount, initialOf } from '../lib/utils'

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

const pill = (color, filled) => ({
  display: 'inline-block',
  padding: '8px 20px',
  borderRadius: 999,
  fontSize: 22,
  fontWeight: 800,
  border: `2px solid ${color}`,
  color: filled ? '#FFFFFF' : color,
  background: filled ? color : 'transparent',
  marginLeft: 14,
})

// The 1200x675 card. Inline styles only, so html2canvas renders it the same
// way regardless of viewport, Tailwind breakpoints or the preview's scaling.
function CardFace({ post, topReply, ratioed }) {
  const len = post.content.length
  const size = len < 90 ? 46 : len < 170 ? 37 : 29
  return (
    <div
      style={{
        position: 'relative',
        width: 1200,
        height: 675,
        boxSizing: 'border-box',
        padding: '46px 56px 34px',
        background: '#000000',
        color: '#E7E9EA',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        textAlign: 'left',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1200, height: 10, background: 'linear-gradient(90deg, #F59E0B, #F4212E, #1D9BF0)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
            <path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="#F59E0B" />
          </svg>
          <span style={{ fontSize: 36, fontWeight: 900, color: '#F59E0B', letterSpacing: -0.5 }}>{SITE_NAME}</span>
        </div>
        <div>
          <span style={pill('#F59E0B', false)}>📍 {post.city}</span>
          {ratioed && <span style={pill('#F4212E', true)}>RATIO’D 💀</span>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 28 }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 34,
            background: avatarColor(post.handle),
            color: '#FFFFFF',
            fontSize: 30,
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: '68px',
            flexShrink: 0,
          }}
        >
          {initialOf(post.handle)}
        </div>
        <div style={{ marginLeft: 18 }}>
          <div style={{ fontSize: 30, fontWeight: 800 }}>{post.handle}</div>
          <div style={{ fontSize: 20, color: '#71767B', marginTop: 2 }}>
            {post.is_simulated ? 'Tested against the mob' : 'Live on the India feed'}
          </div>
        </div>
      </div>

      <div style={{ fontSize: size, lineHeight: 1.25, fontWeight: 600, marginTop: 22, wordBreak: 'break-word' }}>{post.content}</div>

      <div style={{ fontSize: 22, color: '#71767B', marginTop: 14 }}>
        <span style={{ color: '#F59E0B', fontWeight: 700 }}>🔥 {formatCount(post.kadaks)} Kadak</span>
        {post.forwards > 0 && <span> · ↪ {formatCount(post.forwards)} Aunty Forwards</span>}
      </div>

      {topReply && (
        <div
          style={{
            marginTop: 20,
            padding: '18px 24px',
            borderRadius: 20,
            background: '#16181C',
            border: `2px solid ${ratioed ? '#F4212E' : '#2F3336'}`,
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: 1.5, color: ratioed ? '#F4212E' : '#1D9BF0' }}>
            {ratioed ? 'THE REPLY THAT RATIO’D IT' : 'TOP REPLY'} · 🔥 {formatCount(topReply.kadaks)}
          </div>
          <div style={{ fontSize: 24, lineHeight: 1.3, marginTop: 6 }}>
            <span style={{ fontWeight: 800 }}>{topReply.handle}</span> <span>{clip(topReply.content, 125)}</span>
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#71767B' }}>
        <span>{TAGLINE}</span>
        <span style={{ color: '#1D9BF0', fontWeight: 700 }}>{SITE_HOST}</span>
      </div>
    </div>
  )
}

function XLogo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export default function ShareModal({ job, onClose }) {
  const { notify } = useApp()
  const { post, topReply, ratioed } = job
  const captureRef = useRef(null)
  const wrapRef = useRef(null)
  const [scale, setScale] = useState(0.4)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 1200))
    ro.observe(wrapRef.current)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      ro.disconnect()
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Unpublished simulations have no thread to link to, so they link home.
  const link = post.id === 'draft' ? SITE_URL : `${SITE_URL}/?post=${post.id}`
  const tweet = `“${clip(post.content, 170)}”\n\n${ratioed ? 'RATIO’D 💀' : 'Live'} on ${SITE_NAME}, ${TAGLINE}`
  const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(link)}`

  const download = async () => {
    setBusy(true)
    try {
      await document.fonts?.ready
      const name = post.handle.replace(/[^A-Za-z0-9_]/g, '')
      await downloadCard(captureRef.current, `kalesh-${name}-${Date.now()}.png`)
      notify('PNG downloaded. Attach it to your tweet 📸')
    } catch (err) {
      notify(`Could not make the card: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      notify('Link copied')
    } catch {
      notify(link)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sky/10 p-3 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div data-modal role="dialog" aria-modal="true" aria-label="Share card" className="w-full max-w-2xl animate-rise rounded-2xl border border-line bg-black p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Share card</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        <p className="mt-0.5 text-sm text-mute">1200 × 675 PNG, sized for the X timeline.</p>

        <div ref={wrapRef} className="mt-3 w-full overflow-hidden rounded-xl border border-line" style={{ height: 675 * scale }}>
          <div style={{ width: 1200, height: 675, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <CardFace post={post} topReply={topReply} ratioed={ratioed} />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={download}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-extrabold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download PNG
          </button>
          <a
            href={intent}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-text px-4 py-2.5 text-sm font-extrabold text-black transition-opacity hover:opacity-90"
          >
            <XLogo />
            Post Directly to X
          </a>
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy link"
            title="Copy link"
            className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/10"
          >
            <Link2 size={16} />
            <span className="sm:hidden">Copy link</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-mute">
          X does not let a link attach an image for you: download the PNG first, then add it to the pre-filled tweet.
        </p>
      </div>

      {/* Unscaled off-screen copy: this is the node html2canvas captures. */}
      <div style={{ position: 'fixed', left: -10000, top: 0, width: 1200, height: 675, pointerEvents: 'none' }} aria-hidden>
        <div ref={captureRef}>
          <CardFace post={post} topReply={topReply} ratioed={ratioed} />
        </div>
      </div>
    </div>
  )
}
