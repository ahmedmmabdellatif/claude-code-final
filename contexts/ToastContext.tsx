import React, { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import Toast, { ToastType } from '@/components/Toast';

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const [ToastProvider, useToast] = createContextHook<ToastContextValue>(() => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [duration, setDuration] = useState(3000);

  const showToast = useCallback((options: ToastOptions) => {
    setMessage(options.message);
    setType(options.type);
    setDuration(options.duration || 3000);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  return useMemo(() => ({
    showToast,
    hideToast,
  }), [showToast, hideToast]);
});

export { ToastProvider, useToast };
