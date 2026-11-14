import React from 'react';
import { Link } from 'react-router-dom';

export const ThreeStepWorkflowSection: React.FC = () => {
  const threeStepWorkflow = [
    {
      step: 'Step 01',
      title: 'Generate Solar Surplus',
      subtitle: 'Prosumer Rooftop Array',
      description:
        'Prosumers generate solar electricity on their rooftops. Any power not consumed immediately by the home is exported through a bidirectional smart meter to the local distribution grid.',
      badge: 'IoT Smart Meter Telemetry',
      icon: 'solar_power',
    },
    {
      step: 'Step 02',
      title: 'Mint Energy Credits (1 CC = 1 kWh)',
      subtitle: 'On-Chain Tokenization',
      description:
        'Every verified kilowatt-hour of exported solar surplus is automatically minted as 1 SolarCredit (CC) on the EnergyTrading smart contract with cryptographic meter proof.',
      badge: 'CreditMinted Smart Contract Event',
      icon: 'token',
    },
    {
      step: 'Step 03',
      title: 'Trade P2P & Offset Utility Bills',
      subtitle: 'Instant Consumer Savings',
      description:
        'Prosumers list surplus credits on the P2P Marketplace for instant INR payout. Consumers purchase credits at discounted rates and redeem them directly against monthly electricity bills.',
      badge: 'Atomic Swap & BBPS Bill Offset',
      icon: 'swap_horiz',
    },
  ];

  const fourStepsDetailed = [
    {
      num: '01',
      icon: 'sensors',
      title: 'Track Generation',
      desc: 'Connect your inverter API or IoT smart meter in 60 seconds with zero proprietary hardware.',
      tag: 'Automated API Ping',
    },
    {
      num: '02',
      icon: 'token',
      title: 'Convert to Credits',
      desc: 'Surplus units verified against DISCOM solar data mint fractionalized SolarCredits onto the ledger.',
      tag: 'CERC Rule-compliant',
    },
    {
      num: '03',
      icon: 'swap_horiz',
      title: 'Use or Trade',
      desc: 'Liquidate via peer-to-peer micro-clearing, pay DISCOM utility dues, or cash out straight to UPI.',
      tag: 'Instant Clearing',
    },
    {
      num: '04',
      icon: 'nature_people',
      title: 'Quantify Impact',
      desc: 'Download verified green certificates, CO₂ abatement summaries, and share your ESG credentials.',
      tag: 'Tamper-Proof Audit',
    },
  ];

  return (
    <>
      {/* Required Section: Three-Step Energy Credit Workflow */}
      <section id="workflow" className="w-full px-4 md:px-8 lg:px-10 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-widest">
              Core Energy Credit Lifecycle
            </span>
            <h2 className="mt-2 font-headline-lg text-headline-md md:text-headline-lg font-bold text-on-surface">
              Three-Step Energy Credit Workflow
            </h2>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              How physical solar kilowatt-hours become tradable digital credits that reduce household electricity bills.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
            {threeStepWorkflow.map((item, idx) => (
              <div
                key={item.step}
                className="bg-surface-container-lowest rounded-3xl p-6 md:p-7 shadow-sm border border-outline-variant/15 flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                      {item.step}
                    </span>
                    <div className="w-11 h-11 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                    </div>
                  </div>
                  <span className="font-label-sm text-xs text-primary font-semibold uppercase tracking-wider">
                    {item.subtitle}
                  </span>
                  <h3 className="mt-1 font-headline-sm text-headline-sm font-bold text-on-surface">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="font-label-sm text-xs text-on-surface font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {item.badge}
                  </span>
                  {idx < 2 && (
                    <span className="material-symbols-outlined text-primary text-[18px] hidden lg:inline-block">
                      trending_flat
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Required Section: How SolarCredit Works (Stitch 4-Step Flow) */}
      <section
        id="how-it-works"
        className="w-full px-4 md:px-8 lg:px-10 py-10 md:py-14 bg-surface-container-low/50"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-widest">
              Effortless Workflow
            </span>
            <h2 className="mt-1 font-headline-lg text-headline-md md:text-headline-lg font-bold text-on-surface">
              How SolarCredit Works
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              From sunshine on silicon to liquidated value in your bank or utility invoice in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fourStepsDetailed.map((s) => (
              <div
                key={s.num}
                className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/15 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-headline-lg text-[28px] font-extrabold text-primary">
                      {s.num}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-secondary-container/40 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-[17px] font-bold text-on-surface">
                    {s.title}
                  </h3>
                  <p className="mt-2 font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-4 pt-2 font-label-sm text-[11px] text-primary font-semibold flex items-center gap-1">
                  <span>{s.tag}</span>
                  <span className="material-symbols-outlined text-[14px]">done</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth?mode=signup"
              className="px-6 py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
            >
              <span>Start Trading SolarCredits</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              to="/marketplace"
              className="px-6 py-3 rounded-full bg-surface-container-lowest text-on-surface border border-outline-variant/30 font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors"
            >
              View Live Orderbook
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
