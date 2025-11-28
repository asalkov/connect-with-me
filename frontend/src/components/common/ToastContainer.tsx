import { useState, useCallback } from 'react';
import Toast, { ToastType } from './Toast';
import './Toast.css';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let addToastFn: ((toast: Omit<ToastData, 'id'>) => void) | null = null;

export const toast = {
  success: (message: string, duration?: number) => {
    addToastFn?.({ message, type: 'success', duration });
  },
  error: (message: string, duration?: number) => {
    addToastFn?.({ message, type: 'error', duration });
  },
  warning: (message: string, duration?: number) => {
    addToastFn?.({ message, type: 'warning', duration });
  },
  info: (message: string, duration?: number) => {
    addToastFn?.({ message, type: 'info', duration });
  },
};

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Expose addToast function globally
  if (!addToastFn) {
    addToastFn = addToast;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
