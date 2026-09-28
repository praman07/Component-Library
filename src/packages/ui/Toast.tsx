import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ title, description, type = 'info', duration = 3500 }: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto bg-[#161616] border border-[#333333] text-[#F5F5F5] p-3 rounded-md flex items-start gap-3 transition-opacity animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="mt-0.5 shrink-0 text-[#FFFFFF]">
              {toast.type === 'success' && <Check className="w-4 h-4 text-[#FFFFFF]" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#A3A3A3]" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#A3A3A3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#FFFFFF] leading-snug">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-[#A3A3A3] mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#737373] hover:text-[#FFFFFF] transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#FFFFFF]"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
