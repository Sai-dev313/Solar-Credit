import React, { useEffect, useState } from 'react';
import { useApp } from '@/hooks/useApp';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { blockchainService } from '@/services/blockchain.service';
import { formatKwh, formatRelativeTime } from '@/utils/format';
import {
  EVENT_LABELS,
  etherscanAddressUrl,
  etherscanTxUrl,
  getProofStatus,
  isFullTxHash,
  isRealAddress,
  shortHash,
} from '@/utils/proof';
import { ChainEventLog, ProofStatus } from '@/types';

type Filter = 'all' | ProofStatus;

const STATUS_STYLE: Record<ProofStatus, { label: string; icon: string; className: string }> = {
  verified: {
    label: 'Verified',
    icon: 'verified',
    className: 'bg-secondary-container/50 text-on-secondary-container',
  },
  pending: {
    label: 'Pending',
    icon: 'progress_activity',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
  failed: {
    label: 'Failed',
    icon: 'error',
    className: 'bg-error-container text-on-error-container',
  },
};

const StatusBadge: React.FC<{ status: ProofStatus }> = ({ status }) => {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap ${s.className}`}
    >
      <span className={`material-symbols-outlined text-[15px] ${status === 'pending' ? 'animate-spin' : ''}`}>
        {s.icon}
      </span>
      {s.label}
    </span>
  );
};

/** Tx hash with an Etherscan link when it's a real, complete hash */
const TxHashCell: React.FC<{ evt: ChainEventLog; isDemoMode: boolean }> = ({ evt, isDemoMode }) => {
  const status = getProofStatus(evt);
  if (!evt.txHash) {
    return (
      <span className="text-on-surface-variant italic">
        {status === 'failed' ? 'Not sent' : 'Waiting for confirmation…'}
      </span>
    );
  }
  if (!isDemoMode && isFullTxHash(evt.txHash)) {
    return (
      <a
        href={etherscanTxUrl(evt.txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-mono text-primary hover:underline"
      >
        {shortHash(evt.txHash)}
        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
      </a>
    );
  }
  return (
    <span className="font-mono text-on-surface-variant" title="Demo mode: this hash is not on Sepolia">
      {shortHash(evt.txHash)}
    </span>
  );
};

export const BlockchainPage: React.FC = () => {
  const { chainEvents, isDemoMode, refreshAll } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const counts = chainEvents.reduce(
    (acc, e) => {
      acc[getProofStatus(e)] += 1;
      return acc;
    },
    { verified: 0, pending: 0, failed: 0 } as Record<ProofStatus, number>
  );
  const visible = filter === 'all' ? chainEvents : chainEvents.filter((e) => getProofStatus(e) === filter);

  // While anything is pending, check every few seconds for the tx hash to come back
  useEffect(() => {
    if (counts.pending === 0) return;
    const id = setInterval(() => {
      refreshAll();
    }, 2500);
    return () => clearInterval(id);
  }, [counts.pending, refreshAll]);

  const contract = blockchainService.contractAddress;
  const contractIsLive = isRealAddress(contract);

  return (
    <DashboardShell portalLabel="Blockchain Proof">
      <div className="w-full py-6 space-y-6 pb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Blockchain Proof</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
              Every credit action is recorded on the Ethereum Sepolia test network.{' '}
              <strong className="text-on-surface">Verified</strong> means the transaction is confirmed
              on-chain and anyone can check it on Etherscan.
            </p>
          </div>

          <div className="rounded-xl bg-surface-container-lowest px-4 py-3 shadow-sm min-w-0">
            <span className="block font-label-sm text-label-sm text-on-surface-variant">
              EnergyTrading contract • Sepolia (chain {blockchainService.chainId})
            </span>
            {contractIsLive ? (
              <a
                href={etherscanAddressUrl(contract)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono font-bold text-primary hover:underline"
              >
                {shortHash(contract, 8, 6)}
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            ) : (
              <span className="font-label-md text-label-md text-on-surface-variant">Not deployed yet</span>
            )}
          </div>
        </div>

        {isDemoMode && (
          <div className="rounded-xl bg-surface-container-low px-4 py-3 flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">info</span>
            <span>
              Demo mode: events are confirmed by a simulator a few seconds after you act, and hashes are not on
              Sepolia, so there are no Etherscan links.
            </span>
          </div>
        )}

        {/* Summary + filter */}
        <div className="grid grid-cols-3 gap-3">
          {(['verified', 'pending', 'failed'] as ProofStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(filter === s ? 'all' : s)}
              aria-pressed={filter === s}
              className={`rounded-2xl p-4 text-left shadow-sm transition-all cursor-pointer ${
                filter === s ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest hover:bg-surface-container-low'
              }`}
            >
              <div className={`font-label-sm text-label-sm ${filter === s ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                {STATUS_STYLE[s].label}
              </div>
              <div className="font-headline-md text-headline-md font-bold">{counts[s]}</div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              {filter === 'all' ? 'All events' : `${STATUS_STYLE[filter].label} events`} ({visible.length})
            </h2>
            {filter !== 'all' && (
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="font-label-md text-label-md text-primary hover:underline cursor-pointer"
              >
                Show all
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="px-5 pb-6 font-body-md text-body-md text-on-surface-variant">Nothing here yet.</p>
          ) : (
            <>
              {/* Phone: one card per event */}
              <ul className="md:hidden divide-y divide-outline-variant/20">
                {visible.map((evt) => {
                  const meta = EVENT_LABELS[evt.eventName];
                  return (
                    <li key={evt.id} className="px-5 py-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 font-label-md text-label-md text-on-surface font-semibold">
                          <span className="material-symbols-outlined text-[20px] text-primary">{meta.icon}</span>
                          {meta.label}
                        </span>
                        <StatusBadge status={getProofStatus(evt)} />
                      </div>
                      <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                        <span className="font-semibold text-on-surface">{formatKwh(evt.amountKwh)}</span>
                        <span>{formatRelativeTime(evt.timestamp)}</span>
                      </div>
                      <div className="font-body-sm text-body-sm flex items-center justify-between gap-2">
                        <TxHashCell evt={evt} isDemoMode={isDemoMode} />
                        {evt.blockNumber != null && (
                          <span className="font-mono text-on-surface-variant">#{evt.blockNumber}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse font-body-sm text-body-sm">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">From → To</th>
                      <th className="py-3 px-4">Transaction</th>
                      <th className="py-3 px-4">Block</th>
                      <th className="py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {visible.map((evt) => {
                      const meta = EVENT_LABELS[evt.eventName];
                      return (
                        <tr key={evt.id} className="hover:bg-surface-container-low/60">
                          <td className="py-3 px-4">
                            <StatusBadge status={getProofStatus(evt)} />
                          </td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-2 text-on-surface font-semibold">
                              <span className="material-symbols-outlined text-[18px] text-primary">{meta.icon}</span>
                              {meta.label}
                            </span>
                            <span className="font-mono text-[11px] text-on-surface-variant">{evt.eventName}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-on-surface whitespace-nowrap">
                            {formatKwh(evt.amountKwh)}
                          </td>
                          <td className="py-3 px-4 font-mono text-on-surface-variant whitespace-nowrap">
                            {evt.fromWallet} → {evt.toWallet}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <TxHashCell evt={evt} isDemoMode={isDemoMode} />
                          </td>
                          <td className="py-3 px-4 font-mono text-on-surface-variant">
                            {evt.blockNumber != null ? `#${evt.blockNumber}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                            {formatRelativeTime(evt.timestamp)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
};
