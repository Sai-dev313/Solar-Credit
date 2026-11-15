// End to end: database actions -> chain_events outbox -> processEvents -> real chain.
// Needs a local node:  (cd contracts && npx hardhat node) and  npm run deploy:local
import { PGlite } from "@electric-sql/pglite";
import { ethers } from "ethers";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { processEvents, walletAddressFor, refOf } from "../functions/chain-sync/process.js";

const dep = JSON.parse(readFileSync(new URL("../../contracts/deployment.json", import.meta.url), "utf8"));
const OWNER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // public Hardhat account #0
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const contract = new ethers.Contract(dep.address, dep.abi, new ethers.Wallet(OWNER_KEY, provider));

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
await applyMigrations(db);
await db.exec(`grant usage on schema public to anon, authenticated; grant all on all tables in schema public to service_role;`);

const store = {
  claim: async (n) => (await db.query(`select * from claim_chain_events($1)`, [n])).rows,
  saveWallet: (u, a) => db.query(`update profiles set wallet_address=$2 where id=$1 and wallet_address is null`, [u, a]),
  chainListingId: async (l) => (await db.query(`select chain_listing_id from listings where id=$1`, [l])).rows[0]?.chain_listing_id ?? null,
  setChainListingId: (l, c) => db.query(`update listings set chain_listing_id=$2 where id=$1`, [l, c]),
  confirm: (id, tx, b) => db.query(`update chain_events set status='confirmed', tx_hash=$2, block_number=$3, confirmed_at=now() where id=$1`, [id, tx, b]),
  release: async (id, err, dead) => db.query(
    `update chain_events set status=$2, attempts=attempts+$3, last_error=$4 where id=$1`,
    [id, dead ? "failed" : "pending", err ? 1 : 0, err]),
};
const sync = (limit = 20) => processEvents({ store, contract, secret: OWNER_KEY, limit });

const signup = async (name, role) => (await db.query(
  `insert into auth.users (raw_user_meta_data) values ($1::jsonb) returning id`, [JSON.stringify({ full_name: name, role })])).rows[0].id;
const rpc = async (uid, fn, ...args) => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false)`);
  try { return (await db.query(`select public.${fn}(${args.map((_, i) => "$" + (i + 1)).join(",")}) r`, args)).rows[0].r; }
  finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false)`); }
};
const q = async (sql, p) => (await db.query(sql, p)).rows;

const asha = await signup("Asha Patil", "producer");
const ravi = await signup("Ravi Kumar", "consumer");
const A = walletAddressFor(OWNER_KEY, asha), R = walletAddressFor(OWNER_KEY, ravi);

console.log("DB actions");
assert.equal((await rpc(asha, "log_energy", 30, 5)).ok, true);
assert.equal((await rpc(asha, "claim_credits")).ok, true);                       // 25 credits
const lst = (await rpc(asha, "create_listing", 10, 7.5)).listing_id;             // 10 @ 7.50
assert.equal((await rpc(ravi, "buy_listing", lst)).ok, true);                    // pays 75
assert.equal((await rpc(ravi, "pay_bill", "MSEDCL (Maharashtra)", "170250012345", "Ravi Kumar", "June 2026", "MR1", 200, 6, 4)).ok, true);
const cancelMe = (await rpc(asha, "create_listing", 5, 6)).listing_id;
assert.equal((await rpc(asha, "cancel_listing", cancelMe)).ok, true);
console.log("  outbox:", (await q(`select kind from chain_events order by id`)).map((r) => r.kind).join(" "));

const supply0 = Number(await contract.totalMinted()) - Number(await contract.totalBurned());
const escrow0 = Number(await contract.totalEscrowed());
console.log("Chain sync");
const r = await sync();
console.log("  result:", JSON.stringify(r));
if (r.confirmed !== 6) console.log((await q(`select kind,status,attempts,last_error from chain_events order by id`)).map((x)=>JSON.stringify(x)).join("\n"));
assert.equal(r.confirmed, 6); assert.equal(r.failed, 0); assert.equal(r.retry, 0);

const ev = await q(`select kind, status, tx_hash, block_number from chain_events order by id`);
assert.ok(ev.every((e) => e.status === "confirmed" && /^0x[0-9a-f]{64}$/.test(e.tx_hash)));
console.log("  tx hashes:", ev.map((e) => `${e.kind} ${e.tx_hash.slice(0, 10)}…`).join(", "));

console.log("Database matches the chain");
const dbA = (await q(`select credits from profiles where id=$1`, [asha]))[0].credits;
const dbR = (await q(`select credits from profiles where id=$1`, [ravi]))[0].credits;
const chainA = Number(await contract.balanceOf(A)) / 100, chainR = Number(await contract.balanceOf(R)) / 100;
console.log(`  Asha  db=${dbA} chain=${chainA}   Ravi  db=${dbR} chain=${chainR}`);
assert.equal(Number(dbA), chainA); assert.equal(Number(dbR), chainR);
assert.equal(Number(await contract.totalEscrowed()) - escrow0, 0);
assert.equal(Number(await contract.totalMinted()) - Number(await contract.totalBurned()) - supply0, (chainA + chainR) * 100);

console.log("Receipts decode to the right events");
const trade = (await q(`select tx_hash from chain_events where kind='TRADE'`))[0].tx_hash;
const rc = await provider.getTransactionReceipt(trade);
const parsed = rc.logs.map((l) => { try { return contract.interface.parseLog(l); } catch { return null; } }).find(Boolean);
assert.equal(parsed.name, "TradeExecuted");
assert.equal(parsed.args.buyer, R); assert.equal(parsed.args.seller, A);
assert.equal(Number(parsed.args.units), 1000); assert.equal(Number(parsed.args.totalPaise), 7500);
assert.equal(parsed.args.ref, refOf(lst));
console.log("  TradeExecuted: 10.00 credits, INR 75.00, ref = database listing id");

console.log("Resilience");
const l2 = (await rpc(asha, "create_listing", 3, 6)).listing_id;
await rpc(asha, "cancel_listing", l2);
await db.exec(`update chain_events set status='failed' where kind='LIST' and ref_id='${l2}'`); // LIST never made it
const d = await sync();
assert.equal(d.deferred, 1);                                                      // CANCEL waits, does not burn attempts
assert.equal((await q(`select attempts from chain_events where kind='CANCEL' and ref_id=$1`, [l2]))[0].attempts, 0);
console.log("  CANCEL without a confirmed LIST is deferred, not lost:", JSON.stringify(d));

await db.exec(`update chain_events set status='pending', attempts=0 where kind='CANCEL' and ref_id='${l2}'`);
await db.query(`update listings set chain_listing_id = 999 where id=$1`, [l2]);    // bogus on-chain id
for (let i = 0; i < 5; i++) await sync();
const dead = (await q(`select status, attempts, last_error from chain_events where kind='CANCEL' and ref_id=$1`, [l2]))[0];
assert.equal(dead.status, "failed"); assert.equal(dead.attempts, 5);
console.log(`  a revert is retried 5 times then marked failed (“${dead.last_error}”)`);

console.log("\nEnd-to-end passed");
process.exit(0);
