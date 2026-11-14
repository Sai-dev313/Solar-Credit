import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useApp } from '@/hooks/useApp';
import { DISCOM_PROVIDERS } from '@/lib/constants';
import { Select } from '@/components/common/Select';
import { displayName, getInitials } from '@/utils/profile';
import { UserProfile } from '@/types';

interface ProfileForm {
  fullName: string;
  phone: string;
  location: string;
  discomProvider: string;
  consumerNumber: string;
  upiId: string;
  // producer
  solarCapacityKw: string;
  inverterModel: string;
  installationDate: string;
  netMeteringId: string;
  // consumer
  connectionType: string;
  sanctionedLoadKw: string;
  monthlyUsageKwh: string;
}

const numStr = (n?: number) => (n != null ? String(n) : '');
const optNum = (v: string) => (v.trim() ? Number(v) : undefined);
const optStr = (v: string) => v.trim() || undefined;

const toForm = (p: UserProfile): ProfileForm => ({
  fullName: p.fullName ?? '',
  phone: p.phone ?? '',
  location: p.location ?? '',
  discomProvider: p.discomProvider ?? '',
  consumerNumber: p.consumerNumber ?? '',
  upiId: p.upiId ?? '',
  solarCapacityKw: numStr(p.solarCapacityKw),
  inverterModel: p.inverterModel ?? '',
  installationDate: p.installationDate ?? '',
  netMeteringId: p.netMeteringId ?? '',
  connectionType: p.connectionType ?? '',
  sanctionedLoadKw: numStr(p.sanctionedLoadKw),
  monthlyUsageKwh: numStr(p.monthlyUsageKwh),
});

const CONNECTION_TYPES = [
  { value: 'domestic', label: 'Domestic (household)' },
  { value: 'commercial', label: 'Commercial (shop / office)' },
  { value: 'industrial', label: 'Industrial' },
];

const validate = (f: ProfileForm, isProducer: boolean): Partial<Record<keyof ProfileForm, string>> => {
  const errors: Partial<Record<keyof ProfileForm, string>> = {};
  if (!f.fullName.trim()) errors.fullName = 'Name is required.';
  const phoneDigits = f.phone.replace(/[\s-]/g, '').replace(/^\+91/, '');
  if (f.phone.trim() && !/^[6-9]\d{9}$/.test(phoneDigits)) {
    errors.phone = 'Enter a 10-digit Indian mobile number.';
  }
  if (f.consumerNumber.trim() && !/^\d{6,15}$/.test(f.consumerNumber.trim())) {
    errors.consumerNumber = 'Consumer number should be 6–15 digits.';
  }
  if (f.upiId.trim() && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(f.upiId.trim())) {
    errors.upiId = 'Enter a valid UPI ID, e.g. name@okbank.';
  }
  const checkRange = (key: keyof ProfileForm, max: number, unit: string) => {
    if (!f[key].trim()) return;
    const n = Number(f[key]);
    if (!Number.isFinite(n) || n <= 0 || n > max) errors[key] = `Enter a value between 0 and ${max} ${unit}.`;
  };
  if (isProducer) {
    checkRange('solarCapacityKw', 1000, 'kWp');
    if (f.installationDate && f.installationDate > new Date().toISOString().slice(0, 10)) {
      errors.installationDate = 'Installation date cannot be in the future.';
    }
  } else {
    checkRange('sanctionedLoadKw', 10000, 'kW');
    checkRange('monthlyUsageKwh', 1000000, 'kWh');
  }
  return errors;
};

const inputClass =
  'w-full px-4 py-3 bg-surface-container-low rounded-xl font-body-md text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all';

const Field: React.FC<{
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, hint, error, children }) => (
  <label className="block">
    <span className="block font-label-md text-label-md text-on-surface mb-2">{label}</span>
    {children}
    {error ? (
      <span className="block mt-1.5 font-body-sm text-body-sm text-error">{error}</span>
    ) : hint ? (
      <span className="block mt-1.5 font-body-sm text-body-sm text-on-surface-variant">{hint}</span>
    ) : null}
  </label>
);

const ReadOnlyRow: React.FC<{ icon: string; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low">
    <div className="w-9 h-9 shrink-0 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </div>
    <div className="min-w-0">
      <div className="font-label-sm text-label-sm text-on-surface-variant">{label}</div>
      <div className="font-label-md text-label-md text-on-surface font-semibold truncate">{value}</div>
    </div>
  </div>
);

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile, connectUserWallet } = useApp();
  const isProducer = profile.role === 'prosumer';

  const [form, setForm] = useState<ProfileForm>(() => toForm(profile));
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [walletBusy, setWalletBusy] = useState(false);

  // Keep the form in sync when the stored profile loads or changes
  useEffect(() => {
    setForm(toForm(profile));
  }, [profile]);

  const original = toForm(profile);
  const isDirty = (Object.keys(form) as (keyof ProfileForm)[]).some((k) => form[k] !== original[k]);

  const set = (key: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  // For the custom dropdowns, which give a value instead of an event
  const pick = (key: keyof ProfileForm) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(form, isProducer);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setBanner({ kind: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        location: form.location.trim(),
        discomProvider: form.discomProvider || undefined,
        consumerNumber: form.consumerNumber.trim() || undefined,
        upiId: form.upiId.trim() || undefined,
        ...(isProducer
          ? {
              solarCapacityKw: optNum(form.solarCapacityKw),
              inverterModel: optStr(form.inverterModel),
              installationDate: optStr(form.installationDate),
              netMeteringId: optStr(form.netMeteringId),
            }
          : {
              connectionType: optStr(form.connectionType) as UserProfile['connectionType'],
              sanctionedLoadKw: optNum(form.sanctionedLoadKw),
              monthlyUsageKwh: optNum(form.monthlyUsageKwh),
            }),
      });
      setBanner({ kind: 'ok', text: 'Profile saved.' });
    } catch (err) {
      setBanner({ kind: 'error', text: err instanceof Error ? err.message : 'Could not save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(original);
    setErrors({});
    setBanner(null);
  };

  const handleConnectWallet = async () => {
    setWalletBusy(true);
    try {
      await connectUserWallet();
    } catch (err) {
      setBanner({ kind: 'error', text: err instanceof Error ? err.message : 'Could not connect wallet.' });
    } finally {
      setWalletBusy(false);
    }
  };

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
  const discomLabel =
    DISCOM_PROVIDERS.find((d) => d.value === profile.discomProvider)?.label ?? 'Not linked';

  return (
    <DashboardShell portalLabel="My Profile">
      <div className="flex flex-col w-full pb-16 pt-6 gap-6 max-w-5xl">
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">My Profile</h1>

        {/* Identity card */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="w-20 h-20 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold">
            {getInitials(profile.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight truncate">
              {displayName(profile.fullName)}
            </div>
            <div className="font-body-md text-body-md text-on-surface-variant truncate">{profile.email}</div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">
                  {isProducer ? 'solar_power' : 'electric_bolt'}
                </span>
                {isProducer ? 'Producer' : 'Consumer'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                Member since {memberSince}
              </span>
              {profile.location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {profile.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {banner && (
          <div
            role="status"
            className={`rounded-2xl px-5 py-3.5 flex items-center justify-between gap-3 font-label-md text-label-md ${
              banner.kind === 'ok'
                ? 'bg-secondary-container/40 border border-primary/20 text-on-secondary-container'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">
                {banner.kind === 'ok' ? 'check_circle' : 'error'}
              </span>
              {banner.text}
            </span>
            <button type="button" onClick={() => setBanner(null)} className="text-xs underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Editable details */}
          <form
            onSubmit={handleSave}
            noValidate
            className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-8"
          >
            <section className="flex flex-col gap-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Personal details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full name" error={errors.fullName}>
                  <input className={inputClass} value={form.fullName} onChange={set('fullName')} />
                </Field>
                <Field label="Email" hint="Contact support to change your login email.">
                  <input className={`${inputClass} opacity-70 cursor-not-allowed`} value={profile.email} readOnly />
                </Field>
                <Field label="Mobile number" hint="Used for OTP and bill alerts." error={errors.phone}>
                  <input
                    className={inputClass}
                    type="tel"
                    inputMode="tel"
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={set('phone')}
                  />
                </Field>
                <Field label="Address / location">
                  <input
                    className={inputClass}
                    placeholder="Area, city"
                    value={form.location}
                    onChange={set('location')}
                  />
                </Field>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Electricity connection
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="DISCOM / provider">
                  <Select
                    ariaLabel="DISCOM / provider"
                    value={form.discomProvider}
                    onChange={pick('discomProvider')}
                    options={DISCOM_PROVIDERS}
                    placeholder="Select your provider"
                  />
                </Field>
                <Field
                  label="Consumer number"
                  hint="Printed on your electricity bill. Used for BBPS payments."
                  error={errors.consumerNumber}
                >
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="e.g. 4029184420"
                    value={form.consumerNumber}
                    onChange={set('consumerNumber')}
                  />
                </Field>
                {!isProducer && (
                  <>
                    <Field label="Connection type">
                      <Select
                        ariaLabel="Connection type"
                        value={form.connectionType}
                        onChange={pick('connectionType')}
                        options={CONNECTION_TYPES}
                        placeholder="Select connection type"
                      />
                    </Field>
                    <Field
                      label="Sanctioned load (kW)"
                      hint="Shown on your electricity bill."
                      error={errors.sanctionedLoadKw}
                    >
                      <input
                        className={inputClass}
                        type="number"
                        step="0.1"
                        min="0"
                        value={form.sanctionedLoadKw}
                        onChange={set('sanctionedLoadKw')}
                      />
                    </Field>
                    <Field
                      label="Average monthly usage (kWh)"
                      hint="Helps estimate how many credits you need each month."
                      error={errors.monthlyUsageKwh}
                    >
                      <input
                        className={inputClass}
                        type="number"
                        step="1"
                        min="0"
                        value={form.monthlyUsageKwh}
                        onChange={set('monthlyUsageKwh')}
                      />
                    </Field>
                  </>
                )}
              </div>
            </section>

            {isProducer && (
              <section className="flex flex-col gap-4">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Solar system
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Solar capacity (kWp)" error={errors.solarCapacityKw}>
                    <input
                      className={inputClass}
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.solarCapacityKw}
                      onChange={set('solarCapacityKw')}
                    />
                  </Field>
                  <Field label="Inverter make / model">
                    <input
                      className={inputClass}
                      placeholder="e.g. Growatt MIN 5000TL-X"
                      value={form.inverterModel}
                      onChange={set('inverterModel')}
                    />
                  </Field>
                  <Field label="Installation date" error={errors.installationDate}>
                    <input
                      className={inputClass}
                      type="date"
                      value={form.installationDate}
                      onChange={set('installationDate')}
                    />
                  </Field>
                  <Field label="Net-metering sanction number" hint="Issued by your DISCOM for grid export.">
                    <input
                      className={inputClass}
                      placeholder="e.g. NM/BLR/2025/01842"
                      value={form.netMeteringId}
                      onChange={set('netMeteringId')}
                    />
                  </Field>
                </div>
              </section>
            )}

            <section className="flex flex-col gap-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Payments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="UPI ID"
                  hint={isProducer ? 'Payouts from credit sales go here.' : 'Used for refunds and top-ups.'}
                  error={errors.upiId}
                >
                  <input
                    className={inputClass}
                    placeholder="name@okbank"
                    value={form.upiId}
                    onChange={set('upiId')}
                  />
                </Field>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!isDirty || saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-on-primary-fixed-variant transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={!isDirty || saving}
                className="px-5 py-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Account summary (read-only) */}
          <aside className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">Account</h2>
            <ReadOnlyRow icon="eco" label="Credit balance" value={`${profile.creditBalance} CC`} />
            <ReadOnlyRow icon="speed" label="Smart meter ID" value={profile.smartMeterId || '—'} />
            <ReadOnlyRow icon="electrical_services" label="DISCOM" value={discomLabel} />
            {isProducer ? (
              <>
                <ReadOnlyRow
                  icon="solar_power"
                  label="Solar capacity"
                  value={profile.solarCapacityKw != null ? `${profile.solarCapacityKw} kWp` : 'Not set'}
                />
                <ReadOnlyRow
                  icon="verified"
                  label="Net-metering"
                  value={profile.netMeteringId ? 'Sanction no. added' : 'Not added'}
                />
              </>
            ) : (
              <>
                <ReadOnlyRow
                  icon="home"
                  label="Connection"
                  value={
                    CONNECTION_TYPES.find((c) => c.value === profile.connectionType)?.label ?? 'Not set'
                  }
                />
                <ReadOnlyRow
                  icon="bolt"
                  label="Monthly usage"
                  value={profile.monthlyUsageKwh != null ? `${profile.monthlyUsageKwh} kWh` : 'Not set'}
                />
              </>
            )}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-label-sm text-label-sm text-on-surface-variant">Wallet</div>
                {profile.walletAddress ? (
                  <div className="font-label-md text-label-md text-on-surface font-semibold font-mono truncate">
                    {profile.walletAddress}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    disabled={walletBusy}
                    className="font-label-md text-label-md text-primary font-semibold hover:underline cursor-pointer disabled:opacity-60"
                  >
                    {walletBusy ? 'Connecting…' : 'Connect wallet'}
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
};
