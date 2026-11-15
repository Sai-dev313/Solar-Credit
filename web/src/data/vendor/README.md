# Vendored copies (offline demo only)

The offline demo mode (`VITE_DEMO=1`) runs the **real database SQL** inside the browser. These files are
**copies**, kept here so `web/` builds and runs on its own, without the `supabase/` folder.

| Copy | Source of truth |
|---|---|
| `sql/20260101000000_init.sql` | `supabase/migrations/20260101000000_init.sql` |
| `sql/20260103000000_remove_credits_on_log_delete.sql` | `supabase/migrations/…` (same name) |
| `sql/20260104000000_validate_consumer_number.sql` | `supabase/migrations/…` (same name) |
| `sql/20260105000000_ensure_profiles.sql` | `supabase/migrations/…` (same name) |
| `sql/20260106000000_listing_price_limit.sql` | `supabase/migrations/…` (same name) |
| `sql/20260107000000_choose_role.sql` | `supabase/migrations/…` (same name) |
| `chain-sync-process.js` | `supabase/functions/chain-sync/process.js` |

If the backend changes one of those files, copy the new version here so the demo behaves the same.
The realtime migration is deliberately not copied: it configures a Supabase-only feature.
