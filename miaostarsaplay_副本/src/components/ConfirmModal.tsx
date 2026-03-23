import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal, { ModalContent } from './ui/Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => Promise<void> | void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = '确定',
  cancelLabel = '取消',
  type = 'danger',
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconConfig = () => {
    const configs = {
      danger: { bg: 'bg-rose-50', text: 'text-rose-500', icon: AlertTriangle },
      warning: { bg: 'bg-amber-50', text: 'text-amber-500', icon: AlertTriangle },
      info: { bg: 'bg-blue-50', text: 'text-blue-500', icon: AlertTriangle },
    };
    return configs[type];
  };

  const getButtonConfig = () => {
    const configs = {
      danger: 'bg-rose-500 hover:bg-rose-600 shadow-rose-100',
      warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
      info: 'bg-blue-500 hover:bg-blue-600 shadow-blue-100',
    };
    return configs[type];
  };

  const iconConfig = getIconConfig();
  const buttonConfig = getButtonConfig();
  const IconComponent = iconConfig.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent className="p-8 md:p-10 text-center">
        <div
          className={`w-16 h-16 md:w-20 md:h-20 ${iconConfig.bg} ${iconConfig.text} rounded-full flex items-center justify-center text-3xl md:text-4xl mx-auto mb-6 shadow-inner`}
        >
          <IconComponent className="w-10 h-10" />
        </div>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 mb-8 leading-relaxed font-medium text-sm md:text-base">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 py-4 text-white font-black rounded-xl md:rounded-2xl shadow-xl transition-all text-sm ${buttonConfig} ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
            }`}
          >
            {isLoading ? '处理中...' : confirmLabel}
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
