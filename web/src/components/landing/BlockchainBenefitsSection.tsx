import React from 'react';
import { Link } from 'react-router-dom';

export const BlockchainBenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: 'verified_user',
      title: '1:1 Smart Meter Oracle Proof',
      eventTag: 'CreditMinted(prosumer, kwhAmount)',
      description:
        'Credits can only be minted when signed telemetry from an approved bidirectional smart meter confirms physical kWh export to the local distribution transformer.',
    },
    {
      icon: 'lock',
      title: 'Atomic Smart Contract Escrow',
      eventTag: 'ListingCreated & CreditsPurchased',
      description:
        'When a prosumer lists credits, the CC tokens are held in EnergyTrading.sol escrow. Settlement occurs atomically when a consumer purchases credits—eliminating counterparty risk.',
    },
    {
      icon: 'local_fire_department',
      title: 'Zero Double-Counting Guarantee',
      eventTag: 'CreditRedeemed(consumer, billId, kwh)',
      description:
        'Once a consumer applies SolarCredits toward a monthly utility bill, those tokens are cryptographically retired on-chain so the same kWh can never be resold or claimed twice.',
    },
    {
      icon: 'visibility',
      title: 'Public Real-Time Audit Trail',
      eventTag: 'Sepolia Ledger + Supabase chain-sync',
      description:
        'Every mint, P2P trade, and BBPS utility bill offset is indexed in real time with a verifiable Sepolia transaction hash and block number.',
    },
  ];

  return (
    <section
      id="blockchain-benefits"
      className="w-full px-4 md:px-8 lg:px-10 py-10 md:py-16 bg-surface-container-low/60"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-widest">
              Trustless Settlement Architecture
            </span>
            <h2 className="mt-1 font-headline-lg text-headline-md md:text-headline-lg font-bold text-on-surface">
              Benefits of Blockchain Verification
            </h2>
          </div>
          <p className="font-body-md text-body-sm md:text-body-md text-on-surface-variant max-w-md">
            Powered by <code className="font-mono text-primary font-semibold">EnergyTrading.sol</code> on Ethereum Sepolia and synchronized with our real-time <code className="font-mono text-primary font-semibold">chain-sync</code> indexer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="bg-surface-container-lowest p-6 md:p-7 rounded-3xl shadow-sm border border-outline-variant/15 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-secondary-container/40 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                  </div>
                  <code className="px-3 py-1 rounded-full bg-surface-container text-primary font-mono text-[11px] font-semibold">
                    {item.eventTag}
                  </code>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-2.5 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-outline-variant/15 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-label-sm">Verification Status</span>
                <span className="text-primary font-bold inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  On-Chain Enforced
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Contract Callout Bar */}
        <div className="mt-8 bg-surface-container-lowest rounded-2xl p-5 md:p-6 shadow-sm border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
            <div>
              <p className="font-label-md text-label-md font-bold text-on-surface">
                Sepolia Smart Contract: <code className="font-mono text-primary">0x8F2E71A9...4C310A</code>
              </p>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Inspect live minted credits, escrow listings, and bill offset burn proofs in the Explorer.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              to="/blockchain"
              className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-xs sm:text-sm font-semibold hover:bg-primary-container transition-all flex items-center gap-1.5"
            >
              <span>Open Chain Explorer</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </Link>
            <Link
              to="/transactions"
              className="px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-xs sm:text-sm font-semibold hover:bg-surface-container-high transition-colors"
            >
              Audit Ledger
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
