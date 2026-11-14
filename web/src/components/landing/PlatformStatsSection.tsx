import React from 'react';
import { CREDIT_VALUE_INR } from '@/lib/constants';

interface StatMetric {
  value: string;
  label: string;
  sublabel: string;
  icon: string;
}

const platformMetrics: StatMetric[] = [
  {
    value: '1.24M+ kWh',
    label: 'Clean Solar Surplus Traded',
    sublabel: 'Verified smart meter exports',
    icon: 'solar_power',
  },
  {
    value: `₹${CREDIT_VALUE_INR} / CC`,
    label: 'Bill Value per Credit',
    sublabel: '1 credit = 1 kWh of verified solar',
    icon: 'currency_rupee',
  },
  {
    value: '1,280+ Nodes',
    label: 'Active Prosumers & Buyers',
    sublabel: 'Across BESCOM, MSEDCL & TPDDL',
    icon: 'groups',
  },
  {
    value: '1,016 Tons',
    label: 'CO₂ Emissions Abated',
    sublabel: 'ISO 14064 audited ledger proof',
    icon: 'eco',
  },
];

export const PlatformStatsSection: React.FC = () => {
  return (
    <section
      id="stats"
      aria-label="Platform Statistics"
      className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-10"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {platformMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 shadow-sm border border-outline-variant/15 flex flex-col justify-between hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {metric.label}
                </span>
                <div className="w-9 h-9 rounded-xl bg-secondary-container/40 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">{metric.icon}</span>
                </div>
              </div>
              <div>
                <p className="font-headline-lg text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
                  {metric.value}
                </p>
                <p className="font-body-sm text-xs text-primary font-medium mt-1">
                  {metric.sublabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
