import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon, trend }: StatsCardProps) => {
  return (
    <div className="group flex min-h-[126px] items-start rounded-2xl border border-border/60 bg-card p-5 text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-kendrah-purple/30 hover:shadow-md">
      <div className="mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple transition-colors group-hover:bg-kendrah-purple/15">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && (
            <span className={`text-xs font-semibold ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
