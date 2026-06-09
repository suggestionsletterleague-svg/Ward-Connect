-- ============================================================================
-- Ward Connect — Migration 0004
-- Fix capacity-check triggers so they can read parent rows during anon signups.
-- Without SECURITY DEFINER, RLS blocks the trigger's FOR UPDATE lookup and
-- members see "This dinner date is no longer available." even when it is open.
-- ============================================================================

create or replace function public.check_volunteer_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_needed  integer;
  v_current integer;
begin
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

create or replace function public.check_cleaning_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
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

create or replace function public.check_meal_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_taken  boolean;
begin
  select status into v_status
  from public.missionary_meals
  where id = new.meal_id
  for update;

  if v_status is null then
    raise exception 'This dinner date is no longer available.';
  end if;

  if v_status = 'filled' then
    raise exception 'Sorry — this dinner date has already been taken.'
      using errcode = 'check_violation';
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