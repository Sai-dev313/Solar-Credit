import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  icon: LucideIcon;
  accentColor?: 'emerald' | 'yellow' | 'sky' | 'purple';
}

const colorMap = {
  emerald: 'text-primary bg-secondary-container/30 border-primary/15',
  yellow: 'text-primary bg-primary-fixed/40 border-primary/15',
  sky: 'text-on-surface bg-surface-container border-outline-variant/20',
  purple: 'text-on-surface bg-surface-container-high border-outline-variant/20',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  icon: Icon,
  accentColor = 'emerald',
}) => {
  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-3 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${colorMap[accentColor]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
          {value}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span
              className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${
                trendPositive
                  ? 'bg-secondary-container/30 text-on-secondary-container'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
};
