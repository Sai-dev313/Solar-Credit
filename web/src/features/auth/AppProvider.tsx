import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useToast } from "../../components/ui";
import { api, configError, type DataApi, type Profile, type Session } from "../../data";

interface AppState {
  api: DataApi;
  session: Session | null;
  profile: Profile | null;
  /** True until the first session lookup finishes. */
  booting: boolean;
  refresh(): Promise<void>;
  /** Run after any action that changes data: reloads the profile, then pushes chain events and reloads again. */
  afterAction(): Promise<void>;
  /** Bumps whenever data changed, so pages can reload their lists. */
  version: number;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [booting, setBooting] = useState(true);
  const [version, setVersion] = useState(0);

  const toast = useToast();
  const toastRef = useRef(toast); // keeps refresh() stable even if the toast object changes between renders
  toastRef.current = toast;
  // True once this user's profile has been seen, so a later "no profile" means it was deleted.
  const hadProfile = useRef(false);

  const refresh = useCallback(async () => {
    if (!api) return;
    const s = await api.auth.session();
    setSession(s);
    if (!s) { hadProfile.current = false; setProfile(null); setVersion((v) => v + 1); return; }

    let failed = false;
    const p = await api.profile().catch((e) => { failed = true; console.warn("[SolarCredit] could not load the profile:", e?.message ?? e); return null; });
    if (failed) return; // a network hiccup: keep showing what we have instead of logging the user out
    if (p) { hadProfile.current = true; setProfile(p); }
    else if (hadProfile.current) {
      // The account was removed on the backend while the user was signed in.
      hadProfile.current = false;
      await api.auth.signOut();
      toastRef.current.err("Your account is no longer available. Please sign in again.");
      setSession(null); setProfile(null);
    } else setProfile(null); // brand-new account: the backend is still creating the profile
    setVersion((v) => v + 1);
  }, []);

  const afterAction = useCallback(async () => {
    await refresh();
    if (api) { await api.syncChain(); await refresh(); }
  }, [refresh]);

  useEffect(() => {
    if (!api) return;
    refresh().finally(() => setBooting(false));
    return api.auth.onChange(() => { void refresh(); });
  }, [refresh]);

  // Live updates: when the backend changes or deletes this user's data, reload it.
  useEffect(() => {
    if (!api || !session) return;
    return api.subscribe(() => { void refresh(); });
  }, [session?.userId, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  if (configError || !api) {
    return (
      <div className="mx-auto mt-24 max-w-lg rounded-2xl border border-red-200 bg-white p-6">
        <h1 className="font-display text-2xl font-bold">App is not configured</h1>
        <p className="mt-2 text-ink-600">{configError}</p>
      </div>
    );
  }
  return <Ctx.Provider value={{ api, session, profile, booting, refresh, afterAction, version }}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}

/** Load data for a page; reloads when an action elsewhere changes the data. */
export function useLoad<T>(fn: (api: DataApi) => Promise<T>, deps: unknown[] = []) {
  const { api, version } = useApp();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    fn(api).then((d) => { if (live) { setData(d); setError(null); } })
      .catch((e: Error) => { if (live) setError(e.message); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, version, ...deps]);
  return { data, error, loading: data === null && !error };
}
