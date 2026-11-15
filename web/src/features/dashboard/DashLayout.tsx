import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { activeTab, tabsFor } from "./tabs";
import { Ph, Spinner } from "../../components/ui";
import { chainConfig } from "../../lib/chain";
import { useApp } from "../auth/AppProvider";
import { ChooseRole } from "../auth/ChooseRole";

/** Shown while the profile loads. If it takes too long, stop spinning and let the user retry or sign out. */
function SettingUp() {
  const { api, refresh } = useApp();
  const nav = useNavigate();
  const [slow, setSlow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSlow(true), 8000); return () => clearTimeout(t); }, []);
  if (!slow) return <Spinner label="Setting up your account" />;
  return (
    <div className="grid min-h-screen place-items-center bg-[#faf8ff] px-4 text-center">
      <div className="max-w-sm">
        <h1 className="text-xl font-extrabold text-[#141b2e]">We couldn’t load your profile</h1>
        <p className="mt-2 text-sm text-gray-600">Your account is signed in, but its profile isn’t available yet. Try again, or sign out and sign back in. If it keeps happening, contact the project owner.</p>
        <div className="mt-5 flex justify-center gap-3">
          <button type="button" onClick={() => void refresh()} className="rounded-lg bg-[#016948] px-4 py-2 text-sm font-semibold text-white hover:bg-[#064e3b]">Try again</button>
          <button type="button" onClick={async () => { await api.auth.signOut(); nav("/auth"); }} className="rounded-lg border border-[#d9ddf0] bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-[#f2f3ff]">Sign out</button>
        </div>
      </div>
    </div>
  );
}

/** Green sidebar + content area, exactly as in the Stitch dashboard design. */
export function DashLayout() {
  const { api, session, profile, booting } = useApp();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const current = profile ? activeTab(profile.role, params.get("tab")) : null;

  if (booting) return <Spinner />;
  if (!session) return <Navigate to="/auth" replace />;
  if (!profile) return <SettingUp />;
  if (!profile.role_chosen) return <ChooseRole />; // a first Google sign-in picks Producer or Consumer once

  const link = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
      isActive ? "bg-[#146e37] text-white border border-white/10 shadow-sm" : "text-[#c6d2ce] hover:bg-[#146e37]/50 hover:text-white"}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#faf8ff] font-sans text-[#141b2e] antialiased md:flex-row">
      <aside className="flex w-full flex-shrink-0 select-none flex-col justify-between border-r border-black/10 bg-[#064e3b] p-4 text-white shadow-sm md:sticky md:top-0 md:h-screen md:w-56 md:p-6 lg:w-64" data-purpose="sidebar-navigation">
        <div>
          <div className="mb-6 flex items-center md:mb-10">
            <div className="flex items-center space-x-2.5">
              <Ph n="lightning" className="text-2xl text-white" />
              <span className="text-xl font-bold tracking-tight md:text-2xl">SolarCredit</span>
            </div>
          </div>
          <nav className="no-scrollbar flex space-x-2 overflow-x-auto md:flex-col md:space-x-0 md:space-y-2" aria-label="Main">
            {tabsFor(profile.role).map((t, i) => {
              const on = pathname === "/app" && current === t.id;
              return (
                <Link key={t.id} to={i === 0 ? "/app" : `/app?tab=${t.id}`} aria-current={on ? "page" : undefined}
                  className={link({ isActive: on })}><Ph n={t.icon} className="text-lg" /><span>{t.label}</span></Link>
              );
            })}
            <NavLink to="/app/profile" className={link}><Ph n="user" className="text-lg" /><span>Profile</span></NavLink>
          </nav>
        </div>
        <div className="mt-4 border-t border-white/10 pt-3 md:mt-auto">
          <button onClick={async () => { await api.auth.signOut(); nav("/"); }}
            className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-[#c6d2ce] transition-colors hover:bg-[#146e37]/50 hover:text-white">
            <Ph n="sign-out" className="text-lg" /><span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {api.mode === "demo" && (
          <div className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-800 md:text-sm">
            Offline demo mode: data lives in this browser{chainConfig.simulated ? " and blockchain records are simulated." : `; transactions go to ${chainConfig.name}.`}
          </div>
        )}
        <main className="mx-auto w-full max-w-5xl p-4 md:p-8" data-purpose="main-dashboard"><Outlet /></main>
      </div>
    </div>
  );
}
