import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className = '', size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'w-full h-full md:w-[90%] md:h-[85%] md:max-w-6xl',
  };

  return (
    <div className="!m-0 fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`bg-white w-full ${sizeClasses[size]} shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col overflow-hidden relative ${
          size === 'full' ? 'h-full md:rounded-[3rem]' : 'rounded-[3rem]'
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onBack?: () => void;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle, icon, onBack, onClose }) => {
  return (
    <div className="px-6 py-8 md:px-12 md:pt-12 md:pb-8 flex justify-between items-start sticky top-0 bg-white z-20 border-b border-slate-50 md:border-none">
      <div className="flex items-center gap-4 md:gap-6">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all shrink-0 active:scale-90"
          >
            <X className="w-6 h-6 md:w-7 md:h-7" />
          </button>
        ) : (
          icon && (
            <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl md:text-3xl shadow-inner shadow-indigo-200/20 shrink-0">
              {icon}
            </div>
          )
        )}
        <div>
          <h3 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-slate-400 font-bold text-xs md:text-lg">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 md:p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-800 active:scale-90"
      >
        <X className="w-6 h-6 md:w-8 md:h-8" />
      </button>
    </div>
  );
};

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalContent: React.FC<ModalContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex-1 overflow-y-auto px-6 py-8 md:px-12 md:pb-16 custom-scrollbar relative ${className}`}>
      {children}
    </div>
  );
};

export default Modal;
