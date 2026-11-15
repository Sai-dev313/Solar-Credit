// Generated from the Stitch design export, then wired by hand where marked.
export interface SignupProps {
  name: string; setName(v: string): void;
  role: "producer" | "consumer"; setRole(r: "producer" | "consumer"): void;
  email: string; setEmail(v: string): void;
  password: string; setPassword(v: string): void;
  show: boolean; toggleShow(): void;
  busy: boolean; error: string | null;
  onSubmit(e: React.FormEvent): void; onSignin(): void; onGoogle(): void;
}

export function SignupBody({ f }: { f: SignupProps }) {
  return (
    <>
<div className="flex-1 min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden">
<main className="flex-1 w-full bg-[#faf8ff] flex items-center justify-center p-4 sm:p-10 overflow-y-auto" data-purpose="right-auth-panel">
<div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100/80 p-6 sm:p-10 flex flex-col transition-all">
<header className="flex flex-col items-center text-center mb-7" data-purpose="card-header">
<div className="w-13 h-13 p-3 rounded-full bg-[#0f6b3b] flex items-center justify-center shadow-lg shadow-[#0f6b3b]/25 mb-3.5 transition-transform hover:scale-105 duration-200">
<svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" strokeLinejoin="round" strokeWidth="0.5"></path>
</svg>
</div>
<h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Create Account</h1>
<p className="mt-1.5 text-sm text-gray-500">Start earning or saving with solar energy</p>
</header>
<form className="space-y-4 sm:space-y-4.5" data-purpose="signup-form" onSubmit={f.onSubmit}>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="fullName">Full Name</label>
<input className="w-full rounded-lg border-gray-300 text-gray-900 text-sm focus:border-[#0f6b3b] focus:ring-1 focus:ring-[#0f6b3b] transition duration-150 py-2.5 px-3.5 placeholder:text-gray-400 shadow-sm" id="fullName" name="fullName" placeholder="John Doe" required type="text"  value={f.name} onChange={(e) => f.setName(e.target.value)} maxLength={80} autoComplete="name" />
</div>
<div data-purpose="role-selector">
<label className="block text-sm font-medium text-gray-700 mb-1.5">I am a...</label>
<div aria-label="Account role" className="grid grid-cols-2 gap-3" role="radiogroup">
<button aria-checked={f.role === "producer"} className={`role-option border rounded-xl py-3 px-3 text-center flex flex-col items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f6b3b] focus:ring-offset-1 ${f.role === "producer" ? "active" : "inactive"} shadow-sm`} id="role-producer" onClick={() => f.setRole("producer")} role="radio" type="button">
<span className="font-semibold text-sm">Producer</span>
<span className="role-subtitle text-xs mt-0.5 font-normal">I have solar panels</span>
</button>
<button aria-checked={f.role === "consumer"} className={`role-option border rounded-xl py-3 px-3 text-center flex flex-col items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f6b3b] focus:ring-offset-1 ${f.role === "consumer" ? "active" : "inactive"} shadow-sm`} id="role-consumer" onClick={() => f.setRole("consumer")} role="radio" type="button">
<span className="font-semibold text-sm">Consumer</span>
<span className="role-subtitle text-xs mt-0.5 font-normal">I want to save</span>
</button>
</div>

</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email</label>
<input className="w-full rounded-lg border-gray-300 text-gray-900 text-sm focus:border-[#0f6b3b] focus:ring-1 focus:ring-[#0f6b3b] transition duration-150 py-2.5 px-3.5 placeholder:text-gray-400 shadow-sm" id="email" name="email" placeholder="you@example.com" required type="email"  value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoComplete="email" />
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Password</label>
<div className="relative">
<input className="w-full rounded-lg border-gray-300 text-gray-900 text-sm focus:border-[#0f6b3b] focus:ring-1 focus:ring-[#0f6b3b] transition duration-150 py-2.5 pl-3.5 pr-10 placeholder:text-gray-400 shadow-sm" id="password" name="password" placeholder="••••••••" required type={f.show ? "text" : "password"} value={f.password} onChange={(e) => f.setPassword(e.target.value)} minLength={8} autoComplete="new-password" />
<button className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors" id="toggle-password" title="Toggle password visibility" type="button" onClick={f.toggleShow} >
<svg className="w-5 h-5" fill="none" id="eye-icon" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
<path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
</svg>
</button>
</div>
</div>
{f.error && <p role="alert" className="rounded-lg bg-error-container px-3.5 py-2.5 text-sm font-medium text-on-error-container">{f.error}</p>}
<button disabled={f.busy} className="w-full btn-primary-green text-white font-medium py-3 px-4 rounded-lg shadow-md shadow-[#0f6b3b]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f6b3b] text-sm mt-3" type="submit">
{f.busy ? "Creating account…" : "Create Account"}
</button>
</form>
<div className="relative my-6" data-purpose="section-divider">
<div className="absolute inset-0 flex items-center">
<div className="w-full border-t border-gray-200"></div>
</div>
<div className="relative flex justify-center text-xs uppercase tracking-wider">
<span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span>
</div>
</div>
<div data-purpose="social-auth-providers">
<button className="w-full inline-flex justify-center items-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition duration-150 shadow-sm" type="button" onClick={f.onGoogle}>
<svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
</svg>
<span>Continue with Google</span>
</button>
</div>
<footer className="mt-7 text-center text-sm text-gray-500" data-purpose="card-footer">
        Already have an account? 
        <a className="font-medium link-primary-green hover:underline ml-1" href="#signin" onClick={(e) => { e.preventDefault(); f.onSignin(); }}>
          Sign in
        </a>
</footer>
</div>
</main>
</div>
    </>
  );
}
