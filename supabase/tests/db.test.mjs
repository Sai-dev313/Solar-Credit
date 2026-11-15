// Runs the real migration on an in-memory Postgres (PGlite) with a minimal Supabase shim,
// then exercises the business flow and tries to cheat as a logged-in user.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const db = new PGlite();
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated;
`);
import { applyMigrations } from "./load-migrations.mjs";
await applyMigrations(db, { afterFirst: `grant usage on schema public to anon, authenticated;` });

let passed = 0;
const t = async (name, fn) => { await fn(); passed++; console.log("  ok  " + name); };

const signup = async (name, role) => {
  const { rows } = await db.query(
    `insert into auth.users (raw_user_meta_data) values ($1::jsonb) returning id`,
    [JSON.stringify({ full_name: name, role })]);
  return rows[0].id;
};
// Run a statement as a logged-in browser user (RLS + grants enforced).
const as = async (uid, sql, params = []) => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false)`);
  try { return await db.query(sql, params); }
  finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false)`); }
};
const rpc = async (uid, fn, ...args) => {
  const ph = args.map((_, i) => `$${i + 1}`).join(",");
  return (await as(uid, `select public.${fn}(${ph}) as r`, args)).rows[0].r;
};
const fails = async (p) => { try { await p; } catch { return true; } return false; };

const prod = await signup("Asha Patil", "producer");
const cons = await signup("Ravi Kumar", "consumer");
const evil = await signup("Mallory", "admin"); // unknown role must degrade to consumer

console.log("Schema");
await t("profiles are created by trigger, unknown role -> consumer", async () => {
  const { rows } = await db.query(`select id, role, credits, cash from profiles`);
  assert.equal(rows.find((r) => r.id === evil).role, "consumer");
  assert.equal(rows.find((r) => r.id === prod).role, "producer");
  assert.equal(Number(rows.find((r) => r.id === prod).cash), 5000);
});

console.log("Energy -> credits");
await t("consumer cannot log energy", async () => {
  assert.equal((await rpc(cons, "log_energy", 10, 2)).ok, false);
});
await t("producer logs 20 generated / 5 used -> 15 exported", async () => {
  const r = await rpc(prod, "log_energy", 20, 5);
  assert.equal(r.ok, true); assert.equal(Number(r.exported), 15);
});
await t("claim converts exported kWh to credits and queues a MINT", async () => {
  const r = await rpc(prod, "claim_credits");
  assert.equal(r.ok, true); assert.equal(Number(r.credits), 15);
  const p = (await db.query(`select credits from profiles where id=$1`, [prod])).rows[0];
  assert.equal(Number(p.credits), 15);
  const ev = (await db.query(`select kind, status from chain_events where user_id=$1`, [prod])).rows;
  assert.deepEqual(ev, [{ kind: "MINT", status: "pending" }]);
});
await t("OLD EXPLOIT: re-logging then re-claiming cannot mint twice", async () => {
  assert.equal((await rpc(prod, "claim_credits")).ok, false);                 // nothing left
  assert.equal((await rpc(prod, "log_energy", 20, 5)).ok, true);              // same numbers: allowed
  assert.equal((await rpc(prod, "claim_credits")).ok, false);                 // still nothing
  assert.equal((await rpc(prod, "log_energy", 20, 18)).ok, false);           // would drop below claimed
  const p = (await db.query(`select credits from profiles where id=$1`, [prod])).rows[0];
  assert.equal(Number(p.credits), 15);
});
await t("raising generation later only lets you claim the difference", async () => {
  assert.equal((await rpc(prod, "log_energy", 30, 5)).ok, true);              // exported 25
  const r = await rpc(prod, "claim_credits");
  assert.equal(Number(r.credits), 10);
});

console.log("Marketplace");
let listingId;
await t("producer lists 10 credits at INR 7; credits move to escrow", async () => {
  const r = await rpc(prod, "create_listing", 10, 7);
  assert.equal(r.ok, true); listingId = r.listing_id;
  assert.equal(Number((await db.query(`select credits from profiles where id=$1`, [prod])).rows[0].credits), 15);
});
await t("cannot list more than owned, nor at an absurd price", async () => {
  assert.equal((await rpc(prod, "create_listing", 999, 7)).ok, false);
  assert.equal((await rpc(prod, "create_listing", 1, 5000)).ok, false);
});
await t("market feed hides seller id, shows first name, flags own listing", async () => {
  const feed = (await as(cons, `select * from market_listings()`)).rows;
  assert.equal(feed.length, 1); assert.equal(feed[0].seller_name, "Asha"); assert.equal(feed[0].is_mine, false);
  assert.ok(!("seller_id" in feed[0]));
  assert.equal((await as(prod, `select * from market_listings()`)).rows[0].is_mine, true);
});
await t("seller cannot buy own listing; buyer with funds can", async () => {
  assert.equal((await rpc(prod, "buy_listing", listingId)).ok, false);
  const r = await rpc(cons, "buy_listing", listingId);
  assert.equal(r.ok, true); assert.equal(Number(r.total), 70);
});
await t("balances after trade: buyer +10 credits -70 cash, seller +70 cash", async () => {
  const b = (await db.query(`select credits, cash from profiles where id=$1`, [cons])).rows[0];
  const s = (await db.query(`select cash from profiles where id=$1`, [prod])).rows[0];
  assert.equal(Number(b.credits), 10); assert.equal(Number(b.cash), 4930); assert.equal(Number(s.cash), 5070);
});
await t("cannot buy the same listing twice", async () => {
  assert.equal((await rpc(cons, "buy_listing", listingId)).ok, false);
});
await t("cancel returns credits and queues CANCEL", async () => {
  const l = (await rpc(prod, "create_listing", 5, 6)).listing_id;
  const before = Number((await db.query(`select credits from profiles where id=$1`, [prod])).rows[0].credits);
  assert.equal((await rpc(cons, "cancel_listing", l)).ok, false);            // not the seller
  assert.equal((await rpc(prod, "cancel_listing", l)).ok, true);
  const after = Number((await db.query(`select credits from profiles where id=$1`, [prod])).rows[0].credits);
  assert.equal(after, before + 5);
});

console.log("Bill payment");
const bill = ["MSEDCL (Maharashtra)", "170250012345", "Ravi Kumar", "June 2026", "MR1234567", 200, 6];
await t("credits cannot exceed the bill and cannot exceed balance", async () => {
  assert.equal((await rpc(cons, "pay_bill", ...bill, 700)).ok, false);        // savings INR 1400 > bill INR 1200
  assert.equal((await rpc(cons, "pay_bill", ...bill, 11)).ok, false);
});
await t("redeems 10 credits = INR 20 off a INR 1200 bill; queues BURN", async () => {
  const r = await rpc(cons, "pay_bill", ...bill, 10);
  assert.equal(r.ok, true); assert.equal(Number(r.savings), 20); assert.equal(Number(r.upi_paid), 1180);
  assert.equal(Number((await db.query(`select credits from profiles where id=$1`, [cons])).rows[0].credits), 0);
  assert.equal((await db.query(`select 1 from chain_events where kind='BURN' and user_id=$1`, [cons])).rows.length, 1);
});

console.log("Attacks as a logged-in browser user");
await t("cannot UPDATE own credits or cash directly", async () => {
  assert.ok(await fails(as(cons, `update profiles set credits = 1000000 where id = $1`, [cons])));
  assert.ok(await fails(as(cons, `update profiles set cash = 1000000 where id = $1`, [cons])));
  assert.ok(await fails(as(cons, `update profiles set role = 'producer' where id = $1`, [cons])));
});
await t("can still update own display name", async () => {
  await as(cons, `update profiles set full_name = 'Ravi K' where id = $1`, [cons]);
});
await t("cannot INSERT/UPDATE/DELETE on any business table", async () => {
  for (const sql of [
    `insert into energy_logs (user_id, generated, used) values ('${cons}', 1, 0)`,
    `update energy_logs set claimed = 0`,
    `insert into listings (seller_id, credits, price_per_credit) values ('${cons}', 1, 1)`,
    `update listings set status = 'active'`,
    `insert into trades (listing_id, buyer_id, seller_id, credits, total_price) values (gen_random_uuid(), '${cons}', '${cons}', 1, 1)`,
    `insert into bill_payments (user_id, provider, consumer_number, consumer_name, billing_month, meter_number, units_consumed, bill_amount, credits_used, credit_savings, upi_paid) values ('${cons}','x','x','x','x','x',1,1,0,0,1)`,
    `insert into chain_events (kind, user_id, ref_id) values ('MINT', '${cons}', gen_random_uuid())`,
    `delete from profiles`,
  ]) assert.ok(await fails(as(cons, sql)), sql);
});
await t("users only see their own rows", async () => {
  assert.equal((await as(cons, `select * from profiles`)).rows.length, 1);
  assert.equal((await as(evil, `select * from energy_logs`)).rows.length, 0);
  assert.equal((await as(evil, `select * from chain_events`)).rows.length, 0);
  assert.equal((await as(evil, `select * from trades`)).rows.length, 0);
});
await t("seller sees the TRADE event as counterparty", async () => {
  const kinds = (await as(prod, `select kind from chain_events order by id`)).rows.map((r) => r.kind);
  assert.ok(kinds.includes("TRADE"));
});
await t("claim_chain_events hands each event to exactly one worker, and browsers cannot call it", async () => {
  assert.ok(await fails(as(cons, `select * from claim_chain_events(10)`)));
  const a = (await db.query(`select * from claim_chain_events(2)`)).rows;
  const b = (await db.query(`select * from claim_chain_events(50)`)).rows;
  assert.equal(a.length, 2);
  assert.ok(a.every((r) => r.status === "processing"));
  assert.ok(!b.some((r) => a.some((x) => x.id === r.id)));
  assert.ok(b.length > 0);
});
await t("unauthenticated RPC calls are rejected", async () => {
  await db.exec(`set role anon`);
  try { assert.ok(await fails(db.query(`select public.claim_credits()`))); } finally { await db.exec(`reset role`); }
});
await t("RPCs reject calls with no user", async () => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','',false)`);
  try { assert.equal((await db.query(`select public.claim_credits() r`)).rows[0].r.ok, false); }
  finally { await db.exec(`reset role`); }
});

await t("deleting an energy log removes only the credits that log produced", async () => {
  const p1 = await signup("Reset One", "producer"), p2 = await signup("Reset Two", "producer");
  const credits = async (id) => Number((await db.query(`select credits from profiles where id=$1`, [id])).rows[0].credits);
  // p1 earns 18 credits from one day's log, then 10 more from a second (older) day's log
  await rpc(p1, "log_energy", 30, 12); await rpc(p1, "claim_credits");                     // today: +18
  await db.query(`insert into energy_logs (user_id, log_date, generated, used, claimed) values ($1, current_date - 1, 15, 5, 10)`, [p1]);
  await db.query(`update profiles set credits = credits + 10 where id=$1`, [p1]);          // that older log's 10 credits
  await rpc(p2, "log_energy", 30, 12); await rpc(p2, "claim_credits");
  assert.equal(await credits(p1), 28); assert.equal(await credits(p2), 18);
  await db.query(`delete from energy_logs where user_id=$1 and log_date = current_date - 1`, [p1]); // admin delete of ONE log
  assert.equal(await credits(p1), 18);                                                      // only that log's 10 removed
  assert.equal(await credits(p2), 18);                                                      // other users untouched
  await db.query(`delete from energy_logs where user_id=$1 and log_date = current_date`, [p1]);
  assert.equal(await credits(p1), 0);
  // credits already spent: the balance stops at zero, it never goes negative
  await rpc(p2, "log_energy", 30, 12);
  await db.query(`update profiles set credits = 5 where id=$1`, [p2]);
  await db.query(`delete from energy_logs where user_id=$1`, [p2]);
  assert.equal(await credits(p2), 0);
  assert.ok(await fails(as(p2, `select public.remove_credits_on_log_delete()`)));          // not callable by browser users
});

await t("pay_bill enforces each provider's consumer-number format (and rejects unknown providers)", async () => {
  const num = async (provider, n) => rpc(cons, "pay_bill", provider, n, "Ravi Kumar", "June 2026", "MR1", 200, 6, 0);
  const ok = [
    ["MSEDCL (Maharashtra)", "170250012345"], ["Tata Power", "123456789"], ["Tata Power", "12345678901"],
    ["BSES Rajdhani (Delhi)", "123456789"], ["BESCOM (Karnataka)", "1234567890"], ["BESCOM (Karnataka)", "1234567"],
    ["TNEB (Tamil Nadu)", "123456789012"], ["WBSEDCL (West Bengal)", "123456789"], ["UPPCL (Uttar Pradesh)", "1234567890"],
    ["PSPCL (Punjab)", "3001234567"], ["PSPCL (Punjab)", "AB123456"],
  ];
  const bad = [
    ["MSEDCL (Maharashtra)", "17025001234"], ["MSEDCL (Maharashtra)", "17025001234A"], ["Tata Power", "1234567890"],
    ["BSES Rajdhani (Delhi)", "12345678"], ["BESCOM (Karnataka)", "12345678"], ["TNEB (Tamil Nadu)", "12345678901"],
    ["WBSEDCL (West Bengal)", "1234567890"], ["UPPCL (Uttar Pradesh)", "123456789012"], ["PSPCL (Punjab)", "123456789"],
    ["MSEDCL (Maharashtra)", ""], ["MSEDCL (Maharashtra)", "111"],
  ];
  for (const [p, n] of ok) assert.equal((await num(p, n)).ok, true, `${p} ${n} should be accepted`);
  for (const [p, n] of bad) assert.equal((await num(p, n)).ok, false, `${p} ${n} should be rejected`);
  const r = await num("MSEDCL (Maharashtra)", "111");
  assert.match(r.message, /must be 12 digits/);
  assert.equal((await num("Unknown Power Co", "123456789012")).ok, false);
  assert.equal((await num("Unknown Power Co", "123456789012")).message, "Unsupported electricity provider");
  assert.ok(await fails(as(cons, `select * from public.consumer_number_rule('MSEDCL')`)));  // helper is not callable by browsers
});

await t("listing price must be a realistic Rs 1 to Rs 10 per credit", async () => {
  const u = await signup("Price Tester", "producer");
  await rpc(u, "log_energy", 40, 10); await rpc(u, "claim_credits");              // 30 credits to sell
  const price = async (p) => rpc(u, "create_listing", 1, p);
  for (const bad of [0, 0.5, 0.99, 10.01, 11, 1000, 5000, -3]) assert.equal((await price(bad)).ok, false, `price ${bad} should be rejected`);
  assert.match((await price(0.5)).message, /between 1 and 10/);
  for (const good of [1, 1.5, 6, 7.5, 10]) assert.equal((await price(good)).ok, true, `price ${good} should be accepted`);
});
await t("a user without a profile gets one (ensure_profiles repairs it), and signup never fails on a duplicate", async () => {
  const u = await signup("Orphan", "producer");
  await db.query(`delete from profiles where id=$1`, [u]);                          // simulate a user created before the trigger existed
  assert.equal((await db.query(`select 1 from profiles where id=$1`, [u])).rows.length, 0);
  await db.exec(readFileSync(new URL("../migrations/20260105000000_ensure_profiles.sql", import.meta.url), "utf8"));
  const row = (await db.query(`select role, full_name from profiles where id=$1`, [u])).rows[0];
  assert.equal(row.role, "producer"); assert.equal(row.full_name, "Orphan");       // role and name come from the sign-up choices
  await db.exec(readFileSync(new URL("../migrations/20260105000000_ensure_profiles.sql", import.meta.url), "utf8")); // twice is harmless
  assert.equal((await db.query(`select count(*)::int n from profiles where id=$1`, [u])).rows[0].n, 1);
  const u2 = await signup("Fresh", "consumer");                                      // the trigger still builds profiles for new users
  assert.equal((await db.query(`select role from profiles where id=$1`, [u2])).rows[0].role, "consumer");
  // Re-running an OLD migration redefines the sign-up trigger as it was then. Put the newest definition back
  // (as a real database would have it) so later tests see the current behaviour. In production: apply migrations in order, once.
  await db.exec(readFileSync(new URL("../migrations/20260107000000_choose_role.sql", import.meta.url), "utf8"));
});

await t("a Google-style sign-up (no role) picks a role exactly once; email sign-ups are already set", async () => {
  const roleOf = async (id) => (await db.query(`select role, role_chosen from profiles where id=$1`, [id])).rows[0];
  const emailUser = await signup("Email Person", "producer");                          // sign-up form sent role=producer
  assert.deepEqual(await roleOf(emailUser), { role: "producer", role_chosen: true });
  assert.equal((await rpc(emailUser, "choose_role", "consumer")).ok, false);            // already set, cannot flip
  assert.equal((await roleOf(emailUser)).role, "producer");

  // Google sends a name + email but no role
  const g = (await db.query(`insert into auth.users (raw_user_meta_data) values ('{"name":"Gee Oogle","email":"g@x"}'::jsonb) returning id`)).rows[0].id;
  assert.deepEqual(await roleOf(g), { role: "consumer", role_chosen: false });          // safe default, not chosen yet
  assert.equal((await db.query(`select full_name from profiles where id=$1`, [g])).rows[0].full_name, "Gee Oogle"); // Google's name is used
  assert.equal((await rpc(g, "choose_role", "admin")).ok, false);                        // only producer / consumer
  assert.equal((await rpc(g, "choose_role", null)).ok, false);
  const r = await rpc(g, "choose_role", "producer");
  assert.equal(r.ok, true); assert.deepEqual(await roleOf(g), { role: "producer", role_chosen: true });
  const again = await rpc(g, "choose_role", "consumer");
  assert.equal(again.ok, false); assert.equal((await roleOf(g)).role, "producer");       // locked after the first choice
  // the browser still cannot write these columns directly
  assert.ok(await fails(as(g, `update profiles set role='consumer' where id=$1`, [g])));
  assert.ok(await fails(as(g, `update profiles set role_chosen=false where id=$1`, [g])));
  // anonymous callers are blocked
  await db.exec(`set role anon`);
  try { assert.ok(await fails(db.query(`select public.choose_role('producer')`))); } finally { await db.exec(`reset role`); }
});

console.log(`\n${passed} database tests passed`);
