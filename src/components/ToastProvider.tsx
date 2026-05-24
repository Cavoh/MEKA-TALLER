import React, { useState, useCallback, createContext, useContext, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

// ─── Context ─────────────────────────────────────
export const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
});

export const useToast = () => useContext(ToastContext);

// ─── Individual Toast Card ────────────────────────
function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />,
    error:   <AlertCircle  className="w-4 h-4 shrink-0 text-rose-500" />,
    info:    <Info         className="w-4 h-4 shrink-0 text-[var(--emphasis-color)]" />,
  };

  const borders = {
    success: 'border-l-4 border-emerald-500',
    error:   'border-l-4 border-rose-500',
    info:    'border-l-4 border-[var(--emphasis-color)]',
  };

  return (
    <div
      className={`
        flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)]
        bg-[var(--modal-bg)] shadow-xl rounded-2xl px-4 py-3
        border border-[var(--border-main)] ${borders[toast.type]}
        animate-in fade-in duration-300
      `}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest leading-tight">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-snug">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        aria-label="Cerrar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────
export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const duration = type === 'error' ? 5000 : 3000;

    setToasts(prev => [...prev.slice(-4), { id, type, title, message }]);

    timers.current[id] = setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const showSuccess = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const showError   = useCallback((title: string, message?: string) => showToast('error',   title, message), [showToast]);
  const showInfo    = useCallback((title: string, message?: string) => showToast('info',    title, message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}

      {/* Toast Stack — bottom-right, fade-in */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastCard toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
