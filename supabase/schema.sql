-- Kalesh: one-paste Supabase setup.
-- Supabase Dashboard > SQL Editor > New query > paste everything > Run.

-- 1. Tables ---------------------------------------------------------------

create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  handle        text not null check (char_length(handle) between 2 and 24),
  city          text not null default 'All India',
  content       text not null check (char_length(content) between 1 and 500),
  kadaks        integer not null default 0 check (kadaks between 0 and 1000000),
  forwards      integer not null default 0 check (forwards between 0 and 1000000),
  is_simulated  boolean not null default false,
  ratio_score   integer,
  created_at    timestamptz not null default now()
);

create table if not exists public.replies (
  id               uuid primary key default gen_random_uuid(),
  post_id          uuid not null references public.posts(id) on delete cascade,
  parent_reply_id  uuid references public.replies(id) on delete cascade,
  handle           text not null check (char_length(handle) between 2 and 24),
  city             text not null default 'All India',
  content          text not null check (char_length(content) between 1 and 500),
  kadaks           integer not null default 0 check (kadaks between 0 and 1000000),
  is_ratio         boolean not null default false,
  archetype        text,
  created_at       timestamptz not null default now()
);

create index if not exists posts_created_at_idx   on public.posts (created_at desc);
create index if not exists posts_city_idx         on public.posts (city);
create index if not exists replies_post_id_idx    on public.replies (post_id);
create index if not exists replies_created_at_idx on public.replies (created_at desc);

-- 2. Row Level Security: anonymous public read / insert / update ----------

alter table public.posts   enable row level security;
alter table public.replies enable row level security;

drop policy if exists "posts are public"            on public.posts;
drop policy if exists "anyone can post"             on public.posts;
drop policy if exists "anyone can react to posts"   on public.posts;
drop policy if exists "replies are public"          on public.replies;
drop policy if exists "anyone can reply"            on public.replies;
drop policy if exists "anyone can react to replies" on public.replies;

create policy "posts are public"            on public.posts   for select using (true);
create policy "anyone can post"             on public.posts   for insert with check (kadaks <= 5000 and forwards <= 5000);
create policy "anyone can react to posts"   on public.posts   for update using (true) with check (true);

create policy "replies are public"          on public.replies for select using (true);
create policy "anyone can reply"            on public.replies for insert with check (kadaks <= 5000);
create policy "anyone can react to replies" on public.replies for update using (true) with check (true);

-- The update policies above are open to everyone, so column privileges limit
-- what an update can touch: only the reaction counters. Nobody can rewrite
-- someone else's handle, city or text, and nobody can delete.
revoke update on public.posts, public.replies from anon, authenticated;
grant  update (kadaks, forwards) on public.posts   to anon, authenticated;
grant  update (kadaks)           on public.replies to anon, authenticated;

-- 3. Atomic counters ------------------------------------------------------
-- The app calls these instead of read-then-write updates, so two people
-- clicking Kadak at the same moment both count.

create or replace function public.bump_post(pid uuid, field text, delta integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if field = 'kadaks' then
    update posts set kadaks = greatest(0, kadaks + sign(delta)::int) where id = pid;
  elsif field = 'forwards' then
    update posts set forwards = greatest(0, forwards + sign(delta)::int) where id = pid;
  end if;
end $$;

create or replace function public.bump_reply(rid uuid, delta integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  update replies set kadaks = greatest(0, kadaks + sign(delta)::int) where id = rid;
end $$;

grant execute on function public.bump_post(uuid, text, integer) to anon, authenticated;
grant execute on function public.bump_reply(uuid, integer)      to anon, authenticated;

-- 4. Realtime -------------------------------------------------------------
-- Kept last: if you re-run this script, this line reports "already member of
-- publication". That is harmless, everything above has already applied.

ALTER PUBLICATION supabase_realtime ADD TABLE posts, replies;
