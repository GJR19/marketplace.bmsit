import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#FFFBF5] rounded-2xl border-2 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-full border border-[#1C1C1C] bg-[#FFF9E6] hover:bg-[#F2A93B] transition"
        >
          <X className="w-4 h-4 text-[#1C1C1C]" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-xl border-2 border-[#1C1C1C] flex items-center justify-center ${
              variant === 'danger'
                ? 'bg-[#FDF2F4] text-[#E1467A]'
                : variant === 'warning'
                ? 'bg-[#FFF1D9] text-[#F2A93B]'
                : 'bg-[#FFF9E6] text-[#1C1C1C]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-head text-xl font-bold text-[#1C1C1C]">{title}</h3>
        </div>

        <p className="text-sm text-[#1C1C1C]/80 mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[#1C1C1C] bg-white hover:bg-neutral-100 transition shadow-[2px_2px_0px_#1C1C1C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-bold rounded-xl border-2 border-[#1C1C1C] transition shadow-[2px_2px_0px_#1C1C1C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              variant === 'danger'
                ? 'bg-[#E1467A] text-white hover:bg-[#d03a6c]'
                : variant === 'warning'
                ? 'bg-[#F2A93B] text-[#1C1C1C] hover:bg-[#e49b2f]'
                : 'bg-[#F2A93B] text-[#1C1C1C] hover:bg-[#e49b2f]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
