// Generated from the Stitch design export, then wired by hand where marked.
export interface LoginProps {
  mode: "signin" | "reset";
  email: string; setEmail(v: string): void;
  password: string; setPassword(v: string): void;
  show: boolean; toggleShow(): void;
  busy: boolean; error: string | null; note: string | null;
  onSubmit(e: React.FormEvent): void; onForgot(): void; onSwitch(): void; onGoogle(): void;
}

export function LoginBody({ f }: { f: LoginProps }) {
  return (
    <>
<main className="w-full min-h-screen flex-1 flex items-center justify-center bg-[#faf8ff] p-4 sm:p-10" data-purpose="auth-container">
  <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100/80 px-6 sm:px-10 py-10" data-purpose="login-card">
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-center mb-8 space-x-3">
        <div aria-label="SolarCredit Logo" className="w-10 h-10 rounded-full bg-[#1b7239] flex items-center justify-center text-white shadow-sm">
          <svg className="w-5 h-5 fill-current stroke-current stroke-1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </div>
        <span className="font-bold text-xl text-gray-950 tracking-tight">SolarCredit</span>
      </div>
      <div className="mb-8" data-purpose="auth-header">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 mb-2">{f.mode === "reset" ? "Reset password" : "Welcome"}</h1>
        <p className="text-sm text-gray-600 font-normal">{f.mode === "reset" ? "We will email you a link to choose a new password" : "Sign in to your SolarCredit account to continue"}</p>
      </div>
      <form className="space-y-4" data-purpose="login-form" onSubmit={f.onSubmit}>
        <div data-purpose="email-field-group">
          <label className="block text-sm font-medium text-gray-900 mb-1.5" htmlFor="email">Email</label>
          <input className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 placeholder-gray-400 transition-all duration-200" id="email" name="email" placeholder="you@example.com" required type="email"  value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoComplete="email" />
        </div>
        {f.mode !== "reset" && (
<div data-purpose="password-field-group">
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-gray-900" htmlFor="password">Password</label>
            <a className="text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:underline transition-all duration-200" href="#" onClick={(e) => { e.preventDefault(); f.onForgot(); }}>Forgot password?</a>
          </div>
          <div className="relative">
            <input className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 placeholder-gray-400 pr-10 tracking-widest transition-all duration-200" id="password" name="password" placeholder="••••••••" required type={f.show ? "text" : "password"} value={f.password} onChange={(e) => f.setPassword(e.target.value)} autoComplete="current-password" />
            <button aria-label="Toggle password visibility" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900 focus:outline-none" data-purpose="password-visibility-toggle" id="togglePassword" type="button" onClick={f.toggleShow} >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
          </div>
        </div>
)}
        {}
{f.error && <p role="alert" className="rounded-lg bg-error-container px-3.5 py-2.5 text-sm font-medium text-on-error-container">{f.error}</p>}
{f.note && <p role="status" className="rounded-lg bg-secondary-container/40 px-3.5 py-2.5 text-sm font-medium text-on-secondary-container">{f.note}</p>}
<div className="pt-2" data-purpose="submit-container">
          <button className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600" type="submit" disabled={f.busy}>
{f.mode === "reset" ? (f.busy ? "Sending…" : "Send reset link") : f.busy ? "Signing in…" : "Sign In"}
</button>
        </div>
      </form>
      {f.mode !== "reset" && (
<div className="relative my-6" data-purpose="section-divider">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-[11px] font-medium tracking-wide text-gray-500">
            OR CONTINUE WITH
          </span>
        </div>
      </div>
)}
      {f.mode !== "reset" && (
<div data-purpose="social-auth-container">
        <button className="w-full py-2.5 px-4 border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] rounded-lg shadow-sm flex items-center justify-center space-x-2.5 text-sm font-medium text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300" type="button" onClick={f.onGoogle}>
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>
)}
      <div className="mt-8 text-center" data-purpose="registration-prompt">
        <p className="text-sm text-gray-600">
          {f.mode === "reset" ? "" : "Don’t have an account? "}
          <a className="text-emerald-700 hover:text-emerald-900 font-medium hover:underline transition-all duration-200" href="#" onClick={(e) => { e.preventDefault(); f.onSwitch(); }}>{f.mode === "reset" ? "Back to sign in" : "Sign up"}</a>
        </p>
      </div>
    </div>
  </div>
</main>
    </>
  );
}
