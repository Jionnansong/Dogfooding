import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  type?: 'up' | 'down';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, type = 'up', loading = false }) => {
  if (loading) {
    return <div className="h-28 md:h-32 bg-white rounded-2xl animate-pulse shadow-sm border border-slate-100"></div>;
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-300">
      <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest truncate">
        {label}
      </p>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-2 gap-1">
        <span className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">
          {value}
        </span>
        {change !== undefined && (
          <span
            className={`text-[10px] md:text-xs font-black flex items-center gap-0.5 ${
              type === 'up' ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {type === 'up' ? '↑' : '↓'} {change}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
