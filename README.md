# Kalesh ⚡

**India's Live Drama & Ratio Feed.** A zero-login, real-time, city-tagged microblogging app.

- **No login wall.** A burner handle and city tag are auto-assigned and stored in `localStorage`.
- **Live India Feed.** City tabs, Kadak (like), Aunty Forward (repost), threaded replies in a slide-in drawer, and an automatic `RATIO'D 💀` badge when any reply out-Kadaks its post.
- **Realtime.** With Supabase keys set, posts, replies and counters arrive over `postgres_changes` without a refresh. A green pulsing dot next to `LIVE` shows the socket is connected.
- **Adda heat and Ratio hall of shame** are computed from the live posts and replies.
- **Share Card.** Preview modal with Download PNG (1200x675) and a pre-filled Post to X button. Shared links open the thread (`/?post=<id>`).
- **Test Against the Mob.** A secondary tab that rehearses a take against generated replies before you post it.
- **Local Demo Mode.** Without Supabase keys the app runs on `localStorage` with 15 seeded posts and shows an amber pill.

## Run locally

```bash
npm install
npm run dev
```

## Go live with Supabase

1. Create a Supabase project. Open **SQL Editor**, paste all of `supabase/schema.sql`, run it.
2. Copy `.env.example` to `.env`, fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings > API).
3. Restart `npm run dev`. The header pill turns into a green `LIVE` dot. With an empty database the feed offers an "Add 15 starter posts" button.

To see realtime work, open the site in two browsers and post in one.

## Tags and Aag Lagao

- **#tags.** Handles are free text, so two people can pick the same one. Every post and reply also carries a short tag (for example `#7F3A`) derived from the writer's anonymous Supabase user id. The database only accepts a row tagged with the caller's own id, so a tag cannot be faked. Turn on **Authentication > Sign In / Providers > Allow anonymous sign-ins** in Supabase; without it the app works but posts are untagged.
- **Aag Lagao.** A quote post: your line on top, the original embedded underneath. A quote that out-Kadaks the original ratios it.
- **Existing database?** Run `supabase/migration_002_tags_and_quotes.sql` once. New projects only need `schema.sql`.
- Add `?demo` to the URL to force Local Demo Mode even when keys are set.

## Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_SITE_URL` (your public URL) under Project > Settings > Environment Variables, then redeploy.

## Structure

```
src/
  App.jsx                 views (feed / mob / heat), identity, reactions, deep links
  context.js              app context
  lib/
    store.js              Supabase realtime or localStorage, optimistic actions, resync
    supabase.js           client, enabled only when env keys exist
    seed.js               15 starter posts with threads
    simulator.js          keyword-driven mob reply generator and ratio score
    identity.js           burner handle, city tag, local reactions
    shareCard.js          html2canvas export (lazy-loaded)
    constants.js, utils.js
  components/
    Composer, PostCard, Thread (drawer), ShareModal, MobLab, SimulationPanel,
    Sidebar, BottomNav, RightPanel, CityTabs, IdentityModal, Avatar, Badges
supabase/schema.sql       tables, RLS, counter functions, realtime publication
```

## Before real traffic

- **Abuse.** There are no accounts, so nothing limits how often one person posts or bumps a counter. Add a rate limit (Edge Function or trigger) and a report/hide flow before a public launch.
- **Realtime capacity** is set by your Supabase plan's concurrent-connection and messages-per-second quotas, not by this code. Check them against the audience you expect.
- **Feed window.** The client loads the latest 200 posts and 2000 replies and keeps them in memory. Add pagination when the tables grow well past that.
