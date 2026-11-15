import { Card, Empty, Ph, Spinner } from "../../../components/ui";
import { credits as fmt, dateOnly, inr } from "../../../lib/format";
import { useApp, useLoad } from "../../auth/AppProvider";

export function HistoryPanel() {
  const { profile } = useApp();
  const bills = useLoad((a) => a.bills());
  const trades = useLoad((a) => a.trades());
  if (!profile) return null;

  const b = bills.data ?? [], t = trades.data ?? [];
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden !p-0">
        <div className="border-b border-emerald-900/10 p-5"><h3 className="text-base font-bold tracking-tight md:text-lg">Electricity bill payments</h3></div>
        {bills.loading ? <Spinner /> : b.length === 0 ? <Empty icon="receipt" title="No payments yet" /> : (
          <ul className="divide-y divide-emerald-900/10">
            {b.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div className="flex items-center gap-3"><Ph n="check-circle" className="text-xl text-emerald-600" /><div><p className="text-sm font-bold">{x.provider}</p><p className="text-xs text-gray-500">{x.billing_month} · {dateOnly(x.created_at)}</p></div></div>
                <div className="num text-right text-sm"><p className="font-bold">{inr(x.bill_amount)}</p><p className="text-xs text-emerald-700">{fmt(x.credits_used)} credits saved {inr(x.credit_savings)}</p></div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="overflow-hidden !p-0">
        <div className="border-b border-emerald-900/10 p-5"><h3 className="text-base font-bold tracking-tight md:text-lg">Marketplace trades</h3></div>
        {trades.loading ? <Spinner /> : t.length === 0 ? <Empty icon="storefront" title="No trades yet" /> : (
          <ul className="divide-y divide-emerald-900/10">
            {t.map((x) => {
              const sold = x.seller_id === profile.id;
              return (
                <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div className="flex items-center gap-3"><Ph n={sold ? "arrow-up-right" : "arrow-down-left"} className={`text-xl ${sold ? "text-emerald-600" : "text-sky-600"}`} /><div><p className="text-sm font-bold">{sold ? "Sold" : "Bought"} {fmt(x.credits)} credits</p><p className="text-xs text-gray-500">{dateOnly(x.created_at)}</p></div></div>
                  <p className="num text-sm font-bold">{sold ? "+" : "−"}{inr(x.total_price)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
