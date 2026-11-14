import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { RotateCcw } from 'lucide-react';
import { useApp } from '@/hooks/useApp';

export const AppLayout: React.FC = () => {
  const { resetDemo } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SolarCredit P2P Energy Trading Platform. Person 1 Frontend Module.</p>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="hover:text-slate-300">
              Auth Portal
            </Link>
            <Link to="/onboarding" className="hover:text-slate-300">
              Smart Meter Onboarding
            </Link>
            <button
              onClick={resetDemo}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
