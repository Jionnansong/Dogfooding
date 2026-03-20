import React from 'react';
import { cn } from '@/utils/cn';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeMap = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-[1600px]',
};

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className,
  size = 'full'
}) => {
  return (
    <div className={cn('mx-auto w-full px-4 md:px-8', sizeMap[size], className)}>
      {children}
    </div>
  );
};

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className,
  animate = true
}) => {
  return (
    <div 
      className={cn(
        'space-y-6 md:space-y-8',
        animate && 'animate-in fade-in duration-500',
        className
      )}
    >
      {children}
    </div>
  );
};

interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6;
  mdCols?: 1 | 2 | 3 | 4 | 6;
  lgCols?: 1 | 2 | 3 | 4 | 6;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const colsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
};

const gapMap = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const GridContainer: React.FC<GridContainerProps> = ({ 
  children, 
  className,
  cols = 1,
  mdCols,
  lgCols,
  gap = 'md'
}) => {
  return (
    <div 
      className={cn(
        'grid',
        colsMap[cols],
        mdCols && `md:${colsMap[mdCols]}`,
        lgCols && `lg:${colsMap[lgCols]}`,
        gapMap[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  className,
  title,
  action
}) => {
  return (
    <section className={cn('', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-6 md:mb-8">
          {title && (
            <h3 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
};

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
  height?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  count = 3,
  className,
  height = 'h-16'
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className={cn('bg-slate-50 rounded-xl animate-pulse', height)}
        />
      ))}
    </div>
  );
};
