import { CREDIT_VALUE_INR } from '@/lib/constants';
import React from 'react';
import { Link } from 'react-router-dom';

export const DualRoleSection: React.FC = () => {
  return (
    <>
      {/* Stitch Problem Statement: Why Most Rooftop Solar Goes Unrewarded */}
      <section className="w-full px-4 md:px-8 lg:px-10 py-10 md:py-14">
        <div className="max-w-6xl mx-auto flex flex-col">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-widest">
              Systemic Market Inefficiencies
            </span>
            <h2 className="mt-2 font-headline-lg text-headline-md md:text-headline-lg font-bold text-on-surface">
              Why Most Rooftop Solar Goes Unrewarded
            </h2>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Traditional utility settlement leaves distributed renewable micro-generators at the mercy of delayed credits, complex paper tariffs, and zero consumer mobility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]">hourglass_bottom</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Delayed DISCOM Settlement
                </h3>
                <p className="mt-2 font-body-sm text-xs text-on-surface-variant">
                  Manual meter reading cycles trap prosumer surplus value in multi-month reconciliation queues.
                </p>
              </div>
              <div className="mt-5 pt-3 bg-surface-container-low rounded-xl p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">close</span>
                <span className="font-label-sm text-label-sm text-on-surface font-medium">
                  Avg. 74 days reconciliation lag
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]">
                    account_balance_wallet
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Zero Environmental Liquidity
                </h3>
                <p className="mt-2 font-body-sm text-xs text-on-surface-variant">
                  Residential solar owners are locked out of institutional carbon and REC exchanges due to size minimums.
                </p>
              </div>
              <div className="mt-5 pt-3 bg-surface-container-low rounded-xl p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">close</span>
                <span className="font-label-sm text-label-sm text-on-surface font-medium">
                  1 MW minimum barrier for RECs
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]">apartment</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Tenants &amp; Apartments Excluded
                </h3>
                <p className="mt-2 font-body-sm text-xs text-on-surface-variant">
                  Urban renters cannot install private solar arrays, leaving them paying peak retail slab tariffs.
                </p>
              </div>
              <div className="mt-5 pt-3 bg-surface-container-low rounded-xl p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">close</span>
                <span className="font-label-sm text-label-sm text-on-surface font-medium">
                  Urban roof-rights lock-in
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Required Section: Prosumer and Consumer Explanation */}
      <section id="roles" className="w-full px-4 md:px-8 lg:px-10 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-widest">
              Balanced P2P Marketplace
            </span>
            <h2 className="mt-1 font-headline-lg text-headline-md md:text-headline-lg font-bold text-on-surface">
              Built for Both Sides of the Grid: Prosumers &amp; Consumers
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto mt-1">
              Whether generating surplus solar power from your rooftop or purchasing clean credits to reduce your monthly electricity bill.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prosumer Track */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl shadow-md border border-outline-variant/15 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary-container/30 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                    Prosumer Track (Solar Producers)
                  </span>
                  <span className="material-symbols-outlined text-primary text-[28px]">
                    solar_power
                  </span>
                </div>
                <h3 className="mt-4 font-headline-md text-headline-md font-bold text-on-surface">
                  For Solar Rooftop Owners
                </h3>
                <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
                  Transform surplus kWh generation into verified digital energy credits that pay out in INR or instant utility offsets.
                </p>
                <ul className="mt-5 space-y-3 font-body-sm text-body-sm text-on-surface">
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Zero Hardware Upfront:</strong> Integrates directly with SolarEdge, Enphase, Sungrow, and Growatt cloud telemetry.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Automated Ledger Accrual:</strong> Instant token issuance (<code className="font-mono text-primary">1 CC = 1 kWh</code>) for every verified unit exported.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Fast UPI Settlements:</strong> Sell SolarCredits on the P2P orderbook at higher rates than standard feed-in tariffs.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 bg-surface-container-low rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant block">
                    Typical Return Enhancement
                  </span>
                  <span className="font-headline-md text-[24px] font-bold text-primary mt-1 block">
                    +18% to 24% IRR
                  </span>
                </div>
                <Link
                  to="/auth?role=prosumer"
                  className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Connect Solar Node</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Consumer Track */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl shadow-md border border-outline-variant/15 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-surface-container-high rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold">
                    Consumer Track (Energy Buyers)
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[28px]">eco</span>
                </div>
                <h3 className="mt-4 font-headline-md text-headline-md font-bold text-on-surface">
                  For Renters, Homes &amp; Businesses
                </h3>
                <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
                  No rooftop needed. Purchase clean SolarCredits from neighborhood prosumers and apply them directly toward your monthly electricity bill.
                </p>
                <ul className="mt-5 space-y-3 font-body-sm text-body-sm text-on-surface">
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Direct P2P Savings:</strong> Buy SolarCredits from local producers. Each credit takes ₹{CREDIT_VALUE_INR} off your DISCOM bill.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Instant BBPS Bill Redemption:</strong> Apply credits in one click against BESCOM, MSEDCL, TPDDL, or BSES statements.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Scope 2 Carbon Proof:</strong> Receive verifiable on-chain certificates for every kWh of clean energy redeemed.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 bg-surface-container-low rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant block">
                    Entry Threshold
                  </span>
                  <span className="font-headline-md text-[24px] font-bold text-secondary mt-1 block">
                    From ₹250/mo
                  </span>
                </div>
                <Link
                  to="/auth?role=consumer"
                  className="px-5 py-2.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-on-secondary-fixed-variant transition-colors shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Offset Electricity Bill</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
