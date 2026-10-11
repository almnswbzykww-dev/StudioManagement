import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';

interface PageShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  hasUnsavedChanges?: boolean;
  onSave?: () => Promise<boolean> | boolean | void;
  onClose: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({
  title,
  subtitle,
  icon,
  badge,
  hasUnsavedChanges = false,
  onSave,
  onClose,
  actions,
  children
}) => {
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  };

  const handleSaveAndExit = async () => {
    if (onSave) {
      await onSave();
    }
    setShowUnsavedModal(false);
    onClose();
  };

  const handleExitWithoutSave = () => {
    setShowUnsavedModal(false);
    onClose();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent animate-in fade-in duration-200">
      
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-20">
        
        {/* Title & Icon & Badge */}
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl shadow-xs">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">{title}</h1>
              {badge && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Action Buttons & Close (✕) Button */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {actions}

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Close Page Button (Requirement 9) */}
          <button
            onClick={handleCloseAttempt}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-slate-300 border border-slate-700 hover:border-rose-500/40 rounded-xl text-xs font-semibold transition-all cursor-pointer group shadow-xs"
            title="إغلاق الصفحة (✕)"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span className="hidden sm:inline">إغلاق</span>
          </button>
        </div>
      </div>

      {/* Page Content Body */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">
        {children}
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesDialog
        isOpen={showUnsavedModal}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSave={handleExitWithoutSave}
        onCancel={() => setShowUnsavedModal(false)}
      />
    </div>
  );
};
