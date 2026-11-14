import React from 'react';
import { Activity, CheckCircle2, Shield, Users, Zap } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { StatCard } from '@/components/common/StatCard';
import { formatKwh } from '@/utils/format';

export const AdminPage: React.FC = () => {
  const { stats, listings, transactions } = useApp();

  const totalTradedKwh = transactions.reduce((acc, t) => acc + t.creditsKwh, 0);

  return (
    <DashboardShell portalLabel="Grid Administration & Smart Meter Approvals">
      <div className="w-full py-6 space-y-6">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
            DISCOM & Microgrid Operator Console
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface mt-0.5">
            Grid Administration & Smart Meter Approvals
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Monitor regional P2P solar settlement volume, verify producer smart meters, and audit CERC tariff parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Verified Producer Meters"
            value="42 Nodes"
            trend="+4 this week"
            subtitle="BESCOM / TPDDL Zone 4"
            icon={Users}
            accentColor="emerald"
          />
          <StatCard
            title="Total Volume Settled"
            value={formatKwh(totalTradedKwh)}
            subtitle="Across all contract events"
            icon={Zap}
            accentColor="yellow"
          />
          <StatCard
            title="Active Market Depth"
            value={formatKwh(
              listings.reduce((acc, l) => acc + l.creditsAvailable, 0)
            )}
            subtitle={`${listings.length} total listings`}
            icon={Activity}
            accentColor="sky"
          />
          <StatCard
            title="DISCOM Base Tariff"
            value={`₹${stats.gridPricePerKwh.toFixed(2)} / kWh`}
            subtitle="Oracle reference price"
            icon={Shield}
            accentColor="purple"
          />
        </div>

        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Registered Smart Meters & Producer Nodes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {[
              { meter: 'SM-IN-884920', owner: 'Solar Farm #402 (Alex Rivera)', cap: '12.5 kWp', zone: 'Zone 4' },
              { meter: 'SM-IN-772104', owner: 'Solar Farm #118 (Elena Vance)', cap: '18.0 kWp', zone: 'Zone 4' },
              { meter: 'SM-IN-619042', owner: 'Solar Farm #309 (Marcus Chen)', cap: '9.5 kWp', zone: 'Zone 2' },
            ].map((node) => (
              <div
                key={node.meter}
                className="rounded-lg border border-outline-variant/15 bg-surface-container-low p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-mono font-bold text-on-surface">{node.meter}</p>
                  <p className="text-on-surface-variant mt-0.5">
                    {node.owner} • {node.cap} ({node.zone})
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-primary font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};
