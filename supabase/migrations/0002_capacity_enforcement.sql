-- ============================================================================
-- Ward Connect — Migration 0002
-- Enforce signup capacity at the DATABASE level (closes the race condition where
-- two people could claim the last spot, or a meal could get a second host).
--
-- Each check locks the parent row (FOR UPDATE) so concurrent inserts on the same
-- slot are serialized. Run this in the Supabase SQL Editor after 0001.
-- ============================================================================

-- ---- Volunteer opportunities -----------------------------------------------
create or replace function public.check_volunteer_capacity()
returns trigger
language plpgsql
as $$
declare
  v_needed  integer;
  v_current integer;
begin
  -- Lock the parent row so concurrent signups queue behind each other.
  select number_needed into v_needed
  from public.volunteer_opportunities
  where id = new.opportunity_id
  for update;

  if v_needed is null then
    raise exception 'This volunteer opportunity is no longer available.';
  end if;

  select count(*) into v_current
  from public.volunteer_signups
  where opportunity_id = new.opportunity_id;

  if v_current >= v_needed then
    raise exception 'Sorry — this opportunity is already full.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_volunteer_capacity on public.volunteer_signups;
create trigger trg_volunteer_capacity
before insert on public.volunteer_signups
for each row execute function public.check_volunteer_capacity();

-- ---- Building cleaning slots ------------------------------------------------
create or replace function public.check_cleaning_capacity()
returns trigger
language plpgsql
as $$
declare
  v_needed  integer;
  v_current integer;
begin
  select number_needed into v_needed
  from public.building_cleaning_slots
  where id = new.slot_id
  for update;

  if v_needed is null then
    raise exception 'This cleaning assignment is no longer available.';
  end if;

  select count(*) into v_current
  from public.building_cleaning_signups
  where slot_id = new.slot_id;

  if v_current >= v_needed then
    raise exception 'Sorry — this cleaning assignment is already full.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_cleaning_capacity on public.building_cleaning_signups;
create trigger trg_cleaning_capacity
before insert on public.building_cleaning_signups
for each row execute function public.check_cleaning_capacity();

-- ---- Missionary meals (single host) ----------------------------------------
create or replace function public.check_meal_capacity()
returns trigger
language plpgsql
as $$
declare
  v_status   text;
  v_taken    boolean;
begin
  select status into v_status
  from public.missionary_meals
  where id = new.meal_id
  for update;

  if v_status is null then
    raise exception 'This dinner date is no longer available.';
  end if;

  select exists (
    select 1 from public.missionary_meal_signups where meal_id = new.meal_id
  ) into v_taken;

  if v_taken then
    raise exception 'Sorry — this dinner date has already been taken.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_meal_capacity on public.missionary_meal_signups;
create trigger trg_meal_capacity
before insert on public.missionary_meal_signups
for each row execute function public.check_meal_capacity();

-- ============================================================================
-- DONE. The friendly exception messages above are returned straight to the app,
-- so a member who just missed the last spot sees a clear, kind message.
-- ============================================================================
