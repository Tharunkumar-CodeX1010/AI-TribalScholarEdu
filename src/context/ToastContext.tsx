import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextType {
  notify: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const STYLES: Record<ToastKind, { wrap: string; icon: React.ElementType }> = {
  success: { wrap: 'bg-emerald-50 border-emerald-300 text-emerald-900', icon: CheckCircle2 },
  error: { wrap: 'bg-rose-50 border-rose-300 text-rose-900', icon: XCircle },
  warning: { wrap: 'bg-amber-50 border-amber-300 text-amber-900', icon: AlertTriangle },
  info: { wrap: 'bg-blue-50 border-blue-300 text-blue-900', icon: Info }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-2), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-2rem)] max-w-md space-y-2 print:hidden"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const { wrap, icon: Icon } = STYLES[t.kind];
          return (
            <div
              key={t.id}
              className={`animate-fadeIn flex items-start gap-2.5 rounded-lg border px-4 py-3 text-xs font-semibold shadow-lg ${wrap}`}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="flex-1 leading-snug">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="shrink-0 opacity-60 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
