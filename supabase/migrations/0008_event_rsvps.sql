-- ============================================================================
-- Ward Connect — Migration 0008
-- Optional event RSVPs with headcount (party size).
-- ============================================================================

alter table public.calendar_events
  add column if not exists rsvp_enabled boolean not null default false,
  add column if not exists rsvp_capacity integer check (rsvp_capacity is null or rsvp_capacity >= 1),
  add column if not exists current_rsvps integer not null default 0;

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.calendar_events (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  party_size integer not null default 1 check (party_size >= 1),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_event_rsvps_event on public.event_rsvps (event_id);

-- Keep public headcount in sync (sum of party sizes).
create or replace function public.sync_event_rsvp_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.calendar_events e
  set current_rsvps = coalesce((
    select sum(r.party_size) from public.event_rsvps r where r.event_id = e.id
  ), 0)
  where e.id = coalesce(new.event_id, old.event_id);
  return null;
end;
$$;

drop trigger if exists trg_event_rsvp_count on public.event_rsvps;
create trigger trg_event_rsvp_count
after insert or delete or update of party_size, event_id on public.event_rsvps
for each row execute function public.sync_event_rsvp_count();

-- Enforce capacity at the database level.
create or replace function public.check_event_rsvp_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enabled  boolean;
  v_capacity integer;
  v_current  integer;
begin
  select rsvp_enabled, rsvp_capacity into v_enabled, v_capacity
  from public.calendar_events
  where id = new.event_id
  for update;

  if v_enabled is distinct from true then
    raise exception 'RSVPs are not open for this event.';
  end if;

  select coalesce(sum(party_size), 0) into v_current
  from public.event_rsvps
  where event_id = new.event_id;

  if v_capacity is not null and (v_current + new.party_size) > v_capacity then
    raise exception 'Sorry — this event is full.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_event_rsvp_capacity on public.event_rsvps;
create trigger trg_event_rsvp_capacity
before insert on public.event_rsvps
for each row execute function public.check_event_rsvp_capacity();

alter table public.event_rsvps enable row level security;

create policy "event_rsvps_public_insert" on public.event_rsvps
  for insert with check (true);

create policy "event_rsvps_admin_read" on public.event_rsvps
  for select using (public.is_admin());

create policy "event_rsvps_admin_delete" on public.event_rsvps
  for delete using (public.is_admin());