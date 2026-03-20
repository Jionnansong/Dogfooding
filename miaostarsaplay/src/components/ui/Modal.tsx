import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  icon,
  maxWidth = 'max-w-lg',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="!m-0 fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className={`bg-white w-full ${maxWidth} p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || icon || showCloseButton) && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {icon && (
                <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg shadow-indigo-100 shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-slate-400 font-bold text-xs md:text-sm truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button 
                onClick={onClose}
                className="p-2 md:p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-800 active:scale-90"
              >
                <X className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

interface ModalActionsProps {
  children: React.ReactNode;
}

export const ModalActions: React.FC<ModalActionsProps> = ({ children }) => {
  return (
    <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3">
      {children}
    </div>
  );
};

interface ModalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const ModalButton: React.FC<ModalButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseClasses = 'flex-1 py-4 font-black rounded-xl md:rounded-2xl transition-all text-sm';
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95',
    secondary: 'bg-slate-100 text-slate-500 hover:bg-slate-200',
    danger: 'bg-rose-500 text-white shadow-xl shadow-rose-100 hover:bg-rose-600 active:scale-95'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {loading ? '处理中...' : children}
    </button>
  );
};

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children }) => {
  return (
    <div>
      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">
        {label}
      </label>
      {children}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm md:text-base ${className}`}
      {...props}
    />
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
  return (
    <textarea 
      className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 h-28 md:h-32 resize-none text-sm md:text-base ${className}`}
      {...props}
    />
  );
};
