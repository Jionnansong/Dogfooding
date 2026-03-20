import React from 'react';
import { cn } from '@/utils/cn';

interface BannerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

const variantMap = {
  primary: 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-indigo-100',
  secondary: 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-slate-100',
  success: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-100',
  warning: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-100',
};

const sizeMap = {
  sm: 'p-4 md:p-6 rounded-xl md:rounded-2xl',
  md: 'p-6 md:p-10 rounded-2xl md:rounded-[2.5rem]',
  lg: 'p-8 md:p-12 rounded-2xl md:rounded-[2.5rem]',
};

export const Banner: React.FC<BannerProps> = ({ 
  children, 
  className,
  variant = 'primary',
  size = 'md'
}) => {
  return (
    <section 
      className={cn(
        variantMap[variant],
        sizeMap[size],
        'shadow-xl relative overflow-hidden',
        className
      )}
    >
      <div className="relative z-10">
        {children}
      </div>
      {/* Decorative elements */}
      <div className="absolute top-[-10%] right-[-5%] w-48 md:w-80 h-48 md:h-80 bg-white/10 rounded-full blur-[60px] md:blur-[100px]"></div>
      <div className="absolute bottom-[-20%] right-[10%] w-40 md:w-64 h-40 md:h-64 bg-indigo-400/20 rounded-full blur-[50px] md:blur-[80px]"></div>
    </section>
  );
};

interface BannerTitleProps {
  children: React.ReactNode;
  className?: string;
  highlight?: string;
}

export const BannerTitle: React.FC<BannerTitleProps> = ({ 
  children, 
  className,
  highlight
}) => {
  return (
    <h1 className={cn(
      'text-2xl md:text-4xl font-black mb-3 leading-tight tracking-tight',
      className
    )}>
      {children}
      {highlight && (
        <>
          , <br className="sm:hidden" />
          <span className="text-indigo-200">{highlight}</span> !
        </>
      )}
    </h1>
  );
};

interface BannerDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const BannerDescription: React.FC<BannerDescriptionProps> = ({ 
  children, 
  className 
}) => {
  return (
    <p className={cn(
      'text-indigo-100 max-w-md text-sm md:text-base font-medium opacity-90',
      className
    )}>
      {children}
    </p>
  );
};

interface BannerActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const BannerActions: React.FC<BannerActionsProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('mt-8 flex flex-wrap gap-3', className)}>
      {children}
    </div>
  );
};

interface BannerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const BannerButton: React.FC<BannerButtonProps> = ({ 
  children, 
  className,
  variant = 'primary',
  ...props
}) => {
  const buttonVariantMap = {
    primary: 'bg-white text-indigo-600 hover:bg-indigo-50',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm',
  };

  return (
    <button 
      className={cn(
        buttonVariantMap[variant],
        'px-6 py-3 rounded-xl font-black shadow-sm transition-all active:scale-95 text-sm md:text-base flex-1 sm:flex-none text-center',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
