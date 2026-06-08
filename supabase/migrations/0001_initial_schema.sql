-- ============================================================================
-- Ward Connect — Initial Schema, Triggers, and Row Level Security
-- Run this in the Supabase SQL Editor (or via the Supabase CLI).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- TABLES
-- ===========================================================================

-- profiles -------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper: is the current user an administrator?
-- SECURITY DEFINER so it can read profiles without tripping RLS recursion.
-- Must be created AFTER the profiles table exists.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

-- programs -------------------------------------------------------------------
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  meeting_date date not null,
  presiding text,
  conducting text,
  opening_hymn text,
  opening_prayer text,
  ward_business text,
  sacrament_hymn text,
  speakers jsonb not null default '[]'::jsonb,
  intermediate_hymn text,
  closing_hymn text,
  closing_prayer text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- announcements --------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  category text not null default 'Ward',
  publish_date date not null default current_date,
  expiration_date date,
  link_url text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- calendar_events ------------------------------------------------------------
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  location text,
  category text not null default 'Other',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- volunteer_opportunities ----------------------------------------------------
create table if not exists public.volunteer_opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  number_needed integer not null default 1 check (number_needed >= 0),
  current_signups integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- volunteer_signups ----------------------------------------------------------
create table if not exists public.volunteer_signups (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.volunteer_opportunities (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_volunteer_signups_opportunity on public.volunteer_signups (opportunity_id);

-- missionary_meals -----------------------------------------------------------
create table if not exists public.missionary_meals (
  id uuid primary key default gen_random_uuid(),
  meal_date date not null,
  meal_time time,
  status text not null default 'open' check (status in ('open', 'filled')),
  assigned_family text,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- missionary_meal_signups ----------------------------------------------------
create table if not exists public.missionary_meal_signups (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.missionary_meals (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_meal_signups_meal on public.missionary_meal_signups (meal_id);

-- building_cleaning_slots ----------------------------------------------------
create table if not exists public.building_cleaning_slots (
  id uuid primary key default gen_random_uuid(),
  cleaning_date date not null,
  cleaning_time time,
  number_needed integer not null default 1 check (number_needed >= 0),
  current_signups integer not null default 0,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- building_cleaning_signups --------------------------------------------------
create table if not exists public.building_cleaning_signups (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.building_cleaning_slots (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_cleaning_signups_slot on public.building_cleaning_signups (slot_id);

-- lesson_schedules -----------------------------------------------------------
create table if not exists public.lesson_schedules (
  id uuid primary key default gen_random_uuid(),
  lesson_date date not null,
  sunday_school_topic text,
  relief_society_lesson text,
  elders_quorum_lesson text,
  youth_lesson text,
  primary_notes text,
  link_url text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- help_requests (PRIVATE) ----------------------------------------------------
create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  request_type text not null,
  message text,
  permission_to_contact boolean not null default false,
  handled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===========================================================================
-- updated_at TRIGGERS
-- ===========================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','programs','announcements','calendar_events',
    'volunteer_opportunities','missionary_meals','building_cleaning_slots',
    'lesson_schedules','help_requests'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ===========================================================================
-- SIGNUP COUNTERS / STATUS TRIGGERS
-- These let the public see remaining spots WITHOUT reading signup PII.
-- ===========================================================================

-- Volunteer counter
create or replace function public.sync_volunteer_count()
returns trigger language plpgsql as $$
begin
  update public.volunteer_opportunities o
  set current_signups = (
    select count(*) from public.volunteer_signups s where s.opportunity_id = o.id
  )
  where o.id = coalesce(new.opportunity_id, old.opportunity_id);
  return null;
end; $$;

drop trigger if exists trg_volunteer_count on public.volunteer_signups;
create trigger trg_volunteer_count
after insert or delete on public.volunteer_signups
for each row execute function public.sync_volunteer_count();

-- Cleaning counter
create or replace function public.sync_cleaning_count()
returns trigger language plpgsql as $$
begin
  update public.building_cleaning_slots sl
  set current_signups = (
    select count(*) from public.building_cleaning_signups s where s.slot_id = sl.id
  )
  where sl.id = coalesce(new.slot_id, old.slot_id);
  return null;
end; $$;

drop trigger if exists trg_cleaning_count on public.building_cleaning_signups;
create trigger trg_cleaning_count
after insert or delete on public.building_cleaning_signups
for each row execute function public.sync_cleaning_count();

-- Meal status (single-host model)
create or replace function public.sync_meal_status()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.missionary_meals
    set status = 'filled',
        assigned_family = coalesce(assigned_family, new.name)
    where id = new.meal_id;
  elsif (tg_op = 'DELETE') then
    update public.missionary_meals m
    set status = case
                   when exists (select 1 from public.missionary_meal_signups s where s.meal_id = m.id) then 'filled'
                   else 'open'
                 end
    where m.id = old.meal_id;
  end if;
  return null;
end; $$;

drop trigger if exists trg_meal_status on public.missionary_meal_signups;
create trigger trg_meal_status
after insert or delete on public.missionary_meal_signups
for each row execute function public.sync_meal_status();

-- ===========================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- New auth users get an 'admin' profile (only ward leaders are given logins;
-- be sure to DISABLE public sign-ups in Supabase Auth settings).
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 'admin')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ===========================================================================
-- ENABLE ROW LEVEL SECURITY
-- ===========================================================================
alter table public.profiles                  enable row level security;
alter table public.programs                   enable row level security;
alter table public.announcements              enable row level security;
alter table public.calendar_events            enable row level security;
alter table public.volunteer_opportunities    enable row level security;
alter table public.volunteer_signups          enable row level security;
alter table public.missionary_meals           enable row level security;
alter table public.missionary_meal_signups    enable row level security;
alter table public.building_cleaning_slots    enable row level security;
alter table public.building_cleaning_signups  enable row level security;
alter table public.lesson_schedules           enable row level security;
alter table public.help_requests              enable row level security;

-- ===========================================================================
-- POLICIES
-- Public (anon + authenticated) read of official content; admins manage all.
-- ===========================================================================

-- profiles: a user sees their own; admins see all; admins manage.
create policy "profiles_select_self_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- programs: public reads PUBLISHED only; admins read/manage everything.
create policy "programs_public_read_published" on public.programs
  for select using (status = 'published');
create policy "programs_admin_read_all" on public.programs
  for select using (public.is_admin());
create policy "programs_admin_write" on public.programs
  for all using (public.is_admin()) with check (public.is_admin());

-- A reusable pattern for "public can read, admins can write" content tables.
-- announcements
create policy "announcements_public_read" on public.announcements for select using (true);
create policy "announcements_admin_write" on public.announcements for all using (public.is_admin()) with check (public.is_admin());

-- calendar_events
create policy "events_public_read" on public.calendar_events for select using (true);
create policy "events_admin_write" on public.calendar_events for all using (public.is_admin()) with check (public.is_admin());

-- lesson_schedules
create policy "lessons_public_read" on public.lesson_schedules for select using (true);
create policy "lessons_admin_write" on public.lesson_schedules for all using (public.is_admin()) with check (public.is_admin());

-- volunteer_opportunities (read includes current_signups counter)
create policy "vol_opps_public_read" on public.volunteer_opportunities for select using (true);
create policy "vol_opps_admin_write" on public.volunteer_opportunities for all using (public.is_admin()) with check (public.is_admin());

-- missionary_meals (read includes status + assigned_family)
create policy "meals_public_read" on public.missionary_meals for select using (true);
create policy "meals_admin_write" on public.missionary_meals for all using (public.is_admin()) with check (public.is_admin());

-- building_cleaning_slots
create policy "cleaning_slots_public_read" on public.building_cleaning_slots for select using (true);
create policy "cleaning_slots_admin_write" on public.building_cleaning_slots for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- SIGNUP TABLES: public may INSERT, but only admins may READ (protects PII).
-- ---------------------------------------------------------------------------
-- volunteer_signups
create policy "vol_signups_public_insert" on public.volunteer_signups for insert with check (true);
create policy "vol_signups_admin_read" on public.volunteer_signups for select using (public.is_admin());
create policy "vol_signups_admin_delete" on public.volunteer_signups for delete using (public.is_admin());

-- missionary_meal_signups
create policy "meal_signups_public_insert" on public.missionary_meal_signups for insert with check (true);
create policy "meal_signups_admin_read" on public.missionary_meal_signups for select using (public.is_admin());
create policy "meal_signups_admin_delete" on public.missionary_meal_signups for delete using (public.is_admin());

-- building_cleaning_signups
create policy "cleaning_signups_public_insert" on public.building_cleaning_signups for insert with check (true);
create policy "cleaning_signups_admin_read" on public.building_cleaning_signups for select using (public.is_admin());
create policy "cleaning_signups_admin_delete" on public.building_cleaning_signups for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- help_requests: PRIVATE. Public may INSERT only. Only admins may READ/manage.
-- ---------------------------------------------------------------------------
create policy "help_public_insert" on public.help_requests for insert with check (true);
create policy "help_admin_read" on public.help_requests for select using (public.is_admin());
create policy "help_admin_update" on public.help_requests for update using (public.is_admin()) with check (public.is_admin());
create policy "help_admin_delete" on public.help_requests for delete using (public.is_admin());

-- ===========================================================================
-- DONE
-- After running: create a leader account under Authentication -> Users, then
-- (optionally) promote it to super_admin:
--   update public.profiles set role = 'super_admin' where email = 'you@example.com';
-- ===========================================================================
