-- ============================================================================
-- Ward Connect — Migration 0005
-- Fix signup counter/status triggers so they can update parent rows after
-- anonymous signups. Without SECURITY DEFINER, missionary meals stay "open"
-- after someone signs up and the date keeps appearing for others.
-- ============================================================================

create or replace function public.sync_volunteer_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.volunteer_opportunities o
  set current_signups = (
    select count(*) from public.volunteer_signups s where s.opportunity_id = o.id
  )
  where o.id = coalesce(new.opportunity_id, old.opportunity_id);
  return null;
end;
$$;

create or replace function public.sync_cleaning_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.building_cleaning_slots sl
  set current_signups = (
    select count(*) from public.building_cleaning_signups s where s.slot_id = sl.id
  )
  where sl.id = coalesce(new.slot_id, old.slot_id);
  return null;
end;
$$;

create or replace function public.sync_meal_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
                 end,
        assigned_family = case
                            when exists (select 1 from public.missionary_meal_signups s where s.meal_id = m.id) then m.assigned_family
                            else null
                          end
    where m.id = old.meal_id;
  end if;
  return null;
end;
$$;

-- Backfill any meals that already have signups but were left "open".
update public.missionary_meals m
set status = 'filled',
    assigned_family = coalesce(
      m.assigned_family,
      (select s.name from public.missionary_meal_signups s where s.meal_id = m.id limit 1)
    )
where m.status = 'open'
  and exists (select 1 from public.missionary_meal_signups s where s.meal_id = m.id);