# What the frontend expects from the backend and the blockchain

This is the agreement between the three parts of SolarCredit. The website (`web/`) is built against exactly
what is written here. If a name, column or shape changes, change it here too and tell the frontend owner.

The real database is in [`supabase/migrations/`](../../supabase/migrations/) and is described in
[`docs/database/DATA_MODEL.md`](../database/DATA_MODEL.md). Its tests (`cd supabase && npm run test:db`) check
the rules below. The offline demo runs copies of the same SQL (`web/src/data/vendor/sql/`); when a migration
changes, copy the new version there too.

The website talks to the backend through **one file**: `web/src/data/supabase.ts` (it implements the
`DataApi` interface in `web/src/data/types.ts`). If something here differs from your implementation, that is
the only file the frontend needs to change.

## 1. Environment variables (`web/.env`, see `web/.env.example`)

| Variable | Owner | Meaning |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Backend | Project URL and the **publishable** key. Never put a secret/service key in `web/`. |
| `VITE_RPC_URL`, `VITE_CHAIN_NAME`, `VITE_EXPLORER_URL` | Blockchain | Public RPC, network name and block explorer base URL. |
| `VITE_CONTRACT_ADDRESS` | Blockchain | Deployed `SolarCredit` contract address. |
| `VITE_DEMO=1` | Frontend | Offline demo: no backend, data lives in the browser. |

## 2. Sign-in and accounts (Backend)

- Email + password and Google. The app does **not** use an email-code (OTP) step: in Supabase turn
  **Authentication -> Sign In / Providers -> Email -> "Confirm email" OFF**, or new users cannot sign in.
- A trigger on `auth.users` insert creates the user's `profiles` row (`handle_new_user`). The sign-up form
  sends `raw_user_meta_data = { full_name, role }`, where `role` is `producer` or `consumer` (anything else becomes consumer).
  If a profile row is missing the dashboard cannot load.
- The browser may only change `profiles.full_name`. It must never write any other table or column.

## 3. Tables the browser reads (select only, Row Level Security: each user sees their own rows)

| Table | Columns the app uses |
|---|---|
| `profiles` | `id, full_name, role, credits, cash, wallet_address` |
| `energy_logs` | `id, log_date, generated, used, exported, claimed` (one row per user per day) |
| `listings` | `id, seller_id, credits, price_per_credit, status (active/sold/cancelled), created_at` |
| `trades` | `id, listing_id, buyer_id, seller_id, credits, total_price, created_at` |
| `bill_payments` | `id, provider, consumer_number, consumer_name, billing_month, meter_number, units_consumed, rate_per_unit, bill_amount, credits_used, credit_savings, upi_paid, created_at` |
| `chain_events` | `id, kind, status, user_id, counterparty_id, ref_id, payload, tx_hash, block_number, attempts, last_error, created_at, confirmed_at` |

Numbers can arrive as strings or bigints; the app converts them (`web/src/data/normalize.ts`).

## 4. The 7 database functions (the only way the app changes data)

Every function returns `jsonb`: `{ "ok": true|false, "message": "...", ...extra }`. When `ok` is false the
`message` is shown to the user as is, so keep messages short and readable.

| Function | Parameters | Notes |
|---|---|---|
| `log_energy` | `p_generated numeric, p_used numeric` | Producers only. Records the day's meter reading. `exported = max(generated - used, 0)`. |
| `claim_credits` | none | Producers only. Turns not-yet-claimed `exported` units into credits (**1 unit = 1 credit**), queues a `MINT` event. |
| `create_listing` | `p_credits numeric, p_price numeric` | Producers only. Price per credit **between Rs 1 and Rs 10** (a realistic price per unit). Moves credits out of the balance into the listing, queues `LIST`. |
| `cancel_listing` | `p_listing_id uuid` | Own active listing only. Unsold credits return to the owner, queues `CANCEL`. |
| `buy_listing` | `p_listing_id uuid` | Buys a whole listing. Cash goes to the seller, credits to the buyer, queues `TRADE`. |
| `market_listings` | none | Returns rows: `id, credits, price_per_credit, total, seller_name, is_mine, created_at`. |
| `pay_bill` | `p_provider, p_consumer_number, p_consumer_name, p_billing_month, p_meter_number, p_units, p_rate, p_credits_to_use` | **1 credit = Rs 2** off the bill; the rest is paid by (simulated) UPI. Burns the used credits (`BURN`). Returns `receipt_id, credits_applied, savings, upi_paid`. |

### Rules the database must enforce (the form checks them too, but the database is the real guard)

- **Consumer numbers** on `pay_bill`, by provider (matched by the start of the provider name; unknown provider is rejected):

  | Provider | Accepted number |
  |---|---|
  | MSEDCL | 12 digits |
  | Tata Power | 9 or 11 digits |
  | BSES Rajdhani | 9 digits |
  | BESCOM | 10 digits (7 for older rural connections) |
  | TNEB | 12 digits |
  | WBSEDCL | 9 digits |
  | UPPCL | 10 digits |
  | PSPCL | 10 digits, or 8 letters/digits (older accounts) |

- **Deleting an `energy_logs` row** (done by an admin, browsers cannot) removes exactly that row's `claimed`
  credits from the owner's balance, never below zero (trigger `remove_credits_on_log_delete`).
- The balance, cash and role cannot be changed by a signed-in user; only the functions above change them.
- The app shows today's log read-only once it exists; the database still allows a correction that does not
  go below what was already claimed.

## 5. Live updates (Backend)

The app reloads data when it changes. Add these tables to the `supabase_realtime` publication:
`profiles, energy_logs, listings, trades, bill_payments, chain_events` (migration `*_realtime.sql`).
As a safety net the app also reloads every 15 s while the tab is open.

## 6. Blockchain outbox (Backend + Blockchain)

Each business action writes a `chain_events` row in the **same transaction**. The edge function `chain-sync`
sends them to the contract and writes the result back.

- `kind`: `MINT` (shown as "convert"), `LIST`, `CANCEL`, `TRADE`, `BURN`.
- `status`: `pending` -> `processing` -> `confirmed` or `failed`. On success `tx_hash`, `block_number`,
  `confirmed_at` are filled in; on failure `last_error` and `attempts`.
- The app calls the function after every action: `POST chain-sync` with body `{}`, and expects
  `{ "pending": <number> }` (how many events are still waiting). It never fails the user's action if this call fails.

## 7. Smart contract (Blockchain)

Source: `contracts/contracts/SolarCredit.sol`. Address and ABI: `contracts/deployment.json`. How it all fits together:
[`docs/architecture/blockchain-flow.md`](../architecture/blockchain-flow.md).

The app **reads** the chain directly (`web/src/lib/chain.ts`, ABI in `web/src/lib/chainAbi.ts`) to show the
"verified on blockchain" page. It decodes these events, so their names and fields must stay as they are:

```
CreditsMinted(address indexed to, uint256 units, bytes32 ref, uint256 timestamp)
CreditsBurned(address indexed from, uint256 units, bytes32 ref, uint256 timestamp)
ListingCreated(uint256 indexed listingId, address indexed seller, uint256 units, uint256 pricePerCredit, bytes32 ref)
ListingCancelled(uint256 indexed listingId, bytes32 ref)
TradeExecuted(uint256 indexed listingId, address indexed seller, address indexed buyer, uint256 units, uint256 pricePerCredit, uint256 totalPaise, bytes32 ref, uint256 timestamp)
```

It also calls `balanceOf(address)` (view). The owner-only functions the backend uses are `mintCredits`,
`burnCredits`, `createListing`, `cancelListing`, `executeTrade`.

- **Units:** contract `units` are hundredths of a credit (18.50 credits = 1850). Prices and totals are in **paise**.
- **`ref`:** the database row id (`chain_events.ref_id`, a uuid) left-padded to 32 bytes, so every on-chain
  event can be traced back to its row.

## 8. Words the screen uses

Energy is shown in **units** (1 unit = 1 kWh) and the on-chain `MINT` is shown as **convert**. These are display
words only; the stored values (`MINT`, kWh numbers) do not change.
