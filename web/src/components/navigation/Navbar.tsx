import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowLeftRight,
  Blocks,
  Home,
  Receipt,
  Repeat,
  Shield,
  ShoppingBag,
  Sun,
  UserCheck,
  Wallet,
  Zap,
} from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { formatKwh, shortenAddress } from '@/utils/format';

export const Navbar: React.FC = () => {
  const { profile, isDemoMode, switchRole, connectUserWallet } = useApp();

  const navItems = [
    { to: '/', label: 'Landing', icon: Home },
    { to: '/prosumer', label: 'Prosumer Hub', icon: Sun },
    { to: '/consumer', label: 'Consumer Hub', icon: Zap },
    { to: '/marketplace', label: 'P2P Market', icon: ShoppingBag },
    { to: '/bills', label: 'Utility Bills', icon: Receipt },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/blockchain', label: 'Chain Explorer', icon: Blocks },
    { to: '/admin', label: 'Grid Admin', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      {isDemoMode && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-1.5 text-xs text-emerald-300 flex items-center justify-between max-w-7xl mx-auto">
          <span>
            <strong>Isolated Demo Adapter Active:</strong> Live state persisted locally until Supabase & Sepolia backend endpoints are connected.
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Active Role:</span>
            {(['prosumer', 'consumer', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-2 py-0.5 rounded capitalize font-medium cursor-pointer transition-colors ${
                  profile.role === r
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-yellow-400 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-sm">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-100 block leading-none">
                SolarCredit
              </span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">
                Sepolia P2P Grid
              </span>
            </div>
          </NavLink>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs">
            <Repeat className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-slate-400">Credits:</span>
            <span className="font-bold text-emerald-400">
              {formatKwh(profile.creditBalance)}
            </span>
          </div>

          <NavLink
            to="/onboarding"
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors"
            title="Meter & Profile Setup"
          >
            <UserCheck className="h-3.5 w-3.5 text-sky-400" />
            {profile.smartMeterId}
          </NavLink>

          <button
            onClick={connectUserWallet}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3.5 py-2 text-xs transition-colors cursor-pointer"
          >
            <Wallet className="h-3.5 w-3.5" />
            {shortenAddress(profile.walletAddress)}
          </button>
        </div>
      </div>
    </header>
  );
};
