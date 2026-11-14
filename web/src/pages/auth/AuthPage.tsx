import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useApp } from '@/hooks/useApp';
import { UserRole } from '@/types';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const initialRole: UserRole =
    searchParams.get('role') === 'consumer' ? 'consumer' : 'prosumer';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState(
    initialRole === 'consumer' ? 'consumer@solarcredit.in' : 'producer@solarcredit.in'
  );
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState(
    initialRole === 'consumer' ? 'Priya Sharma' : 'Alex Rivera'
  );
  const [role, setRole] = useState<UserRole>(initialRole);
  const [error, setError] = useState<string | null>(null);
  const { refreshAll } = useApp();
  const navigate = useNavigate();

  const handleSelectRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'prosumer') {
      setEmail('producer@solarcredit.in');
      setFullName('Alex Rivera');
    } else {
      setEmail('consumer@solarcredit.in');
      setFullName('Priya Sharma');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const updated = await authService.signInWithEmail(email, password, role);
      await refreshAll();
      navigate(updated.role === 'prosumer' ? '/prosumer' : '/consumer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  const handleGoogleContinue = async () => {
    setError(null);
    try {
      const updated = await authService.signInWithEmail(email, password, role);
      await refreshAll();
      if (mode === 'signup') {
        navigate('/onboarding');
      } else {
        navigate(updated.role === 'prosumer' ? '/prosumer' : '/consumer');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await authService.signUpWithEmail(email, password, fullName, role);
      await refreshAll();
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  if (mode === 'signup') {
    return (
      <div className="bg-[#faf8ff] text-gray-900 min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden">
        {/* Left Column: Branding & Value Proposition */}
        <aside className="relative flex-1 lg:w-[48%] xl:w-[46%] bg-gradient-to-br from-[#0f6b3b] via-[#0d5931] to-[#0a4d2a] text-white p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-between overflow-hidden shadow-2xl z-10">
          <Link to="/" className="relative z-10 flex items-center gap-3.5 mb-10 lg:mb-12">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg shadow-black/20 text-[#0f6b3b] transition-transform hover:scale-105 duration-200">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-2xl tracking-tight text-white leading-tight">
                SolarCredit
              </span>
              <span className="text-xs uppercase tracking-widest text-emerald-200/80 font-medium">
                Peer-to-Peer Green Energy
              </span>
            </div>
          </Link>

          <div className="relative z-10 my-auto py-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-200 text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              DISCOM Interconnected Renewable Grid
            </div>
            <h2 className="font-display text-3xl sm:text-4xl xl:text-[42px] font-extrabold leading-[1.18] tracking-tight text-white mb-5 max-w-xl">
              Turn rooftop solar generation into verified, tradable credits.
            </h2>
            <p className="text-emerald-100/80 text-base sm:text-lg leading-relaxed max-w-lg mb-8 font-light">
              Decentralized energy accounting connecting clean power producers directly with conscious consumers for automated utility savings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="material-symbols-outlined text-emerald-300 text-xl font-bold">
                    verified_user
                  </span>
                  <span className="font-semibold text-sm text-white">100% CERC &amp; SERC</span>
                </div>
                <p className="text-xs text-emerald-100/75 leading-snug">
                  DISCOM ready with tamper-proof, auditable carbon trace on ledger.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="material-symbols-outlined text-emerald-300 text-xl font-bold">
                    bolt
                  </span>
                  <span className="font-semibold text-sm text-white">Direct Bill Settlement</span>
                </div>
                <p className="text-xs text-emerald-100/75 leading-snug">
                  Auto-shave monthly utility invoices seamlessly with zero friction.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-200/80">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-300 text-lg">shield</span>
              <span>ISO 14064 Verified GHG Accounting Standard</span>
            </div>
          </div>
        </aside>

        {/* Right Column: Create Account Form */}
        <main className="flex-1 lg:w-[52%] xl:w-[54%] bg-white lg:bg-[#faf8ff] flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto">
          <div className="w-full max-w-[480px] bg-white lg:rounded-2xl lg:shadow-xl lg:shadow-slate-200/60 lg:border lg:border-slate-100/80 p-6 sm:p-10 flex flex-col">
            <header className="flex flex-col items-center text-center mb-7">
              <div className="w-13 h-13 p-3 rounded-full bg-[#0f6b3b] flex items-center justify-center shadow-lg shadow-[#0f6b3b]/25 mb-3.5">
                <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                  <path
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                    stroke="white"
                    strokeLinejoin="round"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Create Account
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Start earning or saving with solar energy
              </p>
            </header>

            {error && (
              <div className="mb-4 rounded-lg bg-error-container text-on-error-container p-3 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-300 text-gray-900 text-sm focus:border-[#0f6b3b] focus:outline-none py-2.5 px-3.5 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectRole('prosumer')}
                    className={`border rounded-xl py-3 px-3 text-center flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm ${
                      role === 'prosumer'
                        ? 'bg-[#0f6b3b] text-white border-[#0f6b3b]'
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-[#f0fdf4]'
                    }`}
                  >
                    <span className="font-semibold text-sm">Producer</span>
                    <span
                      className={`text-xs mt-0.5 ${
                        role === 'prosumer' ? 'text-emerald-100' : 'text-gray-500'
                      }`}
                    >
                      I have solar panels
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectRole('consumer')}
                    className={`border rounded-xl py-3 px-3 text-center flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm ${
                      role === 'consumer'
                        ? 'bg-[#0f6b3b] text-white border-[#0f6b3b]'
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-[#f0fdf4]'
                    }`}
                  >
                    <span className="font-semibold text-sm">Consumer</span>
                    <span
                      className={`text-xs mt-0.5 ${
                        role === 'consumer' ? 'text-emerald-100' : 'text-gray-500'
                      }`}
                    >
                      I want to save
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 text-gray-900 text-sm focus:border-[#0f6b3b] focus:outline-none py-2.5 px-3.5 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-300 text-gray-900 text-sm focus:border-[#0f6b3b] focus:outline-none py-2.5 pl-3.5 pr-10 shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f6b3b] hover:bg-[#0a4d2a] text-white font-medium py-3 px-4 rounded-lg shadow-md text-sm mt-3 cursor-pointer transition-colors"
              >
                Create {role === 'prosumer' ? 'Producer' : 'Consumer'} Account
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleContinue}
              className="w-full inline-flex justify-center items-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <footer className="mt-7 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-medium text-[#0f6b3b] hover:underline ml-1 cursor-pointer"
              >
                Sign in
              </button>
            </footer>
          </div>
        </main>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen flex-1 grid lg:grid-cols-12 bg-white text-gray-800">
      {/* Left / Hero Showcase Section */}
      <div
        className="hidden lg:flex lg:col-span-6 xl:col-span-7 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f6b3b 0%, #0a4d2a 100%)' }}
      >
        <Link to="/" className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-sm">
            <svg className="w-5 h-5 fill-current stroke-current stroke-1" viewBox="0 0 24 24">
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight">SolarCredit</span>
        </Link>

        <div className="relative z-10 max-w-xl space-y-6 my-auto py-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-medium tracking-wide uppercase">
            <span>Clean Energy Financing</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight">
            Empowering sustainable growth with transparent credit.
          </h2>
          <p className="text-emerald-100 text-base xl:text-lg leading-relaxed">
            Manage solar assets, monitor repayments, and accelerate your transition to renewable energy with intelligent portfolio analytics.
          </p>
        </div>

        <div className="relative z-10 text-xs text-emerald-200/80 flex items-center justify-between border-t border-emerald-600/60 pt-6">
          <span>© 2025 SolarCredit Inc. All rights reserved.</span>
          <div className="flex space-x-6">
            <Link to="/" className="hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-white transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Right / Expansive Interactive Form Area */}
      <div className="col-span-12 lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-12 xl:px-20 py-12 bg-white min-h-screen">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="flex items-center lg:hidden mb-8 space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#1b7239] flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5 fill-current stroke-current stroke-1" viewBox="0 0 24 24">
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-950 tracking-tight">SolarCredit</span>
          </Link>

          <div className="mb-6">
            <div className="hidden lg:flex w-12 h-12 rounded-full bg-[#1b7239] items-center justify-center text-white shadow-sm mb-6">
              <svg className="w-6 h-6 fill-current stroke-current stroke-1" viewBox="0 0 24 24">
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 mb-2">
              Welcome
            </h1>
            <p className="text-sm text-gray-600 font-normal">
              Sign in to your SolarCredit account to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-error-container text-on-error-container p-3 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Role Selector on Sign In so Producer -> Producer Dashboard & Consumer -> Consumer Dashboard */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectRole('prosumer')}
                  className={`border rounded-xl py-2.5 px-3 text-center flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm ${
                    role === 'prosumer'
                      ? 'bg-[#0f6b3b] text-white border-[#0f6b3b]'
                      : 'bg-white text-gray-800 border-gray-200 hover:bg-[#f0fdf4]'
                  }`}
                >
                  <span className="font-semibold text-sm">Producer</span>
                  <span
                    className={`text-xs mt-0.5 ${
                      role === 'prosumer' ? 'text-emerald-100' : 'text-gray-500'
                    }`}
                  >
                    Solar Generator
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('consumer')}
                  className={`border rounded-xl py-2.5 px-3 text-center flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm ${
                    role === 'consumer'
                      ? 'bg-[#0f6b3b] text-white border-[#0f6b3b]'
                      : 'bg-white text-gray-800 border-gray-200 hover:bg-[#f0fdf4]'
                  }`}
                >
                  <span className="font-semibold text-sm">Consumer</span>
                  <span
                    className={`text-xs mt-0.5 ${
                      role === 'consumer' ? 'text-emerald-100' : 'text-gray-500'
                    }`}
                  >
                    Electricity Buyer
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 placeholder-gray-400 transition-all duration-200"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-900">Password</label>
                <Link
                  to="/onboarding"
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:underline transition-all duration-200"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 placeholder-gray-400 pr-10 tracking-widest transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                Sign In as {role === 'prosumer' ? 'Producer' : 'Consumer'}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[11px] font-medium tracking-wide text-gray-500">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleContinue}
            className="w-full py-2.5 px-4 border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] rounded-lg shadow-sm flex items-center justify-center space-x-2.5 text-sm font-medium text-gray-700 transition-all duration-200 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google ({role === 'prosumer' ? 'Producer' : 'Consumer'})</span>
          </button>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don’t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-emerald-700 hover:text-emerald-900 font-medium hover:underline transition-all duration-200 cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
