
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
    <div className="kendrah-card flex items-start">
      <div className="bg-kendrah-purple/10 rounded-lg p-3 mr-4">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        <div className="flex items-baseline mt-1">
          <p className="text-2xl font-bold text-kendrah-black">{value}</p>
          
          {trend && (
            <span className={`ml-2 text-sm font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
