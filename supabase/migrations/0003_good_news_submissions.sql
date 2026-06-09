-- ============================================================================
-- Ward Connect — Migration 0003
-- Member-submitted good news: public can submit, admins approve before posting.
-- ============================================================================

create table if not exists public.good_news_submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_name text not null,
  submitter_email text,
  submitter_phone text,
  title text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  announcement_id uuid references public.announcements (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_good_news_status on public.good_news_submissions (status);

drop trigger if exists set_updated_at on public.good_news_submissions;
create trigger set_updated_at
before update on public.good_news_submissions
for each row execute function public.set_updated_at();

alter table public.good_news_submissions enable row level security;

-- Public may submit pending stories only (never read or update others' submissions).
create policy "good_news_public_insert" on public.good_news_submissions
  for insert with check (status = 'pending');

create policy "good_news_admin_read" on public.good_news_submissions
  for select using (public.is_admin());

create policy "good_news_admin_update" on public.good_news_submissions
  for update using (public.is_admin()) with check (public.is_admin());

create policy "good_news_admin_delete" on public.good_news_submissions
  for delete using (public.is_admin());