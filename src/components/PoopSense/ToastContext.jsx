import React, { createContext, useContext } from 'react';
import { useToast } from './useToast';

const ToastContext = createContext({ toast: () => {} });

export function ToastProvider({ children }) {
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
