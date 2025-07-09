import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const toast = useRef(null);

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail });
  };

  const showSuccess = (summary, detail) => showToast('success', summary, detail);
  const showError = (summary, detail) => showToast('error', summary, detail);
  const showWarn = (summary, detail) => showToast('warn', summary, detail);
  const showInfo = (summary, detail) => showToast('info', summary, detail);

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarn,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast ref={toast} position="top-right" />
    </ToastContext.Provider>
  );
};