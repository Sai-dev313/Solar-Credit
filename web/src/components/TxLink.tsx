import { Link } from "react-router-dom";
import type { ChainEvent } from "../data";
import { chainConfig, txUrl } from "../lib/chain";
import { shortHash } from "../lib/format";
import { Ph } from "./ui";

/** Status of one blockchain record, with a link to the independent proof page. */
export function TxLink({ ev }: { ev: Pick<ChainEvent, "status" | "tx_hash"> }) {
  if (ev.status === "confirmed" && ev.tx_hash) {
    const ext = txUrl(ev.tx_hash);
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link to={`/proof/${ev.tx_hash}`} className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-700 hover:text-white">
          <Ph n="seal-check" /> Verified on {chainConfig.simulated ? "demo ledger" : chainConfig.name}
        </Link>
        <span className="font-mono text-[11px] text-gray-500">{shortHash(ev.tx_hash)}</span>
        {ext && <a href={ext} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900" aria-label="Open in block explorer"><Ph n="arrow-square-out" /></a>}
      </span>
    );
  }
  if (ev.status === "failed") {
    return <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700"><Ph n="warning" /> Chain write failed</span>;
  }
  return <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800"><Ph n="clock" /> Writing to blockchain…</span>;
}
