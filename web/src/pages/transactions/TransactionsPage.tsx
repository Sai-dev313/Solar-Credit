import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { EnergyTransaction } from '@/types';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { formatCurrency, formatKwh, formatRelativeTime } from '@/utils/format';

export const TransactionsPage: React.FC = () => {
  const { transactions } = useApp();

  const badgeColors: Record<EnergyTransaction['type'], string> = {
    MINT: 'bg-secondary-container/30 text-on-secondary-container border-primary/15',
    LIST: 'bg-surface-container text-on-surface border-outline-variant/30',
    CANCEL: 'bg-surface-container-high text-on-surface-variant border-outline-variant/30',
    PURCHASE: 'bg-secondary-container/40 text-primary border-primary/20',
    BILL_OFFSET: 'bg-primary-fixed/40 text-on-primary-fixed border-primary/20',
  };

  return (
    <DashboardShell portalLabel="Audit Trail & Transaction Ledger">
      <div className="w-full py-6 space-y-6">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
            Cryptographic Audit Trail & Ledger
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface mt-0.5">
            Energy Credit Transactions
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Complete immutable history of minted solar generation, P2P marketplace trades, and BBPS utility bill redemptions.
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/15 bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tx ID</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Counterparty / Oracle</th>
                  <th className="py-3.5 px-4">Energy Credits</th>
                  <th className="py-3.5 px-4">Settlement Value</th>
                  <th className="py-3.5 px-4">Sepolia Tx Hash</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-on-surface-variant">{tx.id}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          badgeColors[tx.type] || ''
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface font-semibold">
                      {tx.counterpartyName}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface">
                      {formatKwh(tx.creditsKwh)}
                    </td>
                    <td className="py-3.5 px-4 text-primary font-semibold">
                      {tx.totalInr > 0 ? formatCurrency(tx.totalInr) : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-on-surface-variant">
                      <span className="inline-flex items-center gap-1 hover:text-primary cursor-pointer">
                        {tx.txHash}
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      {formatRelativeTime(tx.timestamp)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-primary font-semibold capitalize">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};
