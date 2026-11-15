import { ethers } from "ethers";
import { EVENTS_ABI, FULL_ABI } from "./chainAbi";

const env = import.meta.env;
const DEMO = env.VITE_DEMO === "1";

export const chainConfig = {
  rpc: ((DEMO ? env.VITE_DEMO_CHAIN_RPC : env.VITE_RPC_URL) as string | undefined) || "",
  contract: ((env.VITE_CONTRACT_ADDRESS as string | undefined) || "").trim(),
  name: ((DEMO && env.VITE_DEMO_CHAIN_RPC ? "Local Hardhat" : env.VITE_CHAIN_NAME) as string | undefined) || "Sepolia",
  explorer: ((env.VITE_EXPLORER_URL as string | undefined) || "").replace(/\/$/, ""),
  /** Demo mode with no node configured: hashes are simulated, so there is nothing to verify. */
  simulated: DEMO && !env.VITE_DEMO_CHAIN_RPC,
};

export const chainReadable = !!chainConfig.rpc && !!chainConfig.contract && !chainConfig.simulated;

export const txUrl = (hash: string) => (chainConfig.explorer ? `${chainConfig.explorer}/tx/${hash}` : null);
export const addressUrl = (addr: string) => (chainConfig.explorer ? `${chainConfig.explorer}/address/${addr}` : null);

let provider: ethers.JsonRpcProvider | null = null;
const getProvider = () => (provider ??= new ethers.JsonRpcProvider(chainConfig.rpc));

export interface VerifiedEvent {
  name: string;
  title: string;
  lines: [string, string][];
  ref: string;
}

export interface Verification {
  status: "success" | "reverted";
  block: number;
  timestamp: number;
  from: string;
  to: string | null;
  toOurContract: boolean;
  events: VerifiedEvent[];
}

const units = (v: bigint) => (Number(v) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const rupees = (paise: bigint) => "₹" + (Number(paise) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 });

/** Reads a transaction straight from the chain (not from our database) and decodes our events. */
export async function verifyTx(hash: string): Promise<Verification | null> {
  const p = getProvider();
  const [tx, receipt] = await Promise.all([p.getTransaction(hash), p.getTransactionReceipt(hash)]);
  if (!tx || !receipt) return null;
  const block = await p.getBlock(receipt.blockNumber);
  const iface = new ethers.Interface(EVENTS_ABI);
  const ours = chainConfig.contract.toLowerCase();

  const events: VerifiedEvent[] = [];
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== ours) continue;
    let parsed: ethers.LogDescription | null = null;
    try { parsed = iface.parseLog(log); } catch { /* not ours */ }
    if (!parsed) continue;
    const a = parsed.args;
    const ref = String(a.ref);
    switch (parsed.name) {
      case "CreditsMinted":
        events.push({ name: parsed.name, title: "Credits converted", ref, lines: [["Producer wallet", a.to], ["Credits", units(a.units)]] });
        break;
      case "CreditsBurned":
        events.push({ name: parsed.name, title: "Credits redeemed against a bill", ref, lines: [["Consumer wallet", a.from], ["Credits burned", units(a.units)]] });
        break;
      case "ListingCreated":
        events.push({ name: parsed.name, title: "Listing created (credits escrowed)", ref, lines: [["Listing #", String(a.listingId)], ["Seller wallet", a.seller], ["Credits", units(a.units)], ["Price per credit", rupees(a.pricePerCredit)]] });
        break;
      case "ListingCancelled":
        events.push({ name: parsed.name, title: "Listing cancelled (credits returned)", ref, lines: [["Listing #", String(a.listingId)]] });
        break;
      case "TradeExecuted":
        events.push({ name: parsed.name, title: "Trade executed", ref, lines: [["Listing #", String(a.listingId)], ["Seller wallet", a.seller], ["Buyer wallet", a.buyer], ["Credits", units(a.units)], ["Price per credit", rupees(a.pricePerCredit)], ["Total", rupees(a.totalPaise)]] });
        break;
    }
  }
  return {
    status: receipt.status === 1 ? "success" : "reverted",
    block: receipt.blockNumber,
    timestamp: block?.timestamp ?? 0,
    from: tx.from,
    to: tx.to,
    toOurContract: (tx.to ?? "").toLowerCase() === ours,
    events,
  };
}

/** Credits the chain holds for a wallet (contract units are hundredths). */
export async function onChainBalance(address: string): Promise<number | null> {
  if (!chainReadable) return null;
  try {
    const c = new ethers.Contract(chainConfig.contract, FULL_ABI, getProvider());
    return Number(await c.balanceOf(address)) / 100;
  } catch { return null; }
}
