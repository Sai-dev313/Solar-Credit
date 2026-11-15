// Drains the chain_events outbox onto the SolarCredit contract.
// Pure logic with injected dependencies, so the same code runs in the Supabase
// edge runtime (Deno) and in the local end-to-end test (Node + Hardhat).
import { ethers } from "ethers";

const MAX_ATTEMPTS = 5;

/** uuid -> bytes32, so on-chain events carry the database row id. */
export const refOf = (uuid) => ethers.zeroPadValue("0x" + uuid.replace(/-/g, ""), 32);

/** Credits (2 decimals) -> contract units (hundredths). */
export const toUnits = (credits) => BigInt(Math.round(Number(credits) * 100));

/** Rupees -> paise. */
export const toPaise = (rupees) => BigInt(Math.round(Number(rupees) * 100));

/**
 * Custodial wallet address for a user. Derived from a server secret, so the platform
 * can always re-derive it and nothing needs to be stored apart from the address itself.
 */
export function walletAddressFor(secret, userId) {
  return new ethers.Wallet(ethers.keccak256(ethers.toUtf8Bytes(`${secret}:${userId}`))).address;
}

/**
 * @param {object} o
 * @param {object} o.store      database adapter (see index.ts / the e2e test)
 * @param {ethers.Contract} o.contract  SolarCredit contract connected to the owner signer
 * @param {string} o.secret     salt for deriving user wallet addresses
 * @param {number} [o.limit]
 */
export async function processEvents({ store, contract, secret, limit = 5 }) {
  // UPDATE ... RETURNING has no guaranteed order; the chain must see events in id order.
  const events = (await store.claim(limit)).sort((a, b) => Number(a.id) - Number(b.id));
  const out = { claimed: events.length, confirmed: 0, retry: 0, failed: 0, deferred: 0 };

  const addressOf = async (userId) => {
    const addr = walletAddressFor(secret, userId);
    await store.saveWallet(userId, addr);
    return addr;
  };

  // If an event cannot be sent yet, that user's later events wait too (a burn must not
  // run before the trade that funded it). They are put back without costing an attempt.
  const blocked = new Set();

  for (const e of events) {
    if (blocked.has(e.user_id)) {
      await store.release(e.id, null, false);
      out.deferred++;
      continue;
    }
    try {
      const ref = refOf(e.ref_id);
      const credits = e.payload.credits;
      let tx, chainListingId = null;

      switch (e.kind) {
        case "MINT":
          tx = await contract.mintCredits(await addressOf(e.user_id), toUnits(credits), ref);
          break;
        case "BURN":
          tx = await contract.burnCredits(await addressOf(e.user_id), toUnits(credits), ref);
          break;
        case "LIST":
          tx = await contract.createListing(await addressOf(e.user_id), toUnits(credits), toPaise(e.payload.price), ref);
          break;
        case "CANCEL":
        case "TRADE": {
          const id = await store.chainListingId(e.ref_id);
          if (id == null) { // its LIST event has not been confirmed yet
            blocked.add(e.user_id);
            await store.release(e.id, null, false);
            out.deferred++;
            continue;
          }
          tx = e.kind === "CANCEL"
            ? await contract.cancelListing(BigInt(id), ref)
            : await contract.executeTrade(BigInt(id), await addressOf(e.user_id), ref);
          break;
        }
        default:
          throw new Error(`Unknown event kind ${e.kind}`);
      }

      const receipt = await tx.wait();
      if (e.kind === "LIST") {
        const parsed = receipt.logs
          .map((l) => { try { return contract.interface.parseLog(l); } catch { return null; } })
          .find((p) => p && p.name === "ListingCreated");
        chainListingId = Number(parsed.args.listingId);
        await store.setChainListingId(e.ref_id, chainListingId);
      }
      await store.confirm(e.id, receipt.hash, receipt.blockNumber);
      out.confirmed++;
    } catch (err) {
      const msg = String(err?.shortMessage || err?.message || err).slice(0, 300);
      const dead = e.attempts + 1 >= MAX_ATTEMPTS;
      blocked.add(e.user_id);
      await store.release(e.id, msg, dead);
      dead ? out.failed++ : out.retry++;
    }
  }
  return out;
}
