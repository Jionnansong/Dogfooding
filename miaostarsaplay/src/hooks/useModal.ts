import { useState, useCallback } from 'react';

interface UseModalOptions<T = unknown> {
  initialData?: T;
  onOpen?: () => void;
  onClose?: () => void;
}

interface UseModalReturn<T = unknown> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
}

function useModal<T = unknown>(options?: UseModalOptions<T>): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(options?.initialData ?? null);

  const open = useCallback(
    (newData?: T) => {
      if (newData !== undefined) {
        setData(newData);
      }
      setIsOpen(true);
      options?.onOpen?.();
    },
    [options]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    options?.onClose?.();
  }, [options]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}

export default useModal;
