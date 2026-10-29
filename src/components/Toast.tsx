import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
      {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
      {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
      {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />}
      <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-white cursor-pointer"
        aria-label="ปิดการแจ้งเตือน"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
