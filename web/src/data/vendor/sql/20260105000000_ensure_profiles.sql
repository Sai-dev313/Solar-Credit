-- Every sign-in user must have a profile row: the app cannot load without one.
-- 1) The trigger that builds a profile at sign-up is recreated so it can never fail on a duplicate.
-- 2) Any existing user who has no profile (for example one created before the trigger existed) gets one now.
-- Safe to run more than once.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_role public.user_role;
begin
  v_role := case when new.raw_user_meta_data ->> 'role' = 'producer'
                 then 'producer'::public.user_role else 'consumer'::public.user_role end;
  insert into public.profiles (id, full_name, role)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 80), v_role)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, role)
select u.id,
       left(coalesce(u.raw_user_meta_data ->> 'full_name', ''), 80),
       case when u.raw_user_meta_data ->> 'role' = 'producer' then 'producer'::public.user_role else 'consumer'::public.user_role end
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
