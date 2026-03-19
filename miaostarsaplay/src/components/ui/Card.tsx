import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover = false,
  padding = 'md',
  rounded = '2xl',
}) => {
  const paddingClasses: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-5 md:p-8',
    lg: 'p-6 md:p-10',
    xl: 'p-8 md:p-12',
  };

  const roundedClasses: Record<string, string> = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-[2rem]',
    '2xl': 'rounded-[2.5rem]',
    '3xl': 'rounded-[3rem]',
  };

  const baseClasses = `bg-white border border-slate-100 shadow-sm`;
  const hoverClasses = hover ? 'hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${roundedClasses[rounded]} ${paddingClasses[padding]} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
