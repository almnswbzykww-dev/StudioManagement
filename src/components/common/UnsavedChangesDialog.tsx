import React from 'react';
import { AlertTriangle, Save, LogOut, X } from 'lucide-react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onSaveAndExit: () => void;
  onExitWithoutSave: () => void;
  onCancel: () => void;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  onSaveAndExit,
  onExitWithoutSave,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100">
        <div className="flex items-center gap-3 mb-4 text-amber-400">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">توجد تغييرات غير محفوظة</h3>
            <p className="text-xs text-slate-400 mt-0.5">لقد قمت بإجراء تعديلات لم يتم حفظها بعد.</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
          هل ترغب في حفظ التغييرات الحالية قبل الخروج من الصفحة، أم تفضل المغادرة بدون حفظ؟
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onSaveAndExit}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ والخروج</span>
          </button>

          <button
            onClick={onExitWithoutSave}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl font-medium transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج بدون حفظ</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>إلغاء والعودة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
