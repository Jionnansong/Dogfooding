import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hover = false 
}) => {
  const baseClasses = 'bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-100';
  const hoverClasses = hover 
    ? 'hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 cursor-pointer' 
    : 'transition-all duration-300';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  type?: 'up' | 'down';
  icon?: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  type = 'up',
  icon,
  color = 'indigo',
  isLoading = false
}) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600'
  };

  if (isLoading) {
    return (
      <div className="h-28 md:h-32 bg-white rounded-2xl animate-pulse shadow-sm border border-slate-100" />
    );
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
          <span className={`text-[10px] md:text-xs font-black flex items-center gap-0.5 ${
            type === 'up' ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {type === 'up' ? '↑' : '↓'} {change}%
          </span>
        )}
      </div>
      {icon && (
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mt-3 ${colorClasses[color]}`}>
          {icon}
        </div>
      )}
    </div>
  );
};

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'max-w-[1600px]'
}) => {
  return (
    <div className={`p-4 md:p-8 ${maxWidth} mx-auto w-full ${className}`}>
      {children}
    </div>
  );
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div>
        <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-slate-400 font-bold mt-1 text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🔍',
  title,
  description
}) => {
  return (
    <div className="col-span-full py-16 md:py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl md:rounded-[3rem] border-2 border-dashed border-slate-100 p-6 text-center">
      <div className="text-5xl md:text-6xl mb-6">{icon}</div>
      <p className="text-lg md:text-xl font-black text-slate-600">{title}</p>
      {description && (
        <p className="text-xs md:text-sm mt-2 font-medium">{description}</p>
      )}
    </div>
  );
};
