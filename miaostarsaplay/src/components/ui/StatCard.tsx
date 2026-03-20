import React from 'react';
import { Card } from './Card';
import { cn } from '@/utils/cn';

export interface StatCardData {
  label: string;
  value: string | number;
  change: number;
  type: 'up' | 'down';
}

interface StatCardProps {
  data: StatCardData;
  className?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ data, className, loading = false }) => {
  if (loading) {
    return (
      <Card className={cn('h-28 md:h-32 animate-pulse', className)} padding="md" border>
        <div className="h-full bg-slate-50 rounded-lg"></div>
      </Card>
    );
  }

  return (
    <Card 
      className={cn('group hover:shadow-md transition-all duration-300', className)} 
      padding="md"
      hover
    >
      <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest truncate">
        {data.label}
      </p>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-2 gap-1">
        <span className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">
          {data.value}
        </span>
        <span
          className={cn(
            'text-[10px] md:text-xs font-black flex items-center gap-0.5',
            data.type === 'up' ? 'text-emerald-500' : 'text-rose-500'
          )}
        >
          {data.type === 'up' ? '↑' : '↓'} {data.change}%
        </span>
      </div>
    </Card>
  );
};

interface StatCardGridProps {
  children: React.ReactNode;
  className?: string;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({ children, className }) => {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6', className)}>
      {children}
    </div>
  );
};
