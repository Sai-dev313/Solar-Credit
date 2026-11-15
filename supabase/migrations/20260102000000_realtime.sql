-- Live updates for the frontend: publish row changes of the tables the app shows to Supabase Realtime.
-- Row Level Security still applies, so each user is only told about rows they may read.
-- Safe to run twice: a table that is already published is skipped.
do $$
declare t text;
begin
  foreach t in array array['profiles', 'energy_logs', 'listings', 'trades', 'bill_payments', 'chain_events'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
