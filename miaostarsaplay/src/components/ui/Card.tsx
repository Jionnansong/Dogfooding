import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
  xl: 'p-8 md:p-10',
};

const radiusMap = {
  none: '',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-[2rem]',
  '2xl': 'rounded-[2.5rem]',
  '3xl': 'rounded-[3rem]',
};

const shadowMap = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
  radius = 'lg',
  shadow = 'sm',
  border = true,
}) => {
  return (
    <div
      className={cn(
        'bg-white',
        paddingMap[padding],
        radiusMap[radius],
        shadowMap[shadow],
        border && 'border border-slate-100',
        hover && 'hover:shadow-md transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return <div className={cn('mb-6 md:mb-8', className)}>{children}</div>;
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className, action }) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className={cn('text-lg md:text-2xl font-black text-slate-800 tracking-tight', className)}>
        {children}
      </h3>
      {action}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={cn('', className)}>{children}</div>;
};
