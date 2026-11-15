import { useState } from "react";
import { Button, Card, PanelHeader, Pill, Spinner, useToast, Ph } from "../../../components/ui";
import { credits as fmt, units } from "../../../lib/format";
import { useApp, useLoad } from "../../auth/AppProvider";

export function ConvertPanel() {
  const { api, afterAction } = useApp();
  const toast = useToast();
  const logs = useLoad((a) => a.energyLogs());
  const [busy, setBusy] = useState(false);

  const list = [...(logs.data ?? [])].slice(0, 8).reverse();
  const unclaimed = (logs.data ?? []).reduce((s, l) => s + (l.exported - l.claimed), 0);
  const max = Math.max(1, ...list.map((l) => l.exported));

  async function claim() {
    setBusy(true);
    const r = await api.claimCredits();
    if (r.ok) { toast.ok(`${fmt(Number(r.credits))} credits added to your balance`); await afterAction(); } else toast.err(r.message);
    setBusy(false);
  }

  return (
    <Card>
      <PanelHeader icon="arrows-clockwise" title="Conversion Rate & Yield" subtitle="Daily grid export and the credits converted from it"
        right={<Pill>Ratio: 1 unit = 1 credit</Pill>} />
      <div className="relative w-full rounded-lg border border-emerald-800/10 bg-[#f4f7f5] p-3 md:p-4">
        <div className="mb-2 flex items-center justify-end space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1"><span className="h-3 w-3 rounded bg-emerald-600" /><span className="text-gray-600">Exported units</span></div>
          <div className="flex items-center space-x-1"><span className="h-3 w-3 rounded bg-emerald-300" /><span className="text-gray-600">Credits converted</span></div>
        </div>
        {logs.loading ? <Spinner /> : list.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">No readings yet. Log your energy first.</p>
        ) : (
          <svg className="h-52 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 210" role="img" aria-label="Exported energy and credits converted per day">
            {[40, 90, 140].map((y) => <line key={y} stroke="#e2e8f0" strokeDasharray="4,4" x1="20" x2="690" y1={y} y2={y} />)}
            <line stroke="#e2e8f0" x1="20" x2="690" y1="170" y2="170" />
            {list.map((l, i) => {
              const x = 40 + i * (650 / list.length), bw = Math.min(26, 520 / list.length / 2);
              const h1 = (l.exported / max) * 130, h2 = (l.claimed / max) * 130;
              return (
                <g key={l.id}>
                  <rect fill="#059669" height={h1} rx="3" width={bw} x={x} y={170 - h1}><title>{l.log_date}: {units(l.exported)}</title></rect>
                  <rect fill="#6ee7b7" height={h2} rx="3" width={bw * 0.75} x={x + bw + 3} y={170 - h2}><title>{l.log_date}: {fmt(l.claimed)} credits converted</title></rect>
                  <text fill="#64748b" fontSize="10" textAnchor="middle" x={x + bw} y="188">{l.log_date.slice(5)}</text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-4 sm:flex-row">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Unconverted balance</span>
          <p className="mt-0.5 text-sm font-semibold text-gray-800">{units(unclaimed)} ready to convert <span className="font-bold text-emerald-700">({fmt(unclaimed)} SolarCredits)</span></p>
          <p className="mt-0.5 text-xs text-gray-500">Each conversion is written to the blockchain.</p>
        </div>
        <Button onClick={claim} loading={busy} disabled={unclaimed <= 0}><Ph n="arrows-clockwise" />Convert to credits</Button>
      </div>
    </Card>
  );
}
