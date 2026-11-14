import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { CREDIT_VALUE_INR } from '@/lib/constants';

interface SellCreditsFormProps {
  maxCredits: number;
  onCreateOffer: (creditsKwh: number, pricePerKwh: number) => Promise<void>;
}

export const SellCreditsForm: React.FC<SellCreditsFormProps> = ({
  maxCredits,
  onCreateOffer,
}) => {
  const [creditsKwh, setCreditsKwh] = useState<number>(20);
  const [pricePerKwh, setPricePerKwh] = useState<number>(CREDIT_VALUE_INR);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await onCreateOffer(creditsKwh, pricePerKwh);
      setSuccess(`Listed ${creditsKwh} CC (kWh) on the P2P order book!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create listing');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-4"
    >
      <div>
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          List Surplus Solar Credits for Sale
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
          Available in your wallet: <strong className="text-primary">{maxCredits} CC (kWh)</strong>
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-container px-3 py-2 text-xs text-on-error-container">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-primary/20 bg-secondary-container/30 px-3 py-2 text-xs text-on-secondary-container font-semibold">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1">
            Credits to Sell (CC / kWh)
          </label>
          <input
            type="number"
            min={1}
            max={maxCredits}
            step={0.5}
            value={creditsKwh}
            onChange={(e) => setCreditsKwh(Number(e.target.value))}
            className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1">
            Ask price (₹ / CC)
          </label>
          <input
            type="number"
            min={0.5}
            max={10}
            step={0.05}
            value={pricePerKwh}
            onChange={(e) => setPricePerKwh(Number(e.target.value))}
            className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 font-body-sm text-body-sm text-on-surface-variant">
        <span>Estimated Settlement Payout:</span>
        <span className="font-title-md text-title-md font-bold text-primary">
          ₹{(creditsKwh * pricePerKwh).toFixed(2)}
        </span>
      </div>

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-container hover:opacity-95 text-on-primary font-label-md text-label-md px-4 py-2.5 transition-all cursor-pointer"
      >
        <PlusCircle className="h-4 w-4" />
        Publish Ask Order to Ledger
      </button>
    </form>
  );
};
