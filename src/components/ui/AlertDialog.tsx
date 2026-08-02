import React from 'react';
import Dialog from './Dialog';
import Alert, { AlertVariant } from './Alert';
import Button from './Button';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
  variant?: AlertVariant;
  actionText?: string;
  onAction?: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'error',
  actionText = 'OK',
  onAction,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col gap-4">
        <Alert variant={variant} title={title}>
          {message}
        </Alert>

        <div className="flex justify-end mt-2">
          <Button
            variant={variant === 'error' ? 'danger' : variant === 'warning' ? 'warning' : 'primary'}
            onClick={() => {
              onAction?.();
              onClose();
            }}
          >
            {actionText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AlertDialog;
