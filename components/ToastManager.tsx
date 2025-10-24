import React, { useState, useCallback } from 'react';
import Toast, { ToastType } from './Toast';

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

let showToastGlobal: ((options: ToastOptions) => void) | null = null;

export function showToast(options: ToastOptions) {
  if (showToastGlobal) {
    showToastGlobal(options);
  }
}

export default function ToastManager() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [duration, setDuration] = useState(3000);

  const show = useCallback((options: ToastOptions) => {
    setMessage(options.message);
    setType(options.type);
    setDuration(options.duration || 3000);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  React.useEffect(() => {
    showToastGlobal = show;
    return () => {
      showToastGlobal = null;
    };
  }, [show]);

  return (
    <Toast
      message={message}
      type={type}
      visible={visible}
      onHide={hide}
      duration={duration}
    />
  );
}
