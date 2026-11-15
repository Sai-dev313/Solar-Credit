import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Ph, useToast } from "../../components/ui";
import type { Role } from "../../data";
import { useApp } from "./AppProvider";

const OPTIONS: { role: Role; title: string; sub: string; icon: string }[] = [
  { role: "producer", title: "Producer", sub: "I have solar panels. I log my surplus, earn credits and can sell them.", icon: "sun-dim" },
  { role: "consumer", title: "Consumer", sub: "I want to save. I buy credits and use them to pay my electricity bill.", icon: "lightning" },
];

/**
 * Shown once, right after a first sign-in that did not carry a role (Sign in with Google).
 * The choice is saved by the database function choose_role and cannot be changed afterwards.
 */
export function ChooseRole() {
  const { api, profile, refresh } = useApp();
  const toast = useToast();
  const nav = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!role) return;
    setBusy(true);
    try {
      const r = await api.chooseRole(role);
      if (!r.ok) { toast.err(r.message); return; }
      await refresh(); // the profile now says role_chosen, so the dashboard opens
    } catch (e) {
      toast.err((e as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#faf8ff] px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-[#141b2e] sm:text-3xl">
          Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          One last step: how will you use SolarCredit? <b>This choice can’t be changed later.</b>
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Account role">
          {OPTIONS.map((o) => {
            const on = role === o.role;
            return (
              <button key={o.role} type="button" role="radio" aria-checked={on} onClick={() => setRole(o.role)}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${on
                  ? "border-[#016948] bg-[#016948] text-white shadow-md" : "border-[#d9ddf0] bg-white text-gray-800 hover:border-[#016948]/50 hover:bg-[#f2f3ff]"}`}>
                <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${on ? "bg-white/20" : "bg-[#d6fdeb] text-[#016948]"}`}>
                  <Ph n={o.icon} className="text-xl" />
                </span>
                <span className="text-base font-bold">{o.title}</span>
                <span className={`mt-1 text-xs leading-snug ${on ? "text-emerald-50" : "text-gray-600"}`}>{o.sub}</span>
              </button>
            );
          })}
        </div>

        <Button className="mt-6 w-full" onClick={save} loading={busy} disabled={!role}>Continue</Button>
        <button type="button" onClick={async () => { await api.auth.signOut(); nav("/"); }}
          className="mx-auto mt-4 block text-sm font-medium text-gray-500 hover:text-gray-800">Not you? Sign out</button>
      </div>
    </div>
  );
}
