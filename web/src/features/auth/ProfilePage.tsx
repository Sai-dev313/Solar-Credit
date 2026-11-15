import { useState } from "react";
import { Button, Card, Field, INPUT, PanelHeader, Ph, useToast } from "../../components/ui";
import { addressUrl } from "../../lib/chain";
import { useApp } from "./AppProvider";

export function ProfilePage() {
  const { api, profile, session, refresh } = useApp();
  const toast = useToast();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [busy, setBusy] = useState(false);
  if (!profile || !session) return null;
  const ext = profile.wallet_address ? addressUrl(profile.wallet_address) : null;

  return (
    <>
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-gray-600 md:text-base">Your account and the wallet the platform keeps for you on the blockchain</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <PanelHeader icon="user" title="Account" />
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault(); setBusy(true);
            try { await api.updateName(name); await refresh(); toast.ok("Name updated"); } catch (er) { toast.err((er as Error).message); } finally { setBusy(false); }
          }}>
            <Field label="Full name"><input className={INPUT} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Email"><input className={INPUT} value={session.email} disabled /></Field>
            <Field label="Role" hint="Your role is fixed when the account is created."><input className={INPUT + " capitalize"} value={profile.role} disabled /></Field>
            <Button type="submit" loading={busy}>Save changes</Button>
          </form>
        </Card>
        <Card>
          <PanelHeader icon="wallet" title="Blockchain wallet" subtitle="A custodial address, so you never need MetaMask or gas. It appears after your first on-chain record." />
          {profile.wallet_address ? (
            <>
              <p className="break-all rounded-lg bg-[#f4f7f5] p-3 font-mono text-sm">{profile.wallet_address}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" onClick={() => { void navigator.clipboard?.writeText(profile.wallet_address!); toast.ok("Address copied"); }}><Ph n="copy" />Copy</Button>
                {ext && <a href={ext} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-emerald-700/20 bg-white/70 px-5 py-2.5 text-sm font-semibold hover:bg-white"><Ph n="arrow-square-out" />Explorer</a>}
              </div>
            </>
          ) : <p className="rounded-lg bg-[#f4f7f5] p-3 text-sm text-gray-600">No wallet yet. Earn or trade credits to create one.</p>}
        </Card>
      </div>
    </>
  );
}
