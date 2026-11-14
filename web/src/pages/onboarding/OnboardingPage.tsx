import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/hooks/useApp';
import { authService } from '@/services/auth.service';
import { DEMO_OTP_CODE } from '@/lib/constants';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 39;

export const OnboardingPage: React.FC = () => {
  const { profile, isDemoMode, refreshAll } = useApp();
  const [step, setStep] = useState<'otp' | 'verified'>('otp');
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState<number>(RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const isProducer = profile.role === 'prosumer';

  useEffect(() => {
    if (step !== 'otp') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step === 'otp') inputsRef.current[0]?.focus();
  }, [step]);

  const focusBox = (idx: number) => inputsRef.current[Math.max(0, Math.min(OTP_LENGTH - 1, idx))]?.focus();

  // Fill boxes from idx onward; handles typing one digit or pasting the whole code
  // Functional updates so fast typing or autofill never works from a stale copy
  const fillFrom = (idx: number, raw: string) => {
    const incoming = raw.replace(/\D/g, '').slice(0, OTP_LENGTH - idx);
    if (!incoming) return;
    setDigits((prev) => {
      const next = [...prev];
      incoming.split('').forEach((ch, k) => {
        next[idx + k] = ch;
      });
      return next;
    });
    setError(null);
    focusBox(idx + incoming.length);
  };

  const handleDigitChange = (idx: number, el: HTMLInputElement) => {
    const val = el.value;
    if (val === '') {
      setDigits((prev) => prev.map((d, i) => (i === idx ? '' : d)));
      return;
    }
    if (val.length === 2) {
      // The box already held a digit: keep only the one just typed (just left of the caret)
      const caret = el.selectionStart ?? 2;
      fillFrom(idx, val.charAt(Math.max(0, caret - 1)));
      return;
    }
    // One typed digit, or a whole code from phone autofill
    fillFrom(idx, val);
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      e.preventDefault();
      setDigits((prev) => prev.map((d, i) => (i === idx - 1 ? '' : d)));
      focusBox(idx - 1);
    } else if (e.key === 'ArrowLeft') {
      focusBox(idx - 1);
    } else if (e.key === 'ArrowRight') {
      focusBox(idx + 1);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < OTP_LENGTH) {
      setError(`Enter all ${OTP_LENGTH} digits of the code.`);
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      await authService.verifyEmailOtp(profile.email, code);
      await authService.updateOnboardingProfile({});
      await refreshAll();
      setStep('verified');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify the code.');
      setDigits(Array(OTP_LENGTH).fill(''));
      focusBox(0);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    try {
      await authService.resendEmailOtp(profile.email);
      setTimeLeft(RESEND_SECONDS);
      setNotice(isDemoMode ? `Demo mode: no email is sent. Use ${DEMO_OTP_CODE}.` : 'A new code is on its way.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code.');
    }
  };

  if (step === 'verified') {
    return (
      <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
        <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 max-w-7xl mx-auto px-4 md:px-8 lg:px-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[20px]">solar_power</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                  SolarCredit
                </span>
                <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider -mt-1">
                  Ledger Node
                </span>
              </div>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                to="/auth"
                className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5"
              >
                Back to Sign In
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 text-secondary">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-label-sm text-label-sm font-semibold">Gateway Active</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full pt-16 bg-surface flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col w-full py-8 md:py-14 px-4 sm:px-6 lg:px-8 items-center justify-center relative overflow-hidden">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[360px] bg-secondary-fixed/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute top-1/3 -right-24 w-80 h-80 bg-primary-fixed/25 blur-3xl rounded-full pointer-events-none" />

            <div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_-8px_rgba(19,27,46,0.06),0_2px_12px_rgba(19,27,46,0.03)] p-8 sm:p-12 relative z-10 flex flex-col items-center text-center transition-all">
              <div className="relative mb-6 flex items-center justify-center">
                <span className="absolute inline-flex h-24 w-24 rounded-full bg-secondary-fixed opacity-70 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_8px_24px_rgba(0,105,72,0.3)]">
                  <span className="material-symbols-outlined text-[44px] text-on-primary">
                    check_circle
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined text-[15px]">bolt</span>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-secondary font-label-sm text-label-sm font-semibold tracking-wide uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Verification Complete
              </div>

              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-3">
                Email Verified!
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-8 leading-relaxed">
                Your {isProducer ? 'Solar Producer' : 'Energy Consumer'} account has been successfully authenticated on the decentralized solar grid.
              </p>

              <div className="w-full bg-surface-container-low/70 rounded-xl p-5 sm:p-6 mb-8 text-left space-y-3.5">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Email
                      </span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wide truncate">
                        {profile.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed/30 text-on-secondary-fixed-variant flex-shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-secondary">
                      verified
                    </span>
                    <span className="font-label-sm text-label-sm font-semibold">Verified</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        DID / Account Key
                      </span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wider font-mono truncate">
                        SC-2025-0982-DISCOM
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container text-tertiary flex-shrink-0">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    <span className="font-label-sm text-label-sm font-medium">256-bit</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px]">
                        {isProducer ? 'solar_power' : 'electric_bolt'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Account Role
                      </span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        {isProducer ? 'Solar Producer Ready' : 'Energy Consumer Ready'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed/40 text-secondary font-label-sm text-label-sm font-semibold flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    Ready
                  </div>
                </div>
              </div>

              {/* Strictly show ONLY the dashboard button matching the user's logged-in role */}
              <div className="w-full mb-2">
                {isProducer ? (
                  <Link
                    to="/prosumer"
                    className="group w-full p-4 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary transition-all flex items-center justify-between shadow-[0_4px_14px_rgba(0,105,72,0.25)]"
                  >
                    <div className="flex items-center gap-3 text-left min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center text-primary-fixed flex-shrink-0">
                        <span className="material-symbols-outlined text-[22px]">solar_power</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md font-semibold tracking-tight text-on-primary truncate">
                          Continue to Producer Dashboard
                        </span>
                        <span className="font-label-sm text-[12px] text-on-primary/80 truncate">
                          Solar generation, credit minting &amp; P2P selling
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-on-primary transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/consumer"
                    className="group w-full p-4 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary transition-all flex items-center justify-between shadow-[0_4px_14px_rgba(0,105,72,0.25)]"
                  >
                    <div className="flex items-center gap-3 text-left min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center text-primary-fixed flex-shrink-0">
                        <span className="material-symbols-outlined text-[22px]">electric_bolt</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md font-semibold tracking-tight text-on-primary truncate">
                          Continue to Consumer Dashboard
                        </span>
                        <span className="font-label-sm text-[12px] text-on-primary/80 truncate">
                          Buy clean credits &amp; offset electricity bills
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-on-primary transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full bg-surface-container-low/70 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-lowest shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  verified_user
                </span>
                <span className="font-label-sm text-label-sm text-on-surface font-medium">
                  Verified Solar Ledger Protocol
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-lowest shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-secondary">gavel</span>
                <span className="font-label-sm text-label-sm text-on-surface font-medium">
                  CERC/DISCOM Gateway Compliant
                </span>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              © 2025 SolarCredit Energy Ledger Inc. All rights reserved.
            </span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface min-h-screen flex flex-col justify-between">
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-20 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-[0_2px_8px_rgba(0,105,72,0.2)]">
              <span className="material-symbols-outlined text-[24px]">solar_power</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-none tracking-tight">
                SolarCredit
              </span>
              <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase pt-0.5">
                Clean Energy Ledger
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Sign In
            </Link>
            <div className="h-5 w-px bg-surface-container-highest mx-1" />
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-14 pt-20 flex-1 flex flex-col justify-center items-center py-10">
        <div className="flex flex-col w-full items-center justify-center py-6 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[640px] h-[400px] bg-secondary-container/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(15,23,42,0.04)] px-8 py-10 md:px-12 md:py-12 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">mail</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                </div>
              </div>

              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">
                Verify Your Email
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                We sent a 6-digit code to
              </p>

              <div className="inline-flex items-center gap-1 mt-1.5 px-3 py-1 bg-surface-container-low rounded-full max-w-full">
                <span className="font-label-md text-label-md text-on-surface tracking-wide font-medium truncate">
                  {profile.email}
                </span>
                <span className="text-outline-variant font-label-sm">•</span>
                <Link
                  to="/auth"
                  className="font-label-sm text-label-sm text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-0.5 shrink-0"
                >
                  <span>Change</span>
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </Link>
              </div>

              {isDemoMode && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary-container/30 text-on-secondary-container font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Demo mode: the code is <strong className="font-mono tracking-wider">{DEMO_OTP_CODE}</strong>
                </div>
              )}
            </div>

            <form onSubmit={handleVerify} noValidate className="mt-8 flex flex-col items-center w-full">
              <div
                className="flex items-center justify-between w-full max-w-md gap-2 sm:gap-3 mb-2"
                role="group"
                aria-label="6-digit verification code"
              >
                {digits.map((d, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Digit ${idx + 1}`}
                    value={d}
                    onChange={(e) => handleDigitChange(idx, e.target)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      fillFrom(idx, e.clipboardData.getData('text'));
                    }}
                    onFocus={(e) => e.target.select()}
                    className={`w-11 h-14 sm:w-14 sm:h-16 min-w-0 rounded-xl text-center font-headline-md text-headline-md text-on-surface font-semibold outline-none transition-all bg-surface-container-low/40 shadow-[0_1px_3px_rgba(15,23,42,0.06)] focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#006948,0_6px_16px_rgba(0,105,72,0.12)] ${
                      error ? 'ring-2 ring-error/60' : ''
                    }`}
                  />
                ))}
              </div>

              {error ? (
                <div role="alert" className="flex items-center gap-1.5 text-error font-body-sm text-body-sm mt-2 mb-6 text-center">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{error}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm mt-2 mb-6 text-center">
                  <span className="material-symbols-outlined text-[16px] text-outline">keyboard</span>
                  <span>Type or paste the code from your email</span>
                </div>
              )}

              <button
                type="submit"
                disabled={verifying}
                className="w-full h-14 rounded-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md flex items-center justify-center gap-1 shadow-[0_4px_12px_rgba(0,105,72,0.18)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{verifying ? 'Verifying…' : 'Verify & Continue'}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>

              <div className="w-full mt-6 pt-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
                  <span>Didn&apos;t receive the code?</span>
                  {timeLeft > 0 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-on-surface bg-surface-container-low px-2 py-0.5 rounded-md">
                      <span className="material-symbols-outlined text-[15px] text-primary">timer</span>
                      <span>0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timeLeft > 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-primary text-[18px]">forward_to_inbox</span>
                  <span>Resend code</span>
                </button>
                {notice && (
                  <span className="font-body-sm text-body-sm text-on-surface-variant text-center">{notice}</span>
                )}
              </div>
            </form>

            <div className="mt-8 p-4 rounded-xl bg-surface-container-low/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex-shrink-0 flex items-center justify-center text-primary shadow-sm mt-0.5">
                <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold tracking-wide flex items-center gap-1">
                  Decentralized Grid Security
                  <span className="material-symbols-outlined text-secondary text-[14px]">lock</span>
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-0.5">
                  Protected by end-to-end 256-bit encryption for DISCOM smart-meter linkage and live net-meter credit transfers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low/70 py-6">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div className="inline-flex items-center gap-1 bg-surface-container-lowest px-3 py-1 rounded-full text-on-surface-variant shadow-sm">
              <span className="material-symbols-outlined text-primary text-[16px]">
                verified_user
              </span>
              <span className="font-label-sm text-label-sm">Verified Solar Ledger Protocol</span>
            </div>
            <div className="inline-flex items-center gap-1 bg-surface-container-lowest px-3 py-1 rounded-full text-on-surface-variant shadow-sm">
              <span className="material-symbols-outlined text-secondary text-[16px]">lock</span>
              <span className="font-label-sm text-label-sm">CERC / DISCOM Gateway Compliant</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-on-surface-variant font-label-sm text-label-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Network Active
            </span>
            <span>© 2025 SolarCredit Decentralized Utility.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
