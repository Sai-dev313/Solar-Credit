-- A listing's price per credit must be a realistic electricity price: Rs 1 to Rs 10 per credit
-- (1 credit = 1 unit; Indian tariffs are roughly Rs 3-10). The website limits the form to the same range;
-- this makes the database enforce it too, so a direct call cannot list at Rs 0.01 or Rs 1000.
-- Only this one check changed compared with the original create_listing. Existing listings are not touched.
create or replace function public.create_listing(p_credits numeric, p_price numeric) returns jsonb
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
  if p_price is null or p_price < 1 or p_price > 10 then return jsonb_build_object('ok', false, 'message', 'Price must be between 1 and 10 rupees per credit'); end if;
  if v_p.credits < p_credits then return jsonb_build_object('ok', false, 'message', 'Insufficient credits'); end if;

  update profiles set credits = credits - p_credits where id = v_uid;
  insert into listings (seller_id, credits, price_per_credit) values (v_uid, round(p_credits, 2), round(p_price, 2))
    returning id into v_id;
  insert into chain_events (kind, user_id, ref_id, payload)
    values ('LIST', v_uid, v_id, jsonb_build_object('credits', round(p_credits, 2), 'price', round(p_price, 2)));
  return jsonb_build_object('ok', true, 'message', 'Listing created', 'listing_id', v_id);
end $$;
