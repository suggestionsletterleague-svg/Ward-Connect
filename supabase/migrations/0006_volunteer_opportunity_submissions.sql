-- ============================================================================
-- Ward Connect — Migration 0006
-- Member-submitted volunteer opportunities: public can submit, admins approve.
-- ============================================================================

create table if not exists public.volunteer_opportunity_submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_name text not null,
  submitter_email text,
  submitter_phone text,
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  number_needed integer not null default 1 check (number_needed >= 1),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  opportunity_id uuid references public.volunteer_opportunities (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_volunteer_submissions_status
  on public.volunteer_opportunity_submissions (status);

drop trigger if exists set_updated_at on public.volunteer_opportunity_submissions;
create trigger set_updated_at
before update on public.volunteer_opportunity_submissions
for each row execute function public.set_updated_at();

alter table public.volunteer_opportunity_submissions enable row level security;

create policy "volunteer_submissions_public_insert" on public.volunteer_opportunity_submissions
  for insert with check (status = 'pending');

create policy "volunteer_submissions_admin_read" on public.volunteer_opportunity_submissions
  for select using (public.is_admin());

create policy "volunteer_submissions_admin_update" on public.volunteer_opportunity_submissions
  for update using (public.is_admin()) with check (public.is_admin());

create policy "volunteer_submissions_admin_delete" on public.volunteer_opportunity_submissions
  for delete using (public.is_admin());