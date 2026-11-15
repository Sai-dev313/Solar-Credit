import { createContext, useCallback, useContext, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/** Phosphor icon (the dashboard design uses Phosphor, loaded in index.html). */
export const Ph = ({ n, className = "", bold = true }: { n: string; className?: string; bold?: boolean }) => (
  <i className={cx(bold ? "ph-bold" : "ph", `ph-${n}`, className)} aria-hidden="true" />
);

export const CARD = "bg-white/70 backdrop-blur-sm rounded-xl p-5 md:p-6 border border-[#ebedff] shadow-sm";
export const INPUT = "w-full bg-[#f2f3ff] hover:bg-[#ebedff] border border-[#d9ddf0] focus:border-[#016948] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#016948]/30 transition disabled:opacity-60";

/* ---------------------------------------------------------------- Button */
type Variant = "primary" | "outline" | "ghost" | "danger";
const variants: Record<Variant, string> = {
  primary: "bg-[#016948] hover:bg-[#064e3b] text-white shadow-sm",
  outline: "bg-white/80 hover:bg-[#016948] text-[#064e3b] hover:text-white border border-[#016948]/30 hover:border-[#016948] shadow-sm hover:-translate-y-0.5",
  ghost: "bg-white/70 hover:bg-white text-gray-800 border border-emerald-700/20",
  danger: "bg-white/80 hover:bg-red-600 text-red-700 hover:text-white border border-red-300",
};
export function Button({ variant = "primary", loading, className, children, disabled, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button {...rest} disabled={disabled || loading}
      className={cx("inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)}>
      {loading && <Ph n="spinner-gap" className="animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cx(CARD, className)}>{children}</section>;
}

/** Icon chip + title + subtitle, as in the design's panel headers. */
export function PanelHeader({ icon, title, subtitle, right }: { icon: string; title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d6fdeb] text-[#016948]"><Ph n={icon} className="text-xl" /></div>
          <h3 className="text-base font-bold tracking-tight text-gray-900 md:text-lg">{title}</h3>
        </div>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Pill({ tone = "green", children }: { tone?: "green" | "gray" | "amber" | "red" | "blue"; children: ReactNode }) {
  const t = {
    green: "bg-[#e1f8f2] text-[#016948] border-[#c1f5e4]", gray: "bg-gray-100 text-gray-700 border-gray-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200", red: "bg-red-50 text-red-700 border-red-200", blue: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return <span className={cx("inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-semibold", t[tone])}>{children}</span>;
}

export function Field({ label, hint, suffix, children }: { label: string; hint?: string; suffix?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-800">{label}</span>
      <span className="relative block">
        {children}
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-gray-500">{suffix}</span>}
      </span>
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export function Empty({ icon, title, body }: { icon: string; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <div className="mb-3 rounded-full bg-[#cbd8cf] p-3 text-emerald-900"><Ph n={icon} className="text-2xl" /></div>
      <p className="font-bold text-gray-900">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-gray-600">{body}</p>}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return <div className="flex items-center justify-center gap-2 py-14 text-gray-600" role="status"><Ph n="spinner-gap" className="animate-spin text-xl" /> {label}…</div>;
}

/* ----------------------------------------------------------------- Toasts */
interface ToastItem { id: number; kind: "ok" | "err"; text: string }
const ToastCtx = createContext<{ ok(t: string): void; err(t: string): void }>({ ok() {}, err() {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((kind: "ok" | "err", text: string) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, kind, text }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={{ ok: (t) => push("ok", t), err: (t) => push("err", t) }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
        {items.map((i) => (
          <div key={i.id} className={cx("pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 shadow-lg", i.kind === "ok" ? "border-emerald-200" : "border-red-200")}>
            <Ph n={i.kind === "ok" ? "check-circle" : "warning-circle"} className={cx("mt-0.5 text-xl", i.kind === "ok" ? "text-emerald-600" : "text-red-600")} />
            <p className="flex-1 text-sm font-medium text-gray-900">{i.text}</p>
            <button onClick={() => setItems((x) => x.filter((t) => t.id !== i.id))} aria-label="Dismiss" className="text-gray-400 hover:text-gray-900"><Ph n="x" /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ------------------------------------------------------------------ Modal */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose(): void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-gray-900/50 p-4 sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-md rounded-xl border border-emerald-900/10 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-900"><Ph n="x" className="text-lg" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
