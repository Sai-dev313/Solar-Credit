-- Sign in with Google carries no role: Google sends a name and an email, but the sign-up form's Producer / Consumer
-- choice only travels with an email sign-up. Without this, every Google user silently became a consumer forever.
--
-- 1) profiles.role_chosen says whether the person has picked a role yet. Existing users and email sign-ups are
--    already "chosen"; a user who arrives without a role (Google) starts as not chosen, with the safe default (consumer).
-- 2) choose_role(p_role) lets that user pick producer or consumer exactly once. After that the role is locked, like before:
--    the browser still cannot write profiles.role or profiles.role_chosen (only full_name is writable).
-- Safe to run more than once.
alter table public.profiles add column if not exists role_chosen boolean not null default true;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role public.user_role;
  v_chosen boolean;
begin
  v_chosen := coalesce(new.raw_user_meta_data ->> 'role' in ('producer', 'consumer'), false);
  v_role := case when new.raw_user_meta_data ->> 'role' = 'producer'
                 then 'producer'::public.user_role else 'consumer'::public.user_role end;
  insert into public.profiles (id, full_name, role, role_chosen)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 80), v_role, v_chosen)
  on conflict (id) do nothing;
  return new;
end $$;

create or replace function public.choose_role(p_role text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_p profiles%rowtype;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Not authenticated'); end if;
  if p_role is null or p_role not in ('producer', 'consumer') then
    return jsonb_build_object('ok', false, 'message', 'Choose producer or consumer'); end if;
  select * into v_p from profiles where id = v_uid for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'Profile not found'); end if;
  if v_p.role_chosen then return jsonb_build_object('ok', false, 'message', 'Your role is already set'); end if;
  update profiles set role = p_role::public.user_role, role_chosen = true where id = v_uid;
  return jsonb_build_object('ok', true, 'message', 'Role saved', 'role', p_role);
end $$;

revoke execute on function public.choose_role(text) from public, anon;
grant execute on function public.choose_role(text) to authenticated;
