import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border-2 border-[#1C1C1C] shadow-[3.5px_3.5px_0px_#1C1C1C] transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-[#FFF9E6]'
                : isError
                ? 'bg-[#FDF2F4]'
                : isWarning
                ? 'bg-[#FFF1D9]'
                : 'bg-[#FFFFFF]'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
              {isError && <AlertCircle className="w-5 h-5 text-[#E1467A]" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-[#F2A93B]" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#1C1C1C]" />}
            </div>

            <div className="flex-1 text-sm font-medium text-[#1C1C1C]">
              {toast.message}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#1C1C1C] hover:opacity-70 p-0.5 rounded transition"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
