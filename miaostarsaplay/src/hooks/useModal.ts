import { useState, useCallback } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useModal = (initialState = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
};

interface UseConfirmModalReturn {
  isOpen: boolean;
  targetId: string | null;
  open: (id: string) => void;
  close: () => void;
  confirm: () => string | null;
}

export const useConfirmModal = (initialState = false): UseConfirmModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [targetId, setTargetId] = useState<string | null>(null);

  const open = useCallback((id: string) => {
    setTargetId(id);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTargetId(null);
  }, []);

  const confirm = useCallback(() => {
    const id = targetId;
    close();
    return id;
  }, [targetId, close]);

  return { isOpen, targetId, open, close, confirm };
};

interface UseFormModalReturn<T> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T | null) => void;
  close: () => void;
  setData: (data: T | null) => void;
}

export const useFormModal = <T,>(initialState = false): UseFormModalReturn<T> => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((initialData?: T | null) => {
    setData(initialData ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, data, open, close, setData };
};
