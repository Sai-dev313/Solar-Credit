import { useState } from "react";
import type { MarketListing } from "../../../data";
import { Button, Card, Empty, Field, INPUT, Modal, PanelHeader, Ph, Pill, Spinner, useToast } from "../../../components/ui";
import { credits as fmt, dateTime, inr } from "../../../lib/format";
import { useApp, useLoad } from "../../auth/AppProvider";

export function MarketPanel() {
  const { api, profile, afterAction } = useApp();
  const toast = useToast();
  const market = useLoad((a) => a.market());
  const mine = useLoad((a) => a.myListings());
  const [view, setView] = useState<"browse" | "sell">("browse");
  const [buying, setBuying] = useState<MarketListing | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  if (!profile) return null;

  const producer = profile.role === "producer";
  const q = Number(qty), p = Number(price);
  const sellOk = qty !== "" && price !== "" && q > 0 && q <= profile.credits && p > 0 && p <= 1000;
  const rows = market.data ?? [];
  const avg = rows.length ? rows.reduce((s, l) => s + l.price_per_credit, 0) / rows.length : 0;

  async function buy() {
    if (!buying) return;
    setBusy("buy");
    const r = await api.buyListing(buying.id);
    if (r.ok) { toast.ok(`Purchased ${fmt(buying.credits)} credits`); setBuying(null); await afterAction(); } else toast.err(r.message);
    setBusy(null);
  }
  async function sell() {
    setBusy("sell");
    const r = await api.createListing(q, p);
    if (r.ok) { toast.ok("Listing is live. Your credits are held in escrow."); setQty(""); setPrice(""); setView("browse"); await afterAction(); } else toast.err(r.message);
    setBusy(null);
  }
  async function cancel(id: string) {
    setBusy(id);
    const r = await api.cancelListing(id);
    r.ok ? (toast.ok(r.message), await afterAction()) : toast.err(r.message);
    setBusy(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <PanelHeader icon="storefront" title={producer ? "Marketplace" : "Buy Credits"} subtitle="Peer-to-peer solar credits, priced by the producers themselves"
          right={
            <div className="flex items-center gap-3">
              {rows.length > 0 && <Pill>Avg ₹{avg.toFixed(2)} / credit</Pill>}
              {producer && (
                <div className="inline-flex rounded-lg border border-emerald-700/20 bg-white/60 p-0.5" role="tablist">
                  {(["browse", "sell"] as const).map((t) => (
                    <button key={t} role="tab" aria-selected={view === t} onClick={() => setView(t)}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold ${view === t ? "bg-emerald-700 text-white" : "text-gray-700 hover:text-emerald-900"}`}>{t === "browse" ? "Browse" : "Sell credits"}</button>
                  ))}
                </div>
              )}
            </div>} />

        {view === "browse" && (market.loading ? <Spinner /> : rows.length === 0 ? (
          <Empty icon="storefront" title="No listings right now" body={producer ? "List some of your credits and they will appear here." : "Check back soon, producers add listings every day."} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((l) => (
              <div key={l.id} className="flex flex-col rounded-xl border border-emerald-900/10 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700"><Ph n="user" />{l.seller_name}</span><span>{dateTime(l.created_at)}</span>
                </div>
                <p className="num mt-3 text-3xl font-extrabold tracking-tight text-[#0a5c2d]">{fmt(l.credits)}<span className="ml-1 text-xs font-medium text-gray-500">credits</span></p>
                <p className="num mt-1 text-sm text-gray-600">{inr(l.price_per_credit)} each · <b className="text-gray-900">{inr(l.total)}</b></p>
                <div className="mt-2"><Pill tone="blue"><Ph n="lock-simple" /> Escrowed on-chain</Pill></div>
                <div className="mt-auto pt-4">
                  {l.is_mine ? <Pill tone="gray">Your listing</Pill>
                    : <Button className="w-full" onClick={() => setBuying(l)} disabled={profile.cash < l.total}>{profile.cash < l.total ? "Not enough cash" : "Buy now"}</Button>}
                </div>
              </div>
            ))}
          </div>
        ))}

        {view === "sell" && producer && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Field label="Credits to sell" hint={`You have ${fmt(profile.credits)} credits`} suffix="credits"><input className={INPUT + " num"} type="number" min={0} step="0.01" value={qty} onChange={(e) => setQty(e.target.value)} /></Field>
              <Field label="Price per credit" hint="Between ₹0.01 and ₹1000" suffix="INR"><input className={INPUT + " num"} type="number" min={0} max={1000} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
              <div className="flex items-center justify-between rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-4">
                <span className="text-sm font-semibold text-gray-600">You will receive</span><span className="num text-xl font-extrabold text-emerald-800">{inr(sellOk ? q * p : 0)}</span>
              </div>
              <Button className="w-full" onClick={sell} loading={busy === "sell"} disabled={!sellOk}><Ph n="tag" />Create listing</Button>
              <p className="text-xs text-gray-500">Listed credits are held in escrow, on the blockchain too, until they sell or you cancel.</p>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-bold text-gray-800">Your listings</h4>
              {mine.loading ? <Spinner /> : (mine.data ?? []).length === 0 ? <p className="rounded-lg bg-[#f4f7f5] p-4 text-sm text-gray-500">No listings yet.</p> : (
                <ul className="divide-y divide-emerald-900/10 rounded-lg border border-emerald-900/10 bg-white/70">
                  {(mine.data ?? []).map((l) => (
                    <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                      <div><p className="num text-sm font-bold">{fmt(l.credits)} credits <span className="font-medium text-gray-600">at {inr(l.price_per_credit)}</span></p><p className="text-xs text-gray-500">{dateTime(l.created_at)}</p></div>
                      {l.status === "active" ? <Button variant="danger" className="px-3 py-1.5 text-xs" loading={busy === l.id} onClick={() => cancel(l.id)}>Cancel</Button>
                        : <Pill tone={l.status === "sold" ? "green" : "gray"}>{l.status === "sold" ? "Sold" : "Cancelled"}</Pill>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Card>

      <Modal open={!!buying} onClose={() => setBuying(null)} title="Confirm purchase">
        {buying && (
          <>
            <dl className="num space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-600">Seller</dt><dd className="font-semibold">{buying.seller_name}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">Credits</dt><dd className="font-semibold">{fmt(buying.credits)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">Price per credit</dt><dd className="font-semibold">{inr(buying.price_per_credit)}</dd></div>
              <div className="flex justify-between border-t border-emerald-900/10 pt-2 text-base"><dt className="font-bold">Total</dt><dd className="font-bold">{inr(buying.total)}</dd></div>
            </dl>
            <div className="mt-5 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setBuying(null)}>Cancel</Button>
              <Button className="flex-1" loading={busy === "buy"} onClick={buy}>Pay {inr(buying.total)}</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
