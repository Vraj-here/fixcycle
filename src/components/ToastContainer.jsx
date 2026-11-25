import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';

export default function ToastContainer() {
  const { toasts, dismissToast } = useFixCycle();

  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarn = toast.type === 'error' || toast.type === 'warning';
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg bg-white transition-all ${
              isSuccess
                ? 'border-green-200'
                : isWarn
                ? 'border-amber-200'
                : 'border-slate-200'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : isWarn ? (
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-slate-800 flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
