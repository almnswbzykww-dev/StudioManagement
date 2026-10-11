import React from 'react';
import { AlertCircle, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
      icon: <Trash2 className="w-6 h-6" />
    },
    warning: {
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
      icon: <AlertCircle className="w-6 h-6" />
    },
    info: {
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30',
      icon: <HelpCircle className="w-6 h-6" />
    }
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className={`bg-slate-900 border ${typeConfig.border} rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100 animate-in zoom-in-95 duration-150`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${typeConfig.bg} ${typeConfig.color} border ${typeConfig.border}`}>
            {typeConfig.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl font-medium transition-all shadow-lg cursor-pointer ${typeConfig.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
