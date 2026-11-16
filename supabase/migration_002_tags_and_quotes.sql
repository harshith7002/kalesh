-- Kalesh migration 002: per-user tags and Aag Lagao (quote posts).
-- Run once in Supabase > SQL Editor on a database created with schema.sql.
-- Safe to re-run.
--
-- Also required, in the dashboard (not SQL):
--   Authentication > Sign In / Providers > "Allow anonymous sign-ins" = ON
-- Without it the app still works, but posts carry no #tag.

-- Who wrote it. Filled in by the app with the signed-in anonymous user's id.
alter table public.posts   add column if not exists author_id uuid;
alter table public.replies add column if not exists author_id uuid;

-- Aag Lagao: a post that quotes another post.
alter table public.posts   add column if not exists quote_post_id uuid references public.posts(id) on delete set null;

create index if not exists posts_quote_post_id_idx on public.posts (quote_post_id);
create index if not exists posts_author_id_idx     on public.posts (author_id);

-- A row may be untagged (author_id null), or tagged with the caller's own id.
-- Nobody can insert a row carrying someone else's id, so a #tag cannot be faked.
-- The existing column grants only allow updating the counters, so author_id
-- can never be changed after the fact either.
drop policy if exists "anyone can post"  on public.posts;
drop policy if exists "anyone can reply" on public.replies;

create policy "anyone can post" on public.posts for insert
  with check (kadaks <= 5000 and forwards <= 5000 and (author_id is null or author_id = auth.uid()));

create policy "anyone can reply" on public.replies for insert
  with check (kadaks <= 5000 and (author_id is null or author_id = auth.uid()));

-- Make the API notice the new columns immediately.
notify pgrst, 'reload schema';
