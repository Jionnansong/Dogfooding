import React from 'react';
import { cn } from '@/utils/cn';

export type StatusType = 
  | 'default' 
  | 'primary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info'
  | 'amber'
  | 'emerald'
  | 'blue'
  | 'slate';

interface StatusBadgeProps {
  children: React.ReactNode;
  className?: string;
  status?: StatusType;
  size?: 'sm' | 'md' | 'lg';
  uppercase?: boolean;
}

const statusMap: Record<StatusType, { bg: string; text: string }> = {
  default: { bg: 'bg-slate-100', text: 'text-slate-600' },
  primary: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  success: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-600' },
  danger: { bg: 'bg-rose-100', text: 'text-rose-600' },
  info: { bg: 'bg-blue-100', text: 'text-blue-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-500' },
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-[8px]',
  md: 'px-3 py-1.5 text-[10px]',
  lg: 'px-4 py-2 text-xs',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  children, 
  className,
  status = 'default',
  size = 'md',
  uppercase = true
}) => {
  const { bg, text } = statusMap[status];
  
  return (
    <span 
      className={cn(
        'rounded-xl font-black tracking-wider inline-block',
        bg,
        text,
        sizeMap[size],
        uppercase && 'uppercase',
        className
      )}
    >
      {children}
    </span>
  );
};

// Project status specific badge
interface ProjectStatusBadgeProps extends Omit<StatusBadgeProps, 'status'> {
  status: 'planning' | 'shooting' | 'post-production' | 'completed';
  short?: boolean;
}

const projectStatusMap: Record<string, { label: string; shortLabel: string; status: StatusType }> = {
  shooting: { label: '拍摄中', shortLabel: '拍摄', status: 'amber' },
  planning: { label: '策划中', shortLabel: '策划', status: 'slate' },
  completed: { label: '已完成', shortLabel: '完成', status: 'emerald' },
  'post-production': { label: '后期中', shortLabel: '后期', status: 'blue' },
};

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ 
  status, 
  short = false,
  ...props
}) => {
  const config = projectStatusMap[status] || projectStatusMap.planning;
  
  return (
    <StatusBadge status={config.status} {...props}>
      {short ? config.shortLabel : config.label}
    </StatusBadge>
  );
};
