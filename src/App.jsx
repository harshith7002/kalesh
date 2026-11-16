import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { X, Zap } from 'lucide-react'
import { AppContext } from './context'
import { bumpPost, bumpReply, clearError, ensurePost, init, seedRemote, useStore } from './lib/store'
import { loadIdentity, loadReactions, saveIdentity, saveReactions } from './lib/identity'
import Avatar from './components/Avatar'
import BottomNav from './components/BottomNav'
import CityTabs from './components/CityTabs'
import Composer from './components/Composer'
import IdentityModal from './components/IdentityModal'
import MobLab from './components/MobLab'
import PostCard from './components/PostCard'
import RightPanel, { Panels } from './components/RightPanel'
import ShareModal from './components/ShareModal'
import Sidebar from './components/Sidebar'
import ThreadDrawer from './components/Thread'

const EMPTY = []

// Green pulsing dot when realtime is connected; amber pill without Supabase keys.
function StatusPill({ mode, live }) {
  if (mode !== 'supabase') {
    return (
      <span className="shrink-0 whitespace-nowrap rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold" title="Supabase keys are not set: posts stay in this browser">
        Local Demo Mode
      </span>
    )
  }
  if (!live) {
    return <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-bold text-mute">Connecting…</span>
  }
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wide text-emerald-400" title="Realtime connected">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      LIVE
    </span>
  )
}

export default function App() {
  const store = useStore()
  const [identity, setIdentity] = useState(loadIdentity)
  const [reactions, setReactions] = useState(loadReactions)
  const [view, setView] = useState('feed') // 'feed' | 'mob' | 'heat' (heat is the phone-only tab)
  const [cityFilter, setCityFilter] = useState('All India')
  const [thread, setThread] = useState(null) // { id, ratioMode }
  const [identityOpen, setIdentityOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [shareJob, setShareJob] = useState(null)
  const deepLinked = useRef(false)

  useEffect(() => {
    init()
  }, [])

  // Open ?post=<id> links (the ones the share card and X intent point at).
  useEffect(() => {
    if (store.loading || deepLinked.current) return
    deepLinked.current = true
    const id = new URLSearchParams(window.location.search).get('post')
    if (id) ensurePost(id).finally(() => setThread({ id, ratioMode: false }))
  }, [store.loading])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const notify = useCallback((message) => setToast({ message, id: Date.now() }), [])

  const updateIdentity = (next) => {
    setIdentity(next)
    saveIdentity(next)
  }

  // Flip a local reaction and return the counter delta to apply.
  const toggle = (key, id) => {
    const has = reactions[key].includes(id)
    const next = { ...reactions, [key]: has ? reactions[key].filter((x) => x !== id) : [...reactions[key], id] }
    setReactions(next)
    saveReactions(next)
    return has ? -1 : 1
  }

  const closeThread = useCallback(() => {
    setThread(null)
    window.history.replaceState(null, '', window.location.pathname)
  }, [])

  const changeView = (next) => {
    setView(next)
    window.scrollTo(0, 0)
  }

  const ctx = {
    identity,
    reactions,
    view,
    notify,
    setView: changeView,
    setCity: (city) => updateIdentity({ ...identity, city }),
    toggleKadakPost: (id) => bumpPost(id, 'kadaks', toggle('kadakPosts', id)),
    toggleKadakReply: (id) => bumpReply(id, toggle('kadakReplies', id)),
    toggleForward: (id) => {
      const delta = toggle('forwards', id)
      bumpPost(id, 'forwards', delta)
      if (delta > 0) notify('Forwarded to 14 family groups 🙏')
    },
    openThread: (id, ratioMode = false) => {
      setThread({ id, ratioMode })
      window.history.replaceState(null, '', `?post=${id}`)
    },
    share: (post, topReply, ratioed) => setShareJob({ post, topReply, ratioed }),
    openIdentity: () => setIdentityOpen(true),
    focusComposer: () => {
      setView('feed')
      setTimeout(() => {
        window.scrollTo(0, 0)
        document.getElementById('composer-input')?.focus()
      }, 0)
    },
  }

  const repliesByPost = useMemo(() => {
    const map = new Map()
    for (const r of store.replies) {
      if (!map.has(r.post_id)) map.set(r.post_id, [])
      map.get(r.post_id).push(r)
    }
    return map
  }, [store.replies])

  const feed = useMemo(
    () =>
      store.posts
        .filter((p) => cityFilter === 'All India' || p.city === cityFilter)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [store.posts, cityFilter],
  )

  const threadPost = thread && store.posts.find((p) => p.id === thread.id)
  const live = store.mode === 'supabase' && store.live

  const pickCity = (city) => {
    setCityFilter(city)
    changeView('feed')
  }
  const panelProps = { posts: store.posts, repliesByPost, cityFilter, onCity: pickCity }

  return (
    <AppContext.Provider value={ctx}>
      <div className="mx-auto flex min-h-screen max-w-[1265px] justify-center">
        <Sidebar />

        <main className="min-h-screen w-full min-w-0 max-w-[600px] border-line pb-20 sm:border-x sm:pb-0">
          {store.error && (
            <div className="flex items-start gap-2 border-b border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger" role="alert">
              <span className="flex-1">{store.error}</span>
              <button type="button" onClick={clearError} aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}

          {view === 'mob' && <MobLab onPublished={() => changeView('feed')} />}

          {view === 'heat' && (
            <div>
              <div className="sticky top-0 z-20 border-b border-line bg-black/80 px-4 py-3 backdrop-blur">
                <h1 className="text-xl font-bold">Heat &amp; Hall of Shame</h1>
              </div>
              <div className="flex flex-col gap-4 p-4">
                <Panels {...panelProps} />
              </div>
            </div>
          )}

          {view === 'feed' && (
            <>
              <div className="sticky top-0 z-20 border-b border-line bg-black/80 backdrop-blur">
                <div className="flex items-center justify-between gap-2 px-4 pt-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Zap size={22} className="shrink-0 fill-gold text-gold sm:hidden" />
                    <h1 className="whitespace-nowrap text-lg font-bold sm:text-xl">Live India Feed</h1>
                    <StatusPill mode={store.mode} live={store.live} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdentityOpen(true)}
                    className="flex min-w-0 shrink items-center gap-2 rounded-full border border-line p-1 text-sm font-semibold transition-colors hover:bg-white/10 sm:max-w-[45%] sm:pr-3"
                    title="Edit your burner identity"
                    aria-label={`Edit identity, currently ${identity.handle}`}
                  >
                    <Avatar handle={identity.handle} size={24} />
                    <span className="hidden truncate sm:inline">{identity.handle}</span>
                  </button>
                </div>
                <CityTabs value={cityFilter} onChange={setCityFilter} />
              </div>

              <Composer />

              {store.loading ? (
                <p className="px-6 py-16 text-center text-mute">Loading the drama…</p>
              ) : feed.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-lg font-bold">
                    {cityFilter === 'All India' ? 'No kalesh yet.' : `No kalesh in ${cityFilter} yet.`}
                  </p>
                  <p className="mt-1 text-mute">Be the first one to say something regrettable.</p>
                  {store.mode === 'supabase' && store.posts.length === 0 && (
                    <button
                      type="button"
                      onClick={seedRemote}
                      className="mt-4 rounded-full border border-gold px-4 py-2 text-sm font-bold text-gold hover:bg-gold/10"
                    >
                      Add 15 starter posts
                    </button>
                  )}
                </div>
              ) : (
                feed.map((post) => <PostCard key={post.id} post={post} replies={repliesByPost.get(post.id) || EMPTY} />)
              )}
            </>
          )}
        </main>

        <RightPanel {...panelProps} />
      </div>

      <BottomNav view={view} onView={changeView} onIdentity={() => setIdentityOpen(true)} />

      {threadPost && (
        <ThreadDrawer
          post={threadPost}
          replies={repliesByPost.get(threadPost.id) || EMPTY}
          ratioMode={thread.ratioMode}
          live={live}
          onClose={closeThread}
        />
      )}

      {identityOpen && (
        <IdentityModal
          identity={identity}
          onClose={() => setIdentityOpen(false)}
          onSave={(next) => {
            updateIdentity(next)
            setIdentityOpen(false)
            notify(`You are now ${next.handle} from ${next.city}`)
          }}
        />
      )}

      {shareJob && <ShareModal job={shareJob} onClose={() => setShareJob(null)} />}

      {toast && (
        <div
          key={toast.id}
          role="status"
          className="fixed bottom-20 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 animate-rise truncate rounded-full bg-sky px-5 py-2.5 text-sm font-semibold text-white shadow-lg sm:bottom-6"
        >
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  )
}
