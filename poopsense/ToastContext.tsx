import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';

interface ToastContextValue {
  toast: (msg: string, ms?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { message, visible, toast } = useToast();

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className={`toast${visible ? ' show' : ''}`}>{message}</div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  return useContext(ToastContext);
}