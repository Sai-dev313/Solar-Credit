// Offline demo backend: the REAL migration running in an in-browser Postgres (PGlite).
// Same tables, same RPC functions, same row-level security as production; only the
// auth layer is a small shim. Chain events are either written to a local Hardhat node
// (VITE_DEMO_CHAIN_RPC) or, by default, confirmed with simulated hashes.
import { PGlite } from "@electric-sql/pglite";
import { ethers } from "ethers";
import migration from "./vendor/sql/20260101000000_init.sql?raw";
// Later migrations that change behaviour the demo should share. (The realtime migration is left out: it
// configures a Supabase-only publication that this in-browser Postgres does not have.)
import removeCreditsOnLogDelete from "./vendor/sql/20260103000000_remove_credits_on_log_delete.sql?raw";
import validateConsumerNumber from "./vendor/sql/20260104000000_validate_consumer_number.sql?raw";
import ensureProfiles from "./vendor/sql/20260105000000_ensure_profiles.sql?raw";
import listingPriceLimit from "./vendor/sql/20260106000000_listing_price_limit.sql?raw";
import chooseRole from "./vendor/sql/20260107000000_choose_role.sql?raw";
// Plain JS module shared with the edge function
import { processEvents, walletAddressFor } from "./vendor/chain-sync-process.js";
import type { BillInput, DataApi, RpcResult, Role, Session } from "./types";
import { mapBill, mapEvent, mapLog, mapMarket, mapMyListing, mapProfile, mapTrade } from "./normalize";

const SHIM = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated;
  create schema demo;
  create table demo.accounts (user_id uuid primary key, email text unique not null, password text not null, verified boolean not null default false);
`;

const SESSION_KEY = "sc-demo-session";
const SECRET = "demo-secret-not-for-production";
const CHAIN_RPC = import.meta.env.VITE_DEMO_CHAIN_RPC as string | undefined;
const OWNER_KEY = (import.meta.env.VITE_DEMO_OWNER_KEY as string | undefined) ??
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // public Hardhat account #0
const CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined;

export function createDemoApi(): DataApi {
  const dbReady = (async () => {
    const db = new PGlite("idb://solar-credit-demo");
    const { rows } = await db.query<{ t: string | null }>(`select to_regclass('public.profiles')::text as t`);
    if (!rows[0].t) {
      await db.exec(SHIM);
      await db.exec(migration);
      await db.exec(removeCreditsOnLogDelete);
      await db.exec(validateConsumerNumber);
      await db.exec(ensureProfiles);
      await db.exec(listingPriceLimit);
      await db.exec(chooseRole);
      await db.exec(`grant usage on schema public to anon, authenticated; grant all on all tables in schema public to service_role;`);
    }
    return db;
  })();

  // One connection, and `set role` is connection state: serialise every call.
  let queue: Promise<unknown> = Promise.resolve();
  const exclusive = <T,>(fn: () => Promise<T>): Promise<T> => {
    const run = queue.then(fn, fn);
    queue = run.catch(() => undefined);
    return run;
  };

  const listeners = new Set<(s: Session | null) => void>();
  const getSession = (): Session | null => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null"); } catch { return null; }
  };
  const setSession = (s: Session | null) => {
    try { s ? localStorage.setItem(SESSION_KEY, JSON.stringify(s)) : localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    listeners.forEach((l) => l(s));
  };

  // Run SQL as the signed-in browser user, with RLS and column grants enforced.
  const as = <T = Record<string, unknown>>(sql: string, params: unknown[] = []) =>
    exclusive(async () => {
      const uid = getSession()?.userId;
      if (!uid) throw new Error("Not signed in");
      const db = await dbReady;
      await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false)`);
      try { return (await db.query<T>(sql, params)).rows; }
      finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false)`); }
    });

  const rpc = async (fn: string, ...args: unknown[]): Promise<RpcResult> => {
    try {
      const ph = args.map((_, i) => `$${i + 1}`).join(", ");
      const rows = await as<{ r: RpcResult }>(`select public.${fn}(${ph}) as r`, args);
      return rows[0].r;
    } catch (e) { return { ok: false, message: (e as Error).message }; }
  };

  // Service-role view of the outbox for the sync step.
  const store = {
    claim: (n: number) => exclusive(async () => (await (await dbReady).query(`select * from claim_chain_events($1)`, [n])).rows),
    saveWallet: (u: string, a: string) => exclusive(async () => { await (await dbReady).query(`update profiles set wallet_address=$2 where id=$1 and wallet_address is null`, [u, a]); }),
    chainListingId: (l: string) => exclusive(async () => (await (await dbReady).query<{ chain_listing_id: number | null }>(`select chain_listing_id from listings where id=$1`, [l])).rows[0]?.chain_listing_id ?? null),
    setChainListingId: (l: string, c: number) => exclusive(async () => { await (await dbReady).query(`update listings set chain_listing_id=$2 where id=$1`, [l, c]); }),
    confirm: (id: number, tx: string, b: number) => exclusive(async () => { await (await dbReady).query(`update chain_events set status='confirmed', tx_hash=$2, block_number=$3, confirmed_at=now(), last_error=null where id=$1`, [id, tx, b]); }),
    release: (id: number, err: string | null, dead: boolean) => exclusive(async () => { await (await dbReady).query(`update chain_events set status=$2, attempts=attempts+$3, last_error=$4 where id=$1`, [id, dead ? "failed" : "pending", err ? 1 : 0, err]); }),
  };

  const syncSimulated = async () => {
    for (const e of (await store.claim(50)) as { id: number; ref_id: string; user_id: string; kind: string; payload: { credits?: number }; }[]) {
      await store.saveWallet(e.user_id, walletAddressFor(SECRET, e.user_id));
      if (e.kind === "LIST") await store.setChainListingId(e.ref_id, e.id);
      await store.confirm(e.id, ethers.id(`${e.id}:${e.ref_id}:${e.kind}`), 1_000_000 + e.id);
    }
  };

  let syncing: Promise<void> | null = null;
  const syncChain = () => {
    if (syncing) return syncing;
    syncing = (async () => {
      try {
        if (!CHAIN_RPC || !CONTRACT) return await syncSimulated();
        const abi = (await import("../lib/chainAbi")).FULL_ABI;
        const contract = new ethers.Contract(CONTRACT, abi, new ethers.Wallet(OWNER_KEY, new ethers.JsonRpcProvider(CHAIN_RPC)));
        // `as never`: the shared module sees its own copy of ethers' types.
        await processEvents({ store, contract: contract as never, secret: SECRET, limit: 20 });
      } catch { /* chain unavailable: events stay queued */ }
    })().finally(() => { syncing = null; });
    return syncing;
  };

  return {
    mode: "demo",
    auth: {
      async session() { return getSession(); },
      onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); },
      async signUp(email, password, fullName, role: Role) {
        return exclusive(async () => {
          const db = await dbReady;
          const e = email.trim().toLowerCase();
          if ((await db.query(`select 1 from demo.accounts where email=$1`, [e])).rows.length) return { error: "An account with this email already exists" };
          const id = (await db.query<{ id: string }>(
            `insert into auth.users (raw_user_meta_data) values ($1::jsonb) returning id`,
            [JSON.stringify({ full_name: fullName, role })])).rows[0].id;
          await db.query(`insert into demo.accounts (user_id, email, password, verified) values ($1,$2,$3,true)`, [id, e, password]);
          return { needsEmailConfirm: true }; // demo accounts are pre-verified; the app signs the user straight in
        });
      },
      async signIn(email, password) {
        return exclusive(async () => {
          const db = await dbReady;
          const r = (await db.query<{ user_id: string; email: string; verified: boolean }>(`select user_id, email, verified from demo.accounts where email=$1 and password=$2`, [email.trim().toLowerCase(), password])).rows[0];
          if (!r) return { error: "Invalid email or password" };
          if (!r.verified) return { error: "Email not confirmed", unverified: true };
          setSession({ userId: r.user_id, email: r.email });
          return {};
        });
      },
      async verifyOtp(email, code) {
        return exclusive(async () => {
          if (code.trim() !== "123456") return { error: "That code is not correct (demo code: 123456)" };
          const db = await dbReady;
          const r = (await db.query<{ user_id: string; email: string }>(`update demo.accounts set verified = true where email=$1 returning user_id, email`, [email.trim().toLowerCase()])).rows[0];
          if (!r) return { error: "Account not found" };
          setSession({ userId: r.user_id, email: r.email });
          return {};
        });
      },
      async resendOtp() { return {}; },
      async google() { return { error: "Google sign-in is not available in offline demo mode" }; },
      async signOut() { setSession(null); },
      async resetPassword() { return { error: "Password reset is disabled in demo mode" }; },
    },
    async profile() { const r = await as(`select * from profiles`); return r[0] ? mapProfile(r[0]) : null; },
    async updateName(name) { await as(`update profiles set full_name = $1 where id = auth.uid()`, [name.trim().slice(0, 80)]); },
    async energyLogs() { return (await as(`select * from energy_logs order by log_date desc limit 60`)).map(mapLog); },
    async myListings() { return (await as(`select * from listings where seller_id = auth.uid() order by created_at desc`)).map(mapMyListing); },
    async market() { return (await as(`select * from market_listings()`)).map(mapMarket); },
    async trades() { return (await as(`select * from trades order by created_at desc`)).map(mapTrade); },
    async bills() { return (await as(`select * from bill_payments order by created_at desc`)).map(mapBill); },
    async chainEvents() { return (await as(`select * from chain_events order by id desc limit 100`)).map(mapEvent); },
    logEnergy: (g, u) => rpc("log_energy", g, u),
    chooseRole: (role) => rpc("choose_role", role),
    claimCredits: () => rpc("claim_credits"),
    createListing: (c, p) => rpc("create_listing", c, p),
    cancelListing: (id) => rpc("cancel_listing", id),
    buyListing: (id) => rpc("buy_listing", id),
    payBill: (b: BillInput) => rpc("pay_bill", b.provider, b.consumerNumber, b.consumerName, b.billingMonth, b.meterNumber, b.units, b.rate, b.creditsToUse),
    syncChain,
    subscribe() { return () => {}; }, // demo data only changes through this tab's own actions
  };
}
