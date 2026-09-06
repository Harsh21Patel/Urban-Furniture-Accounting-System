import React from 'react';
import { AlertTriangle, Archive, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon: CustomIcon,
  loading = false,
}) {
  if (!isOpen) return null;

  const IconComponent = CustomIcon || (variant === 'danger' ? Archive : AlertTriangle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative space-y-4">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-full flex-shrink-0 ${
              variant === 'danger'
                ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                : variant === 'warning'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                : 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark'
            }`}
          >
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="space-y-1 pr-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-semibold text-white rounded shadow-sm transition-colors flex items-center gap-1.5 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
                : 'bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary'
            }`}
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
