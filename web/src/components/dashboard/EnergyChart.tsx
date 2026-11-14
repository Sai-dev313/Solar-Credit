import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EnergyGenerationPoint } from '@/types';

interface EnergyChartProps {
  data: EnergyGenerationPoint[];
}

export const EnergyChart: React.FC<EnergyChartProps> = ({ data }) => {
  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Smart Meter Telemetry (24h Profile)
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Solar PV Generation vs. Household Consumption & Surplus Export (kWh / CC)
          </p>
        </div>
        <div className="flex items-center gap-4 font-label-sm text-label-sm">
          <span className="flex items-center gap-1.5 text-primary">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Generated
          </span>
          <span className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="h-2.5 w-2.5 rounded-full bg-outline" />
            Consumed
          </span>
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-container" />
            Exported (Minted CC)
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradGen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006948" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#006948" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c7a71" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6c7a71" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00855d" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00855d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e7ff" />
            <XAxis dataKey="time" stroke="#3c4a42" fontSize={12} />
            <YAxis stroke="#3c4a42" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#bbcabf',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#131b2e',
              }}
            />
            <Area
              type="monotone"
              dataKey="generatedKwh"
              name="Generated (kWh)"
              stroke="#006948"
              fillOpacity={1}
              fill="url(#gradGen)"
              strokeWidth={2.5}
            />
            <Area
              type="monotone"
              dataKey="consumedKwh"
              name="Consumed (kWh)"
              stroke="#6c7a71"
              fillOpacity={1}
              fill="url(#gradCon)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="exportedKwh"
              name="Surplus Exported (CC)"
              stroke="#00855d"
              fillOpacity={1}
              fill="url(#gradExp)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
