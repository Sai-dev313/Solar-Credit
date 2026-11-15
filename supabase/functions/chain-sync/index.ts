// Supabase Edge Function: chain-sync
//
// The browser calls this after every action (energy claim, listing, trade, bill).
// It takes the pending rows from the chain_events outbox, writes them to the
// SolarCredit contract with the platform's signer, and stores the transaction hash.
// If the chain is slow or down, the app keeps working and events retry on the next call.
//
// Secrets (supabase secrets set ...):
//   CHAIN_RPC_URL           JSON-RPC endpoint (Sepolia via Alchemy/Infura, or local node)
//   CHAIN_PRIVATE_KEY       the contract owner's key (a throwaway testnet wallet)
//   CHAIN_CONTRACT_ADDRESS  address printed by contracts `npm run deploy:sepolia`
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { ethers } from "ethers";
import { processEvents } from "./process.js";
import abi from "./abi.json" with { type: "json" };

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  // The anon key is also a valid JWT, so insist on a real signed-in user.
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !auth?.user) return json({ error: "Unauthorized" }, 401);

  const rpc = Deno.env.get("CHAIN_RPC_URL");
  const key = Deno.env.get("CHAIN_PRIVATE_KEY");
  const address = Deno.env.get("CHAIN_CONTRACT_ADDRESS");
  if (!rpc || !key || !address) return json({ error: "Chain is not configured", configured: false }, 503);

  const provider = new ethers.JsonRpcProvider(rpc);
  // Events are sent strictly one at a time and each is awaited, so a plain Wallet (which
  // asks the node for the pending nonce on every send) is correct. ethers.NonceManager
  // is deliberately NOT used: it burns a nonce when a call reverts and then every later
  // transaction fails with "nonce too high".
  const contract = new ethers.Contract(address, abi, new ethers.Wallet(key, provider));

  const store = {
    async claim(limit: number) {
      const { data, error } = await admin.rpc("claim_chain_events", { p_limit: limit });
      if (error) throw error;
      return data ?? [];
    },
    async saveWallet(userId: string, addr: string) {
      await admin.from("profiles").update({ wallet_address: addr }).eq("id", userId).is("wallet_address", null);
    },
    async chainListingId(listingId: string) {
      const { data } = await admin.from("listings").select("chain_listing_id").eq("id", listingId).single();
      return data?.chain_listing_id ?? null;
    },
    async setChainListingId(listingId: string, chainId: number) {
      await admin.from("listings").update({ chain_listing_id: chainId }).eq("id", listingId);
    },
    async confirm(id: number, txHash: string, block: number) {
      await admin.from("chain_events").update({
        status: "confirmed", tx_hash: txHash, block_number: block,
        confirmed_at: new Date().toISOString(), last_error: null,
      }).eq("id", id);
    },
    // Put an event back in the queue (or mark it dead). `error === null` means a
    // deferral that should not count as an attempt.
    async release(id: number, error: string | null, dead: boolean) {
      const { data } = await admin.from("chain_events").select("attempts").eq("id", id).single();
      await admin.from("chain_events").update({
        status: dead ? "failed" : "pending",
        attempts: (data?.attempts ?? 0) + (error ? 1 : 0),
        last_error: error,
      }).eq("id", id);
    },
  };

  try {
    const result = await processEvents({ store, contract, secret: key, limit: 5 });
    const { count } = await admin.from("chain_events").select("id", { count: "exact", head: true }).eq("status", "pending");
    return json({ ...result, pending: count ?? 0 });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
