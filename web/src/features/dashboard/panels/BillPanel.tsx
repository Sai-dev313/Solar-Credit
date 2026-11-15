import { useState } from "react";
import type { BillInput, RpcResult } from "../../../data";
import { Button, Card, Field, INPUT, PanelHeader, Ph, useToast } from "../../../components/ui";
import { credits as fmt, inr } from "../../../lib/format";
import { useApp } from "../../auth/AppProvider";

const PROVIDERS = ["MSEDCL (Maharashtra)", "Tata Power", "BSES Rajdhani (Delhi)", "BESCOM (Karnataka)", "TNEB (Tamil Nadu)", "WBSEDCL (West Bengal)", "UPPCL (Uttar Pradesh)", "PSPCL (Punjab)"];
/** How each electricity provider prints the number on a bill: its label, allowed length(s) and format. */
interface Rule { label: string; max: number; alnum?: boolean; test: (v: string) => boolean; hint: string; example: string }
const RULES: Record<string, Rule> = {
  "MSEDCL (Maharashtra)": { label: "Consumer Number", max: 12, test: (v) => /^\d{12}$/.test(v), hint: "12 digits", example: "170250012345" },
  "Tata Power": { label: "Consumer Number / CA No.", max: 11, test: (v) => /^(\d{9}|\d{11})$/.test(v), hint: "9 digits (Mumbai) or 11 digits (Delhi CA number)", example: "123456789" },
  "BSES Rajdhani (Delhi)": { label: "CA Number", max: 9, test: (v) => /^\d{9}$/.test(v), hint: "9 digits, printed on the top right of the bill", example: "123456789" },
  "BESCOM (Karnataka)": { label: "Account ID", max: 10, test: (v) => /^(\d{10}|\d{7})$/.test(v), hint: "10 digits (some older rural connections use 7)", example: "1234567890" },
  "TNEB (Tamil Nadu)": { label: "Service / Consumer No.", max: 12, test: (v) => /^\d{12}$/.test(v), hint: "12 digits", example: "123456789012" },
  "WBSEDCL (West Bengal)": { label: "Consumer ID", max: 9, test: (v) => /^\d{9}$/.test(v), hint: "9 digits, near the top of the bill", example: "123456789" },
  "UPPCL (Uttar Pradesh)": { label: "Account Number", max: 10, test: (v) => /^\d{10}$/.test(v), hint: "10 digits", example: "1234567890" },
  "PSPCL (Punjab)": { label: "Account Number", max: 10, alnum: true, test: (v) => /^\d{10}$/.test(v) || /^[A-Z0-9]{8}$/.test(v), hint: "10 digits, usually starting with 300 (older accounts: 8 letters or digits)", example: "3001234567" },
};
/** Keep only the characters this provider allows (digits, or letters+digits for older PSPCL accounts) and cap the length. */
const cleanNumber = (provider: string, raw: string) => {
  const r = RULES[provider];
  return (r.alnum ? raw.toUpperCase().replace(/[^A-Z0-9]/g, "") : raw.replace(/\D/g, "")).slice(0, r.max);
};
const NAMES = ["Ramesh Kulkarni", "Priya Sharma", "Suresh Patil", "Anita Deshmukh", "Vijay Reddy", "Meera Iyer", "Rajesh Nair", "Sunita Joshi"];
const SAVE_PER_CREDIT = 2;

interface DemoBill extends Omit<BillInput, "creditsToUse"> { total: number; due: string }
interface Receipt { id: string; bill: DemoBill; credits: number; savings: number; upi: number }
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function makeBill(provider: string, consumerNumber: string): DemoBill {
  const units = 120 + Math.floor(Math.random() * 181), rate = 6, now = new Date();
  return {
    provider, consumerNumber, consumerName: pick(NAMES), units, rate,
    meterNumber: `MR${1000000 + Math.floor(Math.random() * 9000000)}`,
    billingMonth: now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    total: units * rate,
    due: new Date(now.getTime() + 15 * 864e5).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  };
}

export function BillPanel() {
  const { api, profile, afterAction } = useApp();
  const toast = useToast();
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [consumerNo, setConsumerNo] = useState("");
  const [bill, setBill] = useState<DemoBill | null>(null);
  const [use, setUse] = useState(0);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  if (!profile) return null;

  const rule = RULES[provider];
  const numberOk = rule.test(consumerNo);

  const maxUse = bill ? Math.min(Math.floor(profile.credits * 100) / 100, bill.total / SAVE_PER_CREDIT) : 0;
  const savings = use * SAVE_PER_CREDIT;
  const upi = bill ? Math.max(bill.total - savings, 0) : 0;

  async function pay() {
    if (!bill) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900)); // simulated UPI processing
    const r: RpcResult = await api.payBill({ ...bill, creditsToUse: use });
    setBusy(false);
    if (!r.ok) { toast.err(r.message); return; }
    setReceipt({ id: String(r.receipt_id), bill, credits: Number(r.credits_applied), savings: Number(r.savings), upi: Number(r.upi_paid) });
    setBill(null); setUse(0);
    await afterAction();
  }

  return (
    <Card>
      <PanelHeader icon="lightning" title="Pay Electricity Bill" subtitle="Spend credits at ₹2 each and pay the rest by UPI. Bills and UPI are simulated in this project." />

      {receipt ? (
        <div className="mx-auto max-w-lg">
          <div className="flex flex-col items-center text-center">
            <Ph n="check-circle" bold={false} className="text-6xl text-emerald-600" />
            <h4 className="mt-2 text-2xl font-extrabold tracking-tight">Payment successful</h4>
            <p className="text-sm text-gray-500">Receipt {receipt.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <dl className="num mt-5 space-y-2 text-sm">
            {([["Provider", receipt.bill.provider], ["Consumer", `${receipt.bill.consumerName} · ${receipt.bill.consumerNumber}`], ["Billing month", receipt.bill.billingMonth], ["Bill amount", inr(receipt.bill.total)], ["Credits applied", `${fmt(receipt.credits)} credits`], ["Saved with credits", inr(receipt.savings)]] as const).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4"><dt className="text-gray-600">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
            ))}
            <div className="flex justify-between border-t border-emerald-900/10 pt-2 text-base"><dt className="font-bold">Paid via UPI</dt><dd className="font-bold">{inr(receipt.upi)}</dd></div>
          </dl>
          <p className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-center text-xs font-medium text-sky-700">The credits you spent were burned on the blockchain. See the Blockchain Ledger tab.</p>
          <div className="mt-5 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => window.print()}><Ph n="printer" />Print</Button>
            <Button className="flex-1" onClick={() => setReceipt(null)}>Pay another bill</Button>
          </div>
        </div>
      ) : !bill ? (
        <form className="mx-auto max-w-lg space-y-4" onSubmit={(e) => { e.preventDefault(); if (numberOk) setBill(makeBill(provider, consumerNo)); }}>
          <Field label="Electricity provider"><select className={INPUT} value={provider} onChange={(e) => { setProvider(e.target.value); setConsumerNo(""); }}>{PROVIDERS.map((p) => <option key={p}>{p}</option>)}</select></Field>
          <Field label={rule.label} hint={consumerNo && !numberOk ? `Not complete yet: ${rule.hint}` : rule.hint}>
            <input className={INPUT + " num"} required inputMode={rule.alnum ? "text" : "numeric"} autoComplete="off" maxLength={rule.max}
              placeholder={`e.g. ${rule.example}`} value={consumerNo} aria-invalid={consumerNo !== "" && !numberOk}
              onChange={(e) => setConsumerNo(cleanNumber(provider, e.target.value))} />
          </Field>
          <Button type="submit" className="w-full" disabled={!numberOk}><Ph n="receipt" />Fetch bill</Button>
        </form>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-emerald-900/10 bg-white/70 p-4">
            <h4 className="font-bold">{bill.provider}</h4>
            <p className="mb-3 text-xs text-gray-500">Bill for {bill.billingMonth} · due {bill.due}</p>
            <dl className="num space-y-2 text-sm">
              {([["Consumer", bill.consumerName], ["Consumer no.", bill.consumerNumber], ["Meter no.", bill.meterNumber], ["Units consumed", `${bill.units} ${bill.units === 1 ? "unit" : "units"}`], ["Rate", `${inr(bill.rate)} / unit`]] as const).map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-gray-600">{k}</dt><dd className="font-semibold">{v}</dd></div>))}
              <div className="flex justify-between border-t border-emerald-900/10 pt-2 text-lg"><dt className="font-bold">Amount due</dt><dd className="font-extrabold">{inr(bill.total)}</dd></div>
            </dl>
            <Button variant="ghost" className="mt-4" onClick={() => { setBill(null); setUse(0); }}>Use a different bill</Button>
          </div>
          <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-4">
            <h4 className="font-bold">Apply credits</h4>
            <p className="mb-4 text-xs text-gray-600">You have <b>{fmt(profile.credits)}</b> credits. Each is worth {inr(SAVE_PER_CREDIT)}.</p>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="use">Credits to use: <span className="num">{fmt(use)}</span></label>
            <input id="use" type="range" min={0} max={maxUse} step={0.5} value={use} disabled={maxUse <= 0} onChange={(e) => setUse(Number(e.target.value))} className="w-full accent-emerald-700" />
            <div className="num mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Saved with credits</span><b className="text-emerald-700">− {inr(savings)}</b></div>
              <div className="flex justify-between border-t border-emerald-200 pt-2 text-lg"><span className="font-bold">Pay by UPI</span><b>{inr(upi)}</b></div>
            </div>
            <Button className="mt-4 w-full" loading={busy} onClick={pay}><Ph n="device-mobile" />Pay {inr(upi)}</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
