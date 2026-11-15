import { createClient } from "@supabase/supabase-js";
import type { BillInput, DataApi, RpcResult, Session } from "./types";
import { mapBill, mapEvent, mapLog, mapMarket, mapMyListing, mapProfile, mapTrade } from "./normalize";

export function createSupabaseApi(url: string, anonKey: string): DataApi {
  const sb = createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } });

  const toSession = (s: { user: { id: string; email?: string } } | null): Session | null =>
    s ? { userId: s.user.id, email: s.user.email ?? "" } : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = async (q: PromiseLike<{ data: any[] | null; error: { message: string } | null }>) => {
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  };

  const call = async (fn: string, args: Record<string, unknown> = {}): Promise<RpcResult> => {
    const { data, error } = await sb.rpc(fn, args);
    if (error) return { ok: false, message: error.message };
    return data as RpcResult;
  };

  // Calling the edge function is best effort: if the chain is down the action has
  // already succeeded in the database and the event stays queued.
  let syncing: Promise<void> | null = null;
  const syncChain = () => {
    if (syncing) return syncing;
    syncing = (async () => {
      try {
        // A full queue is drained in rounds of 5, but never more than 4 rounds per call.
        for (let i = 0; i < 4; i++) {
          const { data, error } = await sb.functions.invoke("chain-sync", { body: {} });
          if (error || !data || !data.pending) break;
        }
      } catch { /* ignore */ }
    })().finally(() => { syncing = null; });
    return syncing;
  };

  return {
    mode: "supabase",
    auth: {
      async session() {
        const { data } = await sb.auth.getSession();
        return toSession(data.session);
      },
      onChange(cb) {
        const { data } = sb.auth.onAuthStateChange((_e, s) => cb(toSession(s)));
        return () => data.subscription.unsubscribe();
      },
      async signUp(email, password, fullName, role) {
        const { data, error } = await sb.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, role }, emailRedirectTo: window.location.origin },
        });
        if (error) return { error: error.message };
        return { needsEmailConfirm: !data.session };
      },
      async signIn(email, password) {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (!error) return {};
        return { error: error.message, unverified: /not confirmed/i.test(error.message) };
      },
      async verifyOtp(email, code) {
        const { error } = await sb.auth.verifyOtp({ email, token: code.trim(), type: "signup" });
        return error ? { error: error.message } : {};
      },
      async resendOtp(email) {
        const { error } = await sb.auth.resend({ type: "signup", email });
        return error ? { error: error.message } : {};
      },
      async google() {
        const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/app" } });
        return error ? { error: error.message } : {};
      },
      async signOut() { await sb.auth.signOut(); },
      async resetPassword(email) {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        return error ? { error: error.message } : {};
      },
    },
    async profile() {
      const { data, error } = await sb.from("profiles").select("id, full_name, role, credits, cash, wallet_address").maybeSingle();
      if (error) throw new Error(error.message); // an error is not "no profile": callers must not treat it as a deleted account
      return data ? mapProfile(data) : null;
    },
    async updateName(name) {
      const { error } = await sb.from("profiles").update({ full_name: name.trim().slice(0, 80) }).not("id", "is", null);
      if (error) throw new Error(error.message);
    },
    async energyLogs() {
      return (await rows(sb.from("energy_logs").select("*").order("log_date", { ascending: false }).limit(60))).map(mapLog);
    },
    async myListings() {
      const uid = (await sb.auth.getSession()).data.session?.user.id;
      return (await rows(sb.from("listings").select("*").eq("seller_id", uid ?? "").order("created_at", { ascending: false }))).map(mapMyListing);
    },
    async market() {
      const { data, error } = await sb.rpc("market_listings");
      if (error) throw new Error(error.message);
      return (data ?? []).map(mapMarket);
    },
    async trades() {
      return (await rows(sb.from("trades").select("*").order("created_at", { ascending: false }))).map(mapTrade);
    },
    async bills() {
      return (await rows(sb.from("bill_payments").select("*").order("created_at", { ascending: false }))).map(mapBill);
    },
    async chainEvents() {
      return (await rows(sb.from("chain_events").select("*").order("id", { ascending: false }).limit(100))).map(mapEvent);
    },
    logEnergy: (g, u) => call("log_energy", { p_generated: g, p_used: u }),
    claimCredits: () => call("claim_credits"),
    createListing: (c, p) => call("create_listing", { p_credits: c, p_price: p }),
    cancelListing: (id) => call("cancel_listing", { p_listing_id: id }),
    buyListing: (id) => call("buy_listing", { p_listing_id: id }),
    payBill: (b: BillInput) =>
      call("pay_bill", {
        p_provider: b.provider, p_consumer_number: b.consumerNumber, p_consumer_name: b.consumerName,
        p_billing_month: b.billingMonth, p_meter_number: b.meterNumber, p_units: b.units, p_rate: b.rate,
        p_credits_to_use: b.creditsToUse,
      }),
    syncChain,
    subscribe(onChange) {
      // Debounce: one action often touches several tables at once.
      let timer: ReturnType<typeof setTimeout> | null = null;
      const ping = () => { if (timer) clearTimeout(timer); timer = setTimeout(() => { timer = null; onChange(); }, 300); };

      // 1) Realtime: any insert/update/delete on the tables the app shows (Row Level Security still applies).
      //    The tables must be in the supabase_realtime publication (see supabase/migrations/*_realtime.sql).
      const channel = sb.channel("solarcredit-live");
      for (const table of ["profiles", "energy_logs", "listings", "trades", "bill_payments", "chain_events"]) {
        channel.on("postgres_changes", { event: "*", schema: "public", table }, ping);
      }
      channel.subscribe();

      // 2) Safety net: also reload when the tab becomes visible again and every 15 s while it is open. This
      //    covers other people's marketplace listings (not readable as table rows) and a Realtime outage.
      const onVisible = () => { if (document.visibilityState === "visible") ping(); };
      document.addEventListener("visibilitychange", onVisible);
      const poll = setInterval(() => { if (document.visibilityState === "visible") ping(); }, 15000);

      return () => {
        if (timer) clearTimeout(timer);
        clearInterval(poll);
        document.removeEventListener("visibilitychange", onVisible);
        void sb.removeChannel(channel);
      };
    },
  };
}
