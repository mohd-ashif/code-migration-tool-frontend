import React from 'react';
import Dialog from './Dialog';
import Button from './Button';
import { AlertTriangle, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'primary' | 'success';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  confirmLabel?: string; // Legacy alias for confirmText
  cancelText?: string;
  cancelLabel?: string; // Legacy alias for cancelText
  variant?: ConfirmVariant;
  isDestructive?: boolean; // Legacy alias: sets variant="danger" if true
  isLoading?: boolean;
  loading?: boolean; // Legacy alias for isLoading
  icon?: React.ReactNode;
}

const defaultIcons: Record<ConfirmVariant, React.ReactNode> = {
  danger: <Trash2 className="w-6 h-6 text-danger" />,
  warning: <AlertTriangle className="w-6 h-6 text-warning" />,
  primary: <RefreshCw className="w-6 h-6 text-primary" />,
  success: <CheckCircle2 className="w-6 h-6 text-success" />,
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  variant = 'danger',
  isDestructive = false,
  isLoading,
  loading,
  icon,
}) => {
  const resolvedConfirmText = confirmText || confirmLabel || 'Confirm';
  const resolvedCancelText = cancelText || cancelLabel || 'Cancel';
  const resolvedVariant = isDestructive ? 'danger' : variant;
  const resolvedIsLoading = isLoading || loading || false;
  const iconToRender = icon || defaultIcons[resolvedVariant];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      closeOnOverlayClick={!resolvedIsLoading}
      closeOnEscape={!resolvedIsLoading}
      showCloseButton={!resolvedIsLoading}
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-12 h-12 rounded-full bg-darkInput border border-border flex items-center justify-center shrink-0">
          {iconToRender}
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <div className="text-xs text-zinc-400 leading-relaxed">{message}</div>
        </div>

        <div className="flex items-center gap-3 w-full mt-4 pt-2 border-t border-border/60">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={resolvedIsLoading}
          >
            {resolvedCancelText}
          </Button>
          <Button
            variant={resolvedVariant === 'danger' ? 'danger' : resolvedVariant === 'warning' ? 'warning' : 'primary'}
            fullWidth
            onClick={onConfirm}
            loading={resolvedIsLoading}
          >
            {resolvedConfirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export const ConfirmModal = ConfirmDialog;
export type ConfirmModalProps = ConfirmDialogProps;
export default ConfirmDialog;
