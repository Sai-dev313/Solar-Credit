-- Electricity-bill consumer numbers must match the format each provider prints on its bills.
-- These are the same rules the app's "Pay Electricity Bill" form enforces; the database re-checks them so a
-- call that skips the form cannot store a wrongly formatted number.
--
--   Provider (name starts with)  Accepted consumer number
--   MSEDCL                       12 digits
--   Tata Power                   9 digits (Mumbai) or 11 digits (Delhi CA number)
--   BSES Rajdhani                9 digits (CA number)
--   BESCOM                       10 digits (older rural connections: 7)
--   TNEB                         12 digits
--   WBSEDCL                      9 digits
--   UPPCL                        10 digits
--   PSPCL                        10 digits (usually 300...) or 8 letters/digits for older accounts
--
-- To add or change a provider, edit the values list below and ship it as a new migration.
create or replace function public.consumer_number_rule(p_provider text, out pattern text, out hint text)
language sql immutable set search_path = public as $$
  select v.pattern, v.hint
    from (values
      ('msedcl',  '^[0-9]{12}$',                    '12 digits'),
      ('tata',    '^([0-9]{9}|[0-9]{11})$',         '9 or 11 digits'),
      ('bses',    '^[0-9]{9}$',                     '9 digits'),
      ('bescom',  '^([0-9]{10}|[0-9]{7})$',         '10 digits (7 for older rural connections)'),
      ('tneb',    '^[0-9]{12}$',                    '12 digits'),
      ('wbsedcl', '^[0-9]{9}$',                     '9 digits'),
      ('uppcl',   '^[0-9]{10}$',                    '10 digits'),
      ('pspcl',   '^([0-9]{10}|[A-Z0-9]{8})$',      '10 digits (or 8 letters/digits for older accounts)')
    ) as v(code, pattern, hint)
   where lower(btrim(p_provider)) like v.code || '%'
   limit 1
$$;
revoke execute on function public.consumer_number_rule(text) from public, anon, authenticated;

-- pay_bill: unchanged except for the provider / consumer-number check right after the basic input checks.
create or replace function public.pay_bill(
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
  v_pattern text;
  v_hint text;
  v_number text := upper(btrim(coalesce(p_consumer_number, '')));
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Not authenticated'); end if;
  if p_units is null or p_units <= 0 or p_rate is null or p_rate <= 0 then
    return jsonb_build_object('ok', false, 'message', 'Invalid bill'); end if;
  if p_credits_to_use is null or p_credits_to_use < 0 then
    return jsonb_build_object('ok', false, 'message', 'Credits cannot be negative'); end if;

  select r.pattern, r.hint into v_pattern, v_hint from public.consumer_number_rule(p_provider) r;
  if v_pattern is null then
    return jsonb_build_object('ok', false, 'message', 'Unsupported electricity provider'); end if;
  if v_number !~ v_pattern then
    return jsonb_build_object('ok', false, 'message', 'Consumer number for ' || left(p_provider, 40) || ' must be ' || v_hint); end if;

  v_bill := round(p_units * p_rate, 2);
  v_savings := round(p_credits_to_use * 2, 2);
  if v_savings > v_bill then return jsonb_build_object('ok', false, 'message', 'Credits exceed the bill amount'); end if;

  select * into v_p from profiles where id = v_uid for update;
  if v_p.credits < p_credits_to_use then return jsonb_build_object('ok', false, 'message', 'Insufficient credits'); end if;

  update profiles set credits = credits - p_credits_to_use where id = v_uid;
  insert into bill_payments (user_id, provider, consumer_number, consumer_name, billing_month, meter_number,
                             units_consumed, rate_per_unit, bill_amount, credits_used, credit_savings, upi_paid)
    values (v_uid, left(p_provider, 40), v_number, left(p_consumer_name, 80),
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
