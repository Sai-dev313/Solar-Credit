# Data model (database)

Source of truth: [`supabase/migrations/`](../../supabase/migrations/). Tests: [`supabase/tests/`](../../supabase/tests/).

**The rule everything follows:** the browser can **read** its own rows but can never **write** a table. Every change
goes through a `security definer` function that takes the user from `auth.uid()` (no function takes a user id as an
argument), validates the input, locks the rows it changes, and records a `chain_events` row for the blockchain.

## Enums

| Type | Values |
|---|---|
| `user_role` | `producer`, `consumer` |
| `listing_status` | `active`, `sold`, `cancelled` |
| `chain_kind` | `MINT`, `LIST`, `TRADE`, `CANCEL`, `BURN` |
| `chain_status` | `pending`, `processing`, `confirmed`, `failed` |

## Tables

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | One row per user (created by a trigger at sign-up) | `id` (= `auth.users.id`), `full_name`, `role`, `role_chosen` (false only for a first Google sign-in that has not picked a role yet), `credits` (balance, 0 to 10,000,000), `cash` (rupees, starts at 5000), `wallet_address` (unique) |
| `energy_logs` | One meter reading per user per day | `user_id`, `log_date`, `generated`, `used`, `exported` (= `max(generated - used, 0)`, computed), `claimed` (credits already made from it; `claimed <= exported`). Unique on `(user_id, log_date)` |
| `listings` | Credits offered for sale | `seller_id`, `credits`, `price_per_credit`, `status`, `buyer_id`, `chain_listing_id`, `closed_at` |
| `trades` | A completed purchase | `listing_id`, `buyer_id`, `seller_id`, `credits`, `total_price` |
| `bill_payments` | Electricity bills paid with credits | `provider`, `consumer_number`, `consumer_name`, `billing_month`, `meter_number`, `units_consumed`, `rate_per_unit`, `bill_amount`, `credits_used`, `credit_savings` (1 credit = Rs 2), `upi_paid` |
| `chain_events` | Outbox of what the blockchain must record | `kind`, `user_id`, `counterparty_id`, `ref_id` (the row it is about), `payload` (json), `status`, `tx_hash`, `block_number`, `attempts`, `locked_at`, `last_error`, `confirmed_at` |

Deleting an auth user deletes their profile, logs, bills and events (`on delete cascade`).

## Security

- **Row Level Security is on for every table.** A user can read only their own rows (a listing is also visible to its
  buyer, a trade and a chain event to both sides). Anonymous callers read nothing.
- **Table privileges:** `select` only, plus `update (full_name)` on `profiles`. No insert, update or delete anywhere else.
- **Function privileges:** nothing is callable by default; exactly the 8 app functions are granted to `authenticated`,
  and `claim_chain_events` to `service_role` only.

## Functions

| Function | Who | What it does |
|---|---|---|
| `log_energy(p_generated, p_used)` | producer | Records the day's reading (a correction cannot go below what was already claimed) |
| `claim_credits()` | producer | Turns unclaimed exported units into credits (1 unit = 1 credit); queues `MINT` |
| `create_listing(p_credits, p_price)` | producer | Price **Rs 1 to Rs 10** per credit; moves credits into the listing; queues `LIST` |
| `cancel_listing(p_listing_id)` | seller | Own active listing; credits return; queues `CANCEL` |
| `buy_listing(p_listing_id)` | any user | Buys a whole listing (not your own); cash to seller, credits to buyer; queues `TRADE` |
| `market_listings()` | signed in | Active listings with the seller's first name (never their id) |
| `choose_role(p_role)` | signed in | One-time `producer` / `consumer` choice for a user whose `role_chosen` is false (Google sign-in); locked afterwards |
| `pay_bill(...)` | any user | 1 credit = Rs 2 off; checks the provider's consumer-number format; queues `BURN` |
| `claim_chain_events(p_limit)` | service role | Hands pending events to exactly one worker (`skip locked`); stuck ones are retried after 2 minutes |

Every function returns `{ "ok": true|false, "message": "...", ... }`.

## Triggers

| Trigger | What it does |
|---|---|
| `on_auth_user_created` (on `auth.users`) | Creates the profile; the role comes from the sign-up choice (anything unknown becomes consumer). A sign-up that carries no role (Google) gets `role_chosen = false`. The Google name is used when there is no `full_name` |
| `profiles_touch` | Keeps `updated_at` current |
| `energy_logs_remove_credits` | Deleting a log (admin only) removes exactly its `claimed` credits from the owner, never below zero |

## Migrations, in order

| File | Purpose |
|---|---|
| `20260101000000_init.sql` | Enums, tables, security, triggers and the functions above |
| `20260102000000_realtime.sql` | Publishes the 6 tables to Supabase Realtime (live updates in the app) |
| `20260103000000_remove_credits_on_log_delete.sql` | The `energy_logs_remove_credits` trigger |
| `20260104000000_validate_consumer_number.sql` | Consumer-number formats per provider, used by `pay_bill` |
| `20260105000000_ensure_profiles.sql` | Safer sign-up trigger, and creates any missing profile |
| `20260106000000_listing_price_limit.sql` | The Rs 1 to Rs 10 price check in `create_listing` |
| `20260107000000_choose_role.sql` | `profiles.role_chosen` and `choose_role()`, so a Google user picks Producer or Consumer once |

Add a change as a **new** migration file with the next timestamp; never edit one that has already been applied.
Apply migrations **in order, once**. Re-running an old one redefines its functions as they were then and can silently undo a newer migration.

## Running the tests

```
cd supabase
npm ci
npm run test:db     # applies every migration to an in-memory Postgres (the realtime one is skipped) and runs the checks
```

`npm run test:e2e` additionally needs a local blockchain node and the deployed contract (see `contracts/`); CI runs only `test:db`.
