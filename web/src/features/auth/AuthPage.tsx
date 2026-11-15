import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import type { Role } from "../../data";
import { useToast } from "../../components/ui";
import { useApp } from "./AppProvider";
import { LoginBody } from "./screens/LoginBody";
import { SignupBody } from "./screens/SignupBody";

type Step = "signin" | "reset" | "signup";

export function AuthPage() {
  const { api, session, booting, refresh } = useApp();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState<Step>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>(params.get("role") === "consumer" ? "consumer" : "producer");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  // Set while a verification is in flight, so the "already signed in" redirect cannot skip the success screen.
  const [hold, setHold] = useState(false);

  if (!booting && session && !hold) return <Navigate to="/app" replace />;

  const go = (s: Step) => { setStep(s); setError(null); setNote(null); };
  const google = async () => { const r = await api.auth.google(); if (r.error) toast.err(r.error); };

  async function submitLogin(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(null); setNote(null);
    try {
      if (step === "reset") {
        const r = await api.auth.resetPassword(email);
        r.error ? setError(r.error) : setNote("If that email has an account, a reset link is on its way.");
      } else {
        const r = await api.auth.signIn(email, password);
        if (r.unverified) setError("This account's email was never confirmed on the server, so it cannot sign in yet. Ask the project owner to turn off 'Confirm email' in Supabase (Authentication) or confirm this user.");
        else if (r.error) setError(r.error);
        else { await refresh(); nav("/app"); }
      }
    } finally { setBusy(false); }
  }

  async function submitSignup(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(null); setHold(true);
    try {
      if (password.length < 8) { setError("Use a password of at least 8 characters"); setHold(false); return; }
      const r = await api.auth.signUp(email, password, name.trim(), role);
      if (r.error) { setError(r.error); setHold(false); }
      else if (r.needsEmailConfirm) {
        // No email-code step: sign the new user straight in. This works when the backend has
        // "Confirm email" switched off (and always in demo mode).
        const s = await api.auth.signIn(email, password);
        if (s.error) {
          setHold(false); go("signin");
          setNote(s.unverified
            ? "Your account is created, but the backend still requires email confirmation. Turn off 'Confirm email' in Supabase (Authentication), then sign in."
            : "Your account is created. Please sign in.");
        } else { await refresh(); nav("/app"); }
      }
      else { await refresh(); nav("/app"); }
    } finally { setBusy(false); }
  }

  if (step === "signup") {
    return (
      <SignupBody f={{
        name, setName, role, setRole, email, setEmail, password, setPassword,
        show, toggleShow: () => setShow((v) => !v), busy, error,
        onSubmit: submitSignup, onSignin: () => go("signin"), onGoogle: google,
      }} />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LoginBody f={{
        mode: step === "reset" ? "reset" : "signin", email, setEmail, password, setPassword,
        show, toggleShow: () => setShow((v) => !v), busy, error, note,
        onSubmit: submitLogin, onForgot: () => go("reset"), onSwitch: () => go(step === "reset" ? "signin" : "signup"), onGoogle: google,
      }} />
    </div>
  );
}
