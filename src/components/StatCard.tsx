
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <div className={cn("stock-card", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && (
            <p className={`text-xs flex items-center mt-1 ${trend.isPositive ? 'text-alert-green' : 'text-alert-red'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-gray-500 ml-1">from last period</span>
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-stock-blue-100 text-stock-blue-700">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
