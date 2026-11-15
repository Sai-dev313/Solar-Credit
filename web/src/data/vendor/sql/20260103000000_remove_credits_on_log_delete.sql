-- When an energy-log record is deleted (e.g. cleaned up in the Supabase dashboard), take away exactly the
-- credits that record produced (its "claimed" amount) from the owner's balance. Other logs keep their credits.
--
-- Notes:
--  * The balance never goes below zero: if some of those credits were already spent or sold, it stops at 0.
--  * Browser users cannot delete logs (no DELETE grant); this fires for admin / service-role / dashboard deletes.
--  * Credits sitting in an open listing are not in the balance, so they are not touched.
--    Events already sent to the blockchain are not undone.
--  * Deleting a whole user (auth.users cascade) also fires this; the profile is being removed anyway.
create or replace function public.remove_credits_on_log_delete() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.claimed > 0 then
    update public.profiles set credits = greatest(credits - old.claimed, 0) where id = old.user_id;
  end if;
  return null;
end $$;

-- Trigger functions are not meant to be called directly.
revoke execute on function public.remove_credits_on_log_delete() from public, anon, authenticated;

-- Replace the earlier "reset to zero" version if it was ever applied.
drop trigger if exists energy_logs_reset_credits on public.energy_logs;
drop function if exists public.reset_credits_on_log_delete();

drop trigger if exists energy_logs_remove_credits on public.energy_logs;
create trigger energy_logs_remove_credits after delete on public.energy_logs
  for each row execute function public.remove_credits_on_log_delete();
