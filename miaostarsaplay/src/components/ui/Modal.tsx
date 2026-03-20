import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-6xl w-full h-full md:w-[90%] md:h-[85%]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const isFullSize = size === 'full';

  return (
    <div
      className="!m-0 fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          'bg-white shadow-2xl animate-in zoom-in-95 duration-300 relative',
          isFullSize
            ? 'w-full h-full md:w-[90%] md:h-[85%] md:rounded-[3rem] flex flex-col overflow-hidden'
            : `w-full ${sizeMap[size]} p-6 md:p-10 rounded-2xl md:rounded-[3rem]`,
          className
        )}
      >
        {showCloseButton && !isFullSize && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className, icon }) => {
  return (
    <div className={cn('flex items-center gap-4 mb-8', className)}>
      {icon && (
        <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg shadow-indigo-100 shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
};

interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export const ModalTitle: React.FC<ModalTitleProps> = ({ children, className, subtitle }) => {
  return (
    <div>
      <h3 className={cn('text-xl md:text-2xl font-black text-slate-800 tracking-tight truncate', className)}>
        {children}
      </h3>
      {subtitle && <p className="text-slate-400 font-bold text-xs md:text-sm truncate">{subtitle}</p>}
    </div>
  );
};

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
  return <div className={cn('mt-8 md:mt-10 flex flex-col sm:flex-row gap-3', className)}>{children}</div>;
};

interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmVariant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  confirmVariant = 'primary',
  isLoading = false,
  ...modalProps
}) => {
  const confirmBtnClass =
    confirmVariant === 'danger'
      ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-100'
      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100';

  return (
    <Modal {...modalProps} size="md">
      <div className="text-center">
        <div
          className={cn(
            'w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl md:text-4xl mx-auto mb-6 shadow-inner',
            confirmVariant === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'
          )}
        >
          {confirmVariant === 'danger' ? '⚠️' : '✓'}
        </div>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">{title}</h3>
        <div className="text-slate-500 mb-8 leading-relaxed font-medium text-sm md:text-base">{message}</div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={modalProps.onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'flex-1 py-4 font-black rounded-xl md:rounded-2xl shadow-xl transition-all text-sm',
              confirmBtnClass,
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? '处理中...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
