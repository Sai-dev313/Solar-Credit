import React, { useState } from 'react';
import { CheckCircle2, CreditCard, Receipt, Sparkles, Zap } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { formatCurrency, formatKwh } from '@/utils/format';

export const BillsPage: React.FC = () => {
  const { profile, bills, applyCreditsToBill, payRemainingBill } = useApp();
  const [selectedCredits, setSelectedCredits] = useState<number>(50);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApplyCredits = async (billId: string) => {
    setMessage(null);
    setError(null);
    try {
      await applyCreditsToBill(billId, selectedCredits);
      setMessage(`Applied ${selectedCredits} CC (kWh) of SolarCredits toward bill ${billId}!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not apply credits');
    }
  };

  const handlePayRemaining = async (billId: string) => {
    setMessage(null);
    setError(null);
    try {
      await payRemainingBill(billId);
      setMessage(`Paid remaining balance for ${billId}. BBPS statement marked as settled!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    }
  };

  return (
    <DashboardShell portalLabel="BBPS Utility Bill Settlement">
      <div className="w-full py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
              BBPS & DISCOM Settlement Engine
            </span>
            <h1 className="font-headline-md text-headline-md text-on-surface mt-0.5">
              Electricity Bills & Credit Offset
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Redeem your purchased or generated SolarCredits (`1 CC = 1 kWh Offset`) directly against
              your monthly utility statement.
            </p>
          </div>

          <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block">
                Redeemable Credit Balance
              </span>
              <span className="font-title-md text-title-md font-bold text-on-surface">
                {formatKwh(profile.creditBalance)}
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-primary/20 bg-secondary-container/30 px-4 py-3 text-xs font-semibold text-on-secondary-container">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-error/30 bg-error-container px-4 py-3 text-xs font-semibold text-on-error-container">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {bills.map((bill) => {
            const remainingKwh = Math.max(0, bill.totalConsumptionKwh - bill.creditsAppliedKwh);
            return (
              <div
                key={bill.id}
                className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-primary" />
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      {bill.billingPeriod}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-0.5 font-label-sm text-label-sm ${
                        bill.status === 'paid'
                          ? 'bg-secondary-container/30 text-on-secondary-container'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      {bill.status === 'paid' ? 'Paid in Full' : 'Open DISCOM Statement'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Grid Consumption
                      </span>
                      <p className="font-title-md text-title-md font-bold text-on-surface mt-0.5">
                        {formatKwh(bill.totalConsumptionKwh)}
                      </p>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Gross Utility Charge
                      </span>
                      <p className="font-title-md text-title-md font-bold text-on-surface mt-0.5">
                        {formatCurrency(bill.grossAmountInr)}
                      </p>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        SolarCredits Applied
                      </span>
                      <p className="font-title-md text-title-md font-bold text-primary mt-0.5">
                        {formatKwh(bill.creditsAppliedKwh)} (-{formatCurrency(bill.creditSavingsInr)})
                      </p>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Net Payable
                      </span>
                      <p className="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
                        {formatCurrency(bill.netPayableInr)}
                      </p>
                    </div>
                  </div>
                </div>

                {bill.status !== 'paid' ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-outline-variant/15">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={Math.min(profile.creditBalance, remainingKwh)}
                        value={selectedCredits}
                        onChange={(e) => setSelectedCredits(Number(e.target.value))}
                        className="w-20 rounded-lg border border-outline-variant/30 bg-surface-container-low px-2.5 py-2 text-xs text-on-surface"
                      />
                      <button
                        onClick={() => handleApplyCredits(bill.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-primary to-primary-container hover:opacity-95 text-on-primary font-label-md text-label-md px-3.5 py-2 transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Redeem Credits
                      </button>
                    </div>

                    <button
                      onClick={() => handlePayRemaining(bill.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md px-3.5 py-2 transition-colors cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                      Pay {formatCurrency(bill.netPayableInr)}
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    BBPS Settled
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
};
