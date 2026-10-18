import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border transition-all transform translate-y-0 duration-200 ${
              isSuccess
                ? 'bg-white dark:bg-navy border-mint/40 text-ink-primary dark:text-ink-darkPrimary'
                : isError
                ? 'bg-white dark:bg-navy border-danger/40 text-ink-primary dark:text-ink-darkPrimary'
                : 'bg-white dark:bg-navy border-primary/40 text-ink-primary dark:text-ink-darkPrimary'
            }`}
          >
            <div className="flex items-center space-x-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-mint flex-shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-primary flex-shrink-0" />}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-ink-muted hover:text-ink-primary dark:hover:text-white p-1 rounded-lg"
              aria-label="Close toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
