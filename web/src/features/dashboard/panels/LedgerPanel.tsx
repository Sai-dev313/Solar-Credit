import { useState } from "react";
import { Button, Card, Empty, PanelHeader, Ph, Pill, Spinner } from "../../../components/ui";
import { TxLink } from "../../../components/TxLink";
import { addressUrl, chainConfig } from "../../../lib/chain";
import { dateTime, shortHash } from "../../../lib/format";
import { useApp, useLoad } from "../../auth/AppProvider";
import { describeEvent } from "../../ledger/describe";

const KIND_LABEL: Record<string, string> = { MINT: "CONVERT" }; // the stored kind stays MINT; this is only the on-screen word
const tone = { MINT: "green", LIST: "blue", CANCEL: "gray", TRADE: "amber", BURN: "red" } as const;

export function LedgerPanel() {
  const { profile, api, refresh } = useApp();
  const events = useLoad((a) => a.chainEvents());
  const [syncing, setSyncing] = useState(false);
  if (!profile) return null;
  const list = events.data ?? [];
  const confirmed = list.filter((e) => e.status === "confirmed").length;
  const link = chainConfig.contract ? addressUrl(chainConfig.contract) : null;

  return (
    <Card>
      <PanelHeader icon="link" title="Blockchain Ledger" subtitle="Every credit you convert, list, trade or redeem is written to a public blockchain. Open a record to verify it independently."
        right={<Button variant="ghost" className="px-3 py-2 text-xs" loading={syncing} onClick={async () => { setSyncing(true); await api.syncChain(); await refresh(); setSyncing(false); }}><Ph n="arrows-clockwise" />Sync now</Button>} />
      <div className="mb-5 grid gap-3 rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-4 text-sm sm:grid-cols-3">
        <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Network</p><p className="mt-0.5 font-semibold">{chainConfig.simulated ? "Simulated (demo)" : chainConfig.name}</p></div>
        <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Smart contract</p>
          {chainConfig.contract ? <p className="mt-0.5 flex items-center gap-2 font-mono text-xs font-medium">{shortHash(chainConfig.contract, 10, 8)}{link && <a href={link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900" aria-label="Open contract in explorer"><Ph n="arrow-square-out" /></a>}</p> : <p className="mt-0.5 font-semibold">Not configured</p>}</div>
        <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Records</p><p className="num mt-0.5 font-semibold">{confirmed} confirmed · {list.length - confirmed} waiting</p></div>
      </div>
      {events.loading ? <Spinner /> : list.length === 0 ? <Empty icon="link" title="No blockchain records yet" body="Convert energy to credits, list or buy some, and the records appear here." /> : (
        <ul className="divide-y divide-emerald-900/10 rounded-lg border border-emerald-900/10 bg-white/70">
          {list.map((e) => (
            <li key={e.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2"><Pill tone={tone[e.kind]}>{KIND_LABEL[e.kind] ?? e.kind}</Pill><span className="text-xs text-gray-500">{dateTime(e.created_at)}</span></div>
                <p className="text-sm font-semibold">{describeEvent(e, profile.id)}</p>
                {e.status === "pending" && e.last_error && <p className="mt-1 text-xs text-gray-500">Will retry: {e.last_error}</p>}
              </div>
              <TxLink ev={e} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
