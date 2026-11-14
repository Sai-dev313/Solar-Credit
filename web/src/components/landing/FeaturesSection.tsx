import React from 'react';

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="w-full px-4 md:px-8 lg:px-10 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-widest">
              Engineered for Reliability
            </span>
            <h2 className="mt-1 font-headline-lg text-headline-md md:text-headline-lg font-bold text-on-surface">
              Next-Generation Energy Accounting Features
            </h2>
          </div>
          <p className="mt-2 md:mt-0 font-body-md text-body-sm md:text-body-md text-on-surface-variant max-w-sm">
            Strict compliance, tamper-resistant telemetry proofs, and native integrations with Indian power protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1: Real-Time Inverter Sync */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/40 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">show_chart</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Real-Time Inverter Sync
                </h3>
              </div>
              <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Direct webhook ingestion compatible with leading solar microinverters. Monitor irradiance efficiency, peak clipping, and micro-grid performance with sub-minute granularity.
              </p>
            </div>
            <div className="mt-5 p-3.5 bg-surface-container-low rounded-2xl">
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2 font-label-sm">
                <span>Peak Inverter Curve (kW)</span>
                <span className="text-primary font-bold">Optimal Yield</span>
              </div>
              <svg className="w-full h-12 text-primary" fill="none" viewBox="0 0 280 50">
                <path
                  d="M0,45 C50,45 70,8 140,8 C210,8 230,45 280,45"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <path
                  d="M0,45 C50,45 70,8 140,8 C210,8 230,45 280,45 L280,50 L0,50 Z"
                  fill="currentColor"
                  fillOpacity="0.08"
                />
              </svg>
            </div>
          </div>

          {/* Feature 2: CERC & SERC Compliance */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">gavel</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  CERC &amp; SERC Compliance
                </h3>
              </div>
              <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Every credit follows national Central Electricity Regulatory Commission renewable energy norms and state net-metering schedules. Zero grey-zone trading.
              </p>
            </div>
            <div className="mt-5 p-3.5 bg-surface-container-low rounded-2xl flex items-center justify-around text-center">
              <div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  100%
                </span>
                <span className="font-label-sm text-[11px] text-on-surface-variant block">
                  Auditable Trace
                </span>
              </div>
              <div className="h-8 w-px bg-outline-variant/40" />
              <div>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  ISO 14064
                </span>
                <span className="font-label-sm text-[11px] text-on-surface-variant block">
                  Carbon Verified
                </span>
              </div>
              <div className="h-8 w-px bg-outline-variant/40" />
              <div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  DISCOM
                </span>
                <span className="font-label-sm text-[11px] text-on-surface-variant block">
                  Net-Meter Ready
                </span>
              </div>
            </div>
          </div>

          {/* Feature 3: BBPS Direct Bill Settlement */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  BBPS Direct Bill Settlement
                </h3>
              </div>
              <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Integrated directly with Bharat Bill Payment System (BBPS). Liquidate your purchased or earned solar credits directly against BESCOM, MSEDCL, TPDDL, or BSES electricity bills.
              </p>
            </div>
            <div className="mt-5 p-3.5 bg-surface-container-low rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">flash_on</span>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Auto-Shave Utility Invoices
                </span>
              </div>
              <span className="font-label-sm text-label-sm font-bold text-primary">
                0% Friction
              </span>
            </div>
          </div>

          {/* Feature 4: Solar AI & Peak Forecasting */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/40 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">psychology</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Solar AI &amp; Peak Forecasting
                </h3>
              </div>
              <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                SolarGPT analyzes local solar irradiance forecasts to guide when to discharge battery storage or export directly to the grid at peak Time-of-Day (ToD) tariff premiums.
              </p>
            </div>
            <div className="mt-5 p-3.5 bg-surface-container-low rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  trending_up
                </span>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Optimal ToD Tariff Timing
                </span>
              </div>
              <span className="font-label-sm text-label-sm font-bold text-secondary">
                +14% Margin
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
