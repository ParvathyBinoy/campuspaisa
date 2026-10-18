import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div
            className={`p-2.5 rounded-xl flex-shrink-0 ${
              isDestructive
                ? 'bg-danger/10 text-danger'
                : 'bg-primary/10 text-primary'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-ink-secondary dark:text-ink-darkSecondary pt-1 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-surface-border/50 dark:border-surface-darkBorder/50">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-xl text-ink-secondary hover:text-ink-primary dark:hover:text-white bg-surface-light dark:bg-navy hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-xl text-white transition shadow-sm ${
              isDestructive
                ? 'bg-danger hover:bg-danger-dark'
                : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
