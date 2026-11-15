import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Ph } from "../../components/ui";
import { chainConfig, chainReadable, txUrl, verifyTx, type Verification } from "../../lib/chain";

type State = { kind: "loading" } | { kind: "notfound" } | { kind: "error"; msg: string } | { kind: "ok"; v: Verification };

const Box = ({ tone = "plain", children }: { tone?: "plain" | "ok" | "bad"; children: React.ReactNode }) => (
  <div className={`mt-4 rounded-xl border p-5 shadow-sm md:p-6 ${tone === "ok" ? "border-emerald-200 bg-emerald-50" : tone === "bad" ? "border-red-200 bg-red-50" : "border-emerald-900/10 bg-white"}`}>{children}</div>
);

/** Public page: reads the transaction from the blockchain, never from our database. */
export function ProofPage() {
  const { hash = "" } = useParams();
  const [s, setS] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!chainReadable) return;
    let live = true;
    verifyTx(hash)
      .then((v) => live && setS(v ? { kind: "ok", v } : { kind: "notfound" }))
      .catch((e: Error) => live && setS({ kind: "error", msg: e.message }));
    return () => { live = false; };
  }, [hash]);

  const ext = txUrl(hash);
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src="/logo.png" alt="" className="h-9 w-9 rounded-xl" /><span className="font-headline-sm text-headline-sm tracking-tight">SolarCredit</span></Link>
          <Link to="/app?tab=ledger" className="text-sm font-semibold text-primary hover:underline">Back to ledger</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg">Blockchain proof</h1>
        <p className="mt-1 break-all font-mono text-xs text-outline">{hash}</p>

        {!chainReadable ? (
          <Box><Ph n="warning" className="text-3xl text-amber-600" /><h2 className="mt-2 text-lg font-bold">{chainConfig.simulated ? "This is a simulated demo record" : "Blockchain reading is not configured"}</h2>
            <p className="mt-1 text-on-surface-variant">{chainConfig.simulated ? "Offline demo mode generates placeholder hashes, so there is nothing on a real chain to verify. Run with a local node or the production build to see real proofs." : "Set VITE_RPC_URL and VITE_CONTRACT_ADDRESS to enable verification."}</p></Box>
        ) : s.kind === "loading" ? (
          <Box><div className="flex items-center gap-3 text-on-surface-variant"><Ph n="spinner-gap" className="animate-spin text-xl" />Reading {chainConfig.name}…</div></Box>
        ) : s.kind === "notfound" ? (
          <Box><Ph n="magnifying-glass" className="text-3xl text-outline" /><h2 className="mt-2 text-lg font-bold">Transaction not found</h2><p className="mt-1 text-on-surface-variant">{chainConfig.name} has no transaction with this hash. It may still be confirming, so try again in a minute.</p></Box>
        ) : s.kind === "error" ? (
          <Box tone="bad"><Ph n="warning-circle" className="text-3xl text-red-600" /><h2 className="mt-2 text-lg font-bold">Could not reach the blockchain</h2><p className="mt-1 text-on-surface-variant">{s.msg}</p></Box>
        ) : (
          <>
            <Box tone={s.v.status === "success" && s.v.toOurContract ? "ok" : "bad"}>
              <div className="flex items-start gap-3">
                <Ph n={s.v.status === "success" && s.v.toOurContract ? "seal-check" : "warning"} bold={false} className={`text-4xl ${s.v.status === "success" && s.v.toOurContract ? "text-primary" : "text-red-600"}`} />
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{s.v.status === "success" && s.v.toOurContract ? "Verified on the blockchain" : "This transaction is not a valid SolarCredit record"}</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">Confirmed on {chainConfig.name} in block <b className="num">{s.v.block.toLocaleString()}</b>{s.v.timestamp ? ` on ${new Date(s.v.timestamp * 1000).toLocaleString("en-IN")}` : ""}.</p>
                </div>
              </div>
            </Box>
            {s.v.events.map((ev, i) => (
              <Box key={i}>
                <h3 className="text-lg font-bold">{ev.title}</h3>
                <dl className="mt-3 divide-y divide-emerald-900/10 text-sm">
                  {ev.lines.map(([k, v]) => <div key={k} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between sm:gap-4"><dt className="text-on-surface-variant">{k}</dt><dd className="break-all font-semibold sm:text-right">{v}</dd></div>)}
                  <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between sm:gap-4"><dt className="text-on-surface-variant">Database record id</dt><dd className="break-all font-mono text-xs sm:text-right">{ev.ref}</dd></div>
                </dl>
              </Box>
            ))}
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-on-surface-variant">
              <span>Sent by the platform signer <span className="font-mono">{s.v.from.slice(0, 8)}…{s.v.from.slice(-6)}</span></span>
              {ext && <a href={ext} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">Open in block explorer <Ph n="arrow-square-out" /></a>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
