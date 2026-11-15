import { useState } from "react";
import { Button, Card, INPUT, Field, Ph, useToast } from "../../../components/ui";
import { credits as fmt, unitWord, units } from "../../../lib/format";
import { useApp, useLoad } from "../../auth/AppProvider";

export function LogEnergyPanel() {
  const { api, afterAction } = useApp();
  const toast = useToast();
  const logs = useLoad((a) => a.energyLogs());
  const [gen, setGen] = useState("");
  const [used, setUsed] = useState("");
  const [busy, setBusy] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const todays = (logs.data ?? []).find((l) => l.log_date === today);
  const g = Number(gen), u = Number(used);
  const valid = gen !== "" && used !== "" && g >= 0 && u >= 0 && g <= 10000 && u <= 10000;
  const net = valid ? Math.max(g - u, 0) : 0;

  async function save() {
    setBusy(true);
    const r = await api.logEnergy(g, u);
    if (r.ok) { toast.ok(`Logged +${units(net)} net surplus into the conversion pool`); await afterAction(); }
    else toast.err(r.message);
    setBusy(false);
  }

  // Waiting for the first load: show nothing rather than flashing the form.
  if (logs.loading) return null;

  // Today is already logged: show a read-only summary. No form, no buttons, so it cannot be logged twice.
  if (todays) {
    const when = new Date(`${todays.log_date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return (
      <div className="space-y-6">
        <Card className="bg-white">
          <div className="mb-6">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d6fdeb] text-[#016948]"><Ph n="sun-dim" className="text-xl" /></div>
              <h2 className="text-lg font-bold tracking-tight text-[#141b2e] md:text-xl">Log Today’s Energy</h2>
            </div>
            <p className="mt-1 text-xs text-gray-500 md:text-sm">You’ve already logged your energy for today</p>
          </div>
          <div className="rounded-xl border border-[#ebedff] bg-[#f2f3ff]/60 p-4 md:p-5">
            <div className="mb-4 flex items-center space-x-2 text-sm text-gray-600"><Ph n="sun-dim" className="text-base" /><span>Energy logged on {when}</span></div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="num text-2xl font-extrabold text-[#016948] md:text-3xl">{fmt(todays.generated)}</p><p className="mt-1 text-xs text-gray-600">{unitWord(todays.generated) === "unit" ? "Unit" : "Units"} Generated</p></div>
              <div><p className="num text-2xl font-extrabold text-[#141b2e] md:text-3xl">{fmt(todays.used)}</p><p className="mt-1 text-xs text-gray-600">{unitWord(todays.used) === "unit" ? "Unit" : "Units"} Used at Home</p></div>
              <div><p className="num text-2xl font-extrabold text-[#016948] md:text-3xl">{fmt(todays.exported)}</p><p className="mt-1 text-xs text-gray-600">{unitWord(todays.exported) === "unit" ? "Unit" : "Units"} Sent to Grid</p></div>
            </div>
            <div className="mt-4 border-t border-[#ebedff] pt-4 text-center text-sm text-gray-600">
              Energy sent to grid: <b className="num text-[#141b2e]">{units(todays.exported)}</b> <Ph n="arrow-right" className="mx-1 text-sm" />
              <b className="num text-[#016948]">{fmt(todays.exported)} {todays.exported === 1 ? "credit" : "credits"}</b> <span className="text-xs text-gray-500">(1 unit = 1 credit)</span>
            </div>
            <p className="mt-4 border-t border-[#ebedff] pt-4 text-center text-sm text-gray-600">✓ Today’s energy has been logged. Come back tomorrow to log again!</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/60">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700/10 text-emerald-800"><Ph n="sun-dim" className="text-xl" /></div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900 md:text-xl">Log Today’s Energy</h2>
            </div>
            <p className="mt-1 text-xs text-gray-500 md:text-sm">Readings come from your smart meter. Press “Simulate Smart Meter Feed”, then log them</p>
          </div>
          <button type="button" onClick={() => { setGen((24 + Math.random() * 8).toFixed(1)); setUsed((11 + Math.random() * 4).toFixed(1)); }}
            className="inline-flex items-center space-x-2 self-start rounded-lg border border-emerald-700/20 bg-white/70 px-3.5 py-2 text-xs font-semibold text-gray-800 hover:border-emerald-700/40 hover:bg-white hover:text-emerald-900 sm:self-auto md:text-sm">
            <Ph n="lightning" className="animate-pulse text-sm text-emerald-700" /><span>Simulate Smart Meter Feed</span>
          </button>
        </div>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <Field label="Power Generated (units)" suffix="units"><input className={INPUT + " font-mono cursor-not-allowed select-none"} type="text" readOnly tabIndex={-1} aria-readonly="true" placeholder="From your smart meter" value={gen} /></Field>
          <Field label="Power Used at Home (units)" suffix="units"><input className={INPUT + " font-mono cursor-not-allowed select-none"} type="text" readOnly tabIndex={-1} aria-readonly="true" placeholder="From your smart meter" value={used} /></Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" onClick={save} loading={busy} disabled={!valid}><Ph n="sun-dim" />Log Energy</Button>
          {valid && <span className="text-sm text-gray-600">Sent to the grid: <b className="num text-emerald-800">{units(net)}</b></span>}
        </div>
      </Card>
    </div>
  );
}
