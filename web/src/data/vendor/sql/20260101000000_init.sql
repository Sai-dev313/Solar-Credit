-- Solar Credit: clean schema.
-- Principle: the browser can READ its own rows but can never WRITE a table directly.
-- Every state change goes through a SECURITY DEFINER function that derives the
-- caller from auth.uid(); no function takes a user id as an argument.

create type public.user_role as enum ('producer', 'consumer');
create type public.listing_status as enum ('active', 'sold', 'cancelled');
create type public.chain_kind as enum ('MINT', 'LIST', 'TRADE', 'CANCEL', 'BURN');
create type public.chain_status as enum ('pending', 'processing', 'confirmed', 'failed');

-- ---------------------------------------------------------------- tables
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text not null default '',
  role           public.user_role not null default 'consumer',
  credits        numeric(14,2) not null default 0 check (credits >= 0 and credits <= 10000000),
  cash           numeric(14,2) not null default 5000 check (cash >= 0 and cash <= 100000000),
  wallet_address text unique,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.energy_logs (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users (id) on delete cascade,
  log_date  date not null default current_date,
  generated numeric(10,2) not null check (generated >= 0 and generated <= 10000),
  used      numeric(10,2) not null check (used >= 0 and used <= 10000),
  exported  numeric(10,2) generated always as (greatest(generated - used, 0)) stored,
  claimed   numeric(10,2) not null default 0 check (claimed >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, log_date),
  check (claimed <= exported)
);

create table public.listings (
  id               uuid primary key default gen_random_uuid(),
  seller_id        uuid not null references auth.users (id) on delete cascade,
  credits          numeric(14,2) not null check (credits > 0),
  price_per_credit numeric(8,2) not null check (price_per_credit > 0 and price_per_credit <= 1000),
  status           public.listing_status not null default 'active',
  buyer_id         uuid references auth.users (id),
  chain_listing_id bigint,
  created_at       timestamptz not null default now(),
  closed_at        timestamptz
);
create index listings_active_idx on public.listings (created_at desc) where status = 'active';

create table public.trades (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings (id),
  buyer_id    uuid not null references auth.users (id),
  seller_id   uuid not null references auth.users (id),
  credits     numeric(14,2) not null check (credits > 0),
  total_price numeric(14,2) not null check (total_price >= 0),
  created_at  timestamptz not null default now()
);

create table public.bill_payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  provider        text not null,
  consumer_number text not null,
  consumer_name   text not null,
  billing_month   text not null,
  meter_number    text not null,
  units_consumed  numeric(10,2) not null check (units_consumed >= 0),
  rate_per_unit   numeric(8,2) not null default 6,
  bill_amount     numeric(14,2) not null check (bill_amount > 0),
  credits_used    numeric(14,2) not null check (credits_used >= 0),
  credit_savings  numeric(14,2) not null check (credit_savings >= 0),
  upi_paid        numeric(14,2) not null check (upi_paid >= 0),
  created_at      timestamptz not null default now()
);

-- Outbox of things the blockchain must record. Rows are written by the RPCs in the
-- same transaction as the business change; the chain-sync edge function drains it.
create table public.chain_events (
  id              bigint generated always as identity primary key,
  kind            public.chain_kind not null,
  user_id         uuid not null references auth.users (id) on delete cascade,
  counterparty_id uuid references auth.users (id) on delete set null,
  ref_id          uuid not null,              -- listings.id / energy_logs batch / bill_payments.id
  payload         jsonb not null default '{}',
  status          public.chain_status not null default 'pending',
  tx_hash         text,
  block_number    bigint,
  attempts        int not null default 0,
  locked_at       timestamptz,
  last_error      text,
  created_at      timestamptz not null default now(),
  confirmed_at    timestamptz
);
create index chain_events_pending_idx on public.chain_events (id) where status in ('pending', 'processing');
create index chain_events_user_idx on public.chain_events (user_id, id desc);

-- ---------------------------------------------------------------- triggers
create function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- New auth user -> profile. Role comes from signup metadata but is whitelisted.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_role public.user_role;
begin
  v_role := case when new.raw_user_meta_data ->> 'role' = 'producer'
                 then 'producer'::public.user_role else 'consumer'::public.user_role end;
  insert into public.profiles (id, full_name, role)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 80), v_role);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- RLS
alter table public.profiles      enable row level security;
alter table public.energy_logs   enable row level security;
alter table public.listings      enable row level security;
alter table public.trades        enable row level security;
alter table public.bill_payments enable row level security;
alter table public.chain_events  enable row level security;

create policy profiles_read_own on public.profiles for select to authenticated using (id = auth.uid());
create policy energy_read_own   on public.energy_logs for select to authenticated using (user_id = auth.uid());
create policy listings_read_own on public.listings for select to authenticated
  using (seller_id = auth.uid() or buyer_id = auth.uid());
create policy trades_read_own   on public.trades for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy bills_read_own    on public.bill_payments for select to authenticated using (user_id = auth.uid());
create policy chain_read_own    on public.chain_events for select to authenticated
  using (user_id = auth.uid() or counterparty_id = auth.uid());

-- Table privileges: read-only for the browser, plus one writable column.
revoke all on public.profiles, public.energy_logs, public.listings, public.trades,
              public.bill_payments, public.chain_events from anon, authenticated;
grant select on public.profiles, public.energy_logs, public.listings, public.trades,
                public.bill_payments, public.chain_events to authenticated;
grant update (full_name) on public.profiles to authenticated;
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------- RPCs
create function public.log_energy(p_generated numeric, p_used numeric) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_role public.user_role;
  v_exported numeric := greatest(p_generated - p_used, 0);
  v_claimed numeric;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Not authenticated'); end if;
  select role into v_role from profiles where id = v_uid;
  if v_role is distinct from 'producer' then return jsonb_build_object('ok', false, 'message', 'Only producers can log energy'); end if;
  if p_generated is null or p_used is null or p_generated < 0 or p_used < 0 then
    return jsonb_build_object('ok', false, 'message', 'Values cannot be negative'); end if;
  if p_generated > 10000 or p_used > 10000 then
    return jsonb_build_object('ok', false, 'message', 'Maximum 10000 kWh per day'); end if;

  select claimed into v_claimed from energy_logs where user_id = v_uid and log_date = current_date for update;
  if found then
    if v_exported < v_claimed then
      return jsonb_build_object('ok', false, 'message',
        'Exported energy cannot fall below the ' || v_claimed || ' kWh you already converted today');
    end if;
    update energy_logs set generated = p_generated, used = p_used
     where user_id = v_uid and log_date = current_date;
  else
    insert into energy_logs (user_id, generated, used) values (v_uid, p_generated, p_used);
  end if;
  return jsonb_build_object('ok', true, 'message', 'Energy logged', 'exported', v_exported);
end $$;

-- Convert every not-yet-converted exported kWh into credits (idempotent: claims only the difference).
create function public.claim_credits() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_role public.user_role;
  v_amount numeric;
  v_ref uuid := gen_random_uuid();
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Not authenticated'); end if;
  select role into v_role from profiles where id = v_uid for update;
  if v_role is distinct from 'producer' then return jsonb_build_object('ok', false, 'message', 'Only producers earn credits'); end if;

  select coalesce(sum(exported - claimed), 0) into v_amount from energy_logs where user_id = v_uid;
  if v_amount <= 0 then return jsonb_build_object('ok', false, 'message', 'No unclaimed exported energy'); end if;

  update energy_logs set claimed = exported where user_id = v_uid and claimed < exported;
  update profiles set credits = credits + v_amount where id = v_uid;
  insert into chain_events (kind, user_id, ref_id, payload)
    values ('MINT', v_uid, v_ref, jsonb_build_object('credits', v_amount));
  return jsonb_build_object('ok', true, 'message', 'Credits earned', 'credits', v_amount);
end $$;

create function public.create_listing(p_credits numeric, p_price numeric) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_p profiles%rowtype;
  v_id uuid;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Not authenticated'); end if;
  select * into v_p from profiles where id = v_uid for update;
  if v_p.role is distinct from 'producer' then return jsonb_build_object('ok', false, 'message', 'Only producers can sell'); end if;
  if p_credits is null or p_credits <= 0 then return jsonb_build_object('ok', false, 'message', 'Credits must be positive'); end if;
  if p_price is null or p_price <= 0 or p_price > 1000 then return jsonb_build_object('ok', false, 'message', 'Price must be between 0 and 1000'); end if;
  if v_p.credits < p_credits then return jsonb_build_object('ok', false, 'message', 'Insufficient credits'); end if;

  update profiles set credits = credits - p_credits where id = v_uid;
  insert into listings (seller_id, credits, price_per_credit) values (v_uid, round(p_credits, 2), round(p_price, 2))
    returning id into v_id;
  insert into chain_events (kind, user_id, ref_id, payload)
    values ('LIST', v_uid, v_id, jsonb_build_object('credits', round(p_credits, 2), 'price', round(p_price, 2)));
  return jsonb_build_object('ok', true, 'message', 'Listing created', 'listing_id', v_id);
end $$;

create function public.cancel_listing(p_listing_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_l listings%rowtype;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Not authenticated'); end if;
  select * into v_l from listings where id = p_listing_id and seller_id = v_uid and status = 'active' for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'Listing not found'); end if;
  update listings set status = 'cancelled', closed_at = now() where id = v_l.id;
  update profiles set credits = credits + v_l.credits where id = v_uid;
  insert into chain_events (kind, user_id, ref_id, payload)
    values ('CANCEL', v_uid, v_l.id, jsonb_build_object('credits', v_l.credits));
  return jsonb_build_object('ok', true, 'message', 'Listing cancelled, credits returned');
end $$;

create function public.buy_listing(p_listing_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_l listings%rowtype;
  v_b profiles%rowtype;
  v_total numeric;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Not authenticated'); end if;
  select * into v_l from listings where id = p_listing_id and status = 'active' for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'Listing not available'); end if;
  if v_l.seller_id = v_uid then return jsonb_build_object('ok', false, 'message', 'You cannot buy your own listing'); end if;

  v_total := round(v_l.credits * v_l.price_per_credit, 2);
  select * into v_b from profiles where id = v_uid for update;
  if v_b.cash < v_total then return jsonb_build_object('ok', false, 'message', 'Insufficient funds'); end if;

  update profiles set credits = credits + v_l.credits, cash = cash - v_total where id = v_uid;
  update profiles set cash = cash + v_total where id = v_l.seller_id;
  update listings set status = 'sold', buyer_id = v_uid, closed_at = now() where id = v_l.id;
  insert into trades (listing_id, buyer_id, seller_id, credits, total_price)
    values (v_l.id, v_uid, v_l.seller_id, v_l.credits, v_total);
  insert into chain_events (kind, user_id, counterparty_id, ref_id, payload)
    values ('TRADE', v_uid, v_l.seller_id, v_l.id,
            jsonb_build_object('credits', v_l.credits, 'price', v_l.price_per_credit, 'total', v_total));
  return jsonb_build_object('ok', true, 'message', 'Purchase successful', 'total', v_total);
end $$;

-- Marketplace feed: active listings with the seller's first name, never their id.
create function public.market_listings() returns table (
  id uuid, credits numeric, price_per_credit numeric, total numeric,
  seller_name text, is_mine boolean, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select l.id, l.credits, l.price_per_credit, round(l.credits * l.price_per_credit, 2),
         coalesce(nullif(split_part(p.full_name, ' ', 1), ''), 'Producer'),
         l.seller_id = auth.uid(), l.created_at
    from listings l join profiles p on p.id = l.seller_id
   where l.status = 'active' and auth.uid() is not null
   order by l.created_at desc
$$;

-- Redeem credits against a (demo) electricity bill: INR 2 per credit, remainder via simulated UPI.
create function public.pay_bill(
  p_provider text, p_consumer_number text, p_consumer_name text, p_billing_month text,
  p_meter_number text, p_units numeric, p_rate numeric, p_credits_to_use numeric
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_p profiles%rowtype;
  v_bill numeric;
  v_savings numeric;
  v_id uuid;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Not authenticated'); end if;
  if p_units is null or p_units <= 0 or p_rate is null or p_rate <= 0 then
    return jsonb_build_object('ok', false, 'message', 'Invalid bill'); end if;
  if p_credits_to_use is null or p_credits_to_use < 0 then
    return jsonb_build_object('ok', false, 'message', 'Credits cannot be negative'); end if;

  v_bill := round(p_units * p_rate, 2);
  v_savings := round(p_credits_to_use * 2, 2);
  if v_savings > v_bill then return jsonb_build_object('ok', false, 'message', 'Credits exceed the bill amount'); end if;

  select * into v_p from profiles where id = v_uid for update;
  if v_p.credits < p_credits_to_use then return jsonb_build_object('ok', false, 'message', 'Insufficient credits'); end if;

  update profiles set credits = credits - p_credits_to_use where id = v_uid;
  insert into bill_payments (user_id, provider, consumer_number, consumer_name, billing_month, meter_number,
                             units_consumed, rate_per_unit, bill_amount, credits_used, credit_savings, upi_paid)
    values (v_uid, left(p_provider, 40), left(p_consumer_number, 30), left(p_consumer_name, 80),
            left(p_billing_month, 30), left(p_meter_number, 30), p_units, p_rate,
            v_bill, round(p_credits_to_use, 2), v_savings, v_bill - v_savings)
    returning id into v_id;
  if p_credits_to_use > 0 then
    insert into chain_events (kind, user_id, ref_id, payload)
      values ('BURN', v_uid, v_id, jsonb_build_object('credits', round(p_credits_to_use, 2), 'savings', v_savings));
  end if;
  return jsonb_build_object('ok', true, 'message', 'Bill paid', 'receipt_id', v_id,
                            'credits_applied', round(p_credits_to_use, 2), 'savings', v_savings, 'upi_paid', v_bill - v_savings);
end $$;

-- Used only by the chain-sync edge function (service role): atomically take a batch of
-- events so two overlapping runs can never send the same transaction twice. Rows stuck
-- in 'processing' for over 2 minutes (crashed run) become claimable again.
create function public.claim_chain_events(p_limit int default 10) returns setof public.chain_events
language sql security definer set search_path = public as $$
  update chain_events e set status = 'processing', locked_at = now()
   where e.id in (
     select id from chain_events
      where status = 'pending' or (status = 'processing' and locked_at < now() - interval '2 minutes')
      order by id limit greatest(least(p_limit, 50), 1)
      for update skip locked)
  returning e.*
$$;

-- Function privileges: nothing is callable by default; grant exactly what the app uses.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.log_energy(numeric, numeric)      to authenticated;
grant execute on function public.claim_credits()                   to authenticated;
grant execute on function public.create_listing(numeric, numeric) to authenticated;
grant execute on function public.cancel_listing(uuid)              to authenticated;
grant execute on function public.buy_listing(uuid)                 to authenticated;
grant execute on function public.market_listings()                 to authenticated;
grant execute on function public.pay_bill(text, text, text, text, text, numeric, numeric, numeric) to authenticated;
grant execute on function public.claim_chain_events(int) to service_role;
