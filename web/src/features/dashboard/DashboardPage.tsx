import { useSearchParams } from "react-router-dom";
import { activeTab } from "./tabs";
import { Ph } from "../../components/ui";
import { credits as fmt, inr } from "../../lib/format";
import { useApp, useLoad } from "../auth/AppProvider";
import { BillPanel } from "./panels/BillPanel";
import { ConvertPanel } from "./panels/ConvertPanel";
import { HistoryPanel } from "./panels/HistoryPanel";
import { LedgerPanel } from "./panels/LedgerPanel";
import { LogEnergyPanel } from "./panels/LogEnergyPanel";
import { MarketPanel } from "./panels/MarketPanel";

const PANELS: Record<string, () => JSX.Element | null> = {
  "log-energy": LogEnergyPanel, "convert-credits": ConvertPanel, marketplace: MarketPanel,
  "pay-bill": BillPanel, "payment-history": HistoryPanel, ledger: LedgerPanel,
};

/** Producer and consumer dashboard: the design's stat cards, tile bar and panels. */
export function DashboardPage() {
  const { profile } = useApp();
  const [params] = useSearchParams();
  const trades = useLoad((a) => a.trades());
  const bills = useLoad((a) => a.bills());
  if (!profile) return null;

  const producer = profile.role === "producer";
  const active = activeTab(profile.role, params.get("tab"));

  const earned = (trades.data ?? []).filter((t) => t.seller_id === profile.id).reduce((s, t) => s + t.total_price, 0);
  const saved = (bills.data ?? []).reduce((s, b) => s + b.credit_savings, 0);
  const second = producer
    ? { label: "Earned by Credits", value: inr(earned).replace(".00", ""), unit: "INR" }
    : { label: "Saved on Bills", value: inr(saved).replace(".00", ""), unit: "INR" };

  const Panel = PANELS[active];

  return (
    <>
      <header className="mb-6 md:mb-8" data-purpose="dashboard-header">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#141b2e] md:text-3xl">{producer ? "Producer" : "Consumer"} Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 md:text-base">{producer ? "Track your solar energy and earn credits" : "Buy clean credits and cut your electricity bill"}</p>
      </header>

      <section aria-label="Credit Metrics" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6" data-purpose="metric-cards">
        <div className="group flex cursor-default items-center justify-between rounded-2xl border border-[#ebedff] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg md:p-6">
          <div>
            <div className="flex items-center space-x-2"><span className="h-2 w-2 animate-pulse rounded-full bg-[#016948]" /><span className="text-xs font-semibold uppercase tracking-wide text-gray-600 md:text-sm">Credits Balance</span></div>
            <div className="mt-2 flex items-baseline space-x-1.5"><span className="num text-3xl font-extrabold tracking-tight text-[#141b2e] transition-colors group-hover:text-[#016948] md:text-4xl">{fmt(profile.credits)}</span></div>
          </div>
          <div className="flex items-center justify-center rounded-xl bg-[#d6fdeb] p-3 transition-all duration-300 group-hover:scale-105 group-hover:bg-[#c1f5e4]"><Ph n="coins" bold={false} className="ph-duotone text-2xl text-[#016948]" /></div>
        </div>
        <div className="group flex cursor-default items-center justify-between rounded-2xl border border-[#ebedff] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg md:p-6">
          <div>
            <div className="flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-[#016948]" /><span className="text-xs font-semibold uppercase tracking-wide text-gray-600 md:text-sm">{second.label}</span></div>
            <div className="mt-2 flex items-baseline space-x-0.5"><span className="num text-3xl font-extrabold tracking-tight text-[#141b2e] md:text-4xl">{second.value}</span><span className="ml-1.5 text-xs font-medium text-gray-500">{second.unit}</span></div>
          </div>
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-[#d6fdeb] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#c1f5e4]"><span className="text-2xl font-black text-[#016948]">₹</span></div>
        </div>
      </section>

      <div className="tab-enter mb-8" key={active} role="tabpanel"><Panel /></div>
    </>
  );
}
