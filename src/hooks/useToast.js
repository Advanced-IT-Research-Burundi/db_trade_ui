import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message, title = null, duration = 5000) => {
    const id = Date.now();
    const toast = {
      id,
      type,
      message,
      title,
      duration
    };

    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, showToast, removeToast };
};