import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
  expandableDetails?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    text: 'text-success-text',
    icon: <CheckCircle2 className="w-5 h-5 text-success shrink-0" />,
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning-text',
    icon: <AlertTriangle className="w-5 h-5 text-warning shrink-0" />,
  },
  error: {
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    text: 'text-danger-text',
    icon: <AlertCircle className="w-5 h-5 text-danger shrink-0" />,
  },
  info: {
    bg: 'bg-info/10',
    border: 'border-info/30',
    text: 'text-info-text',
    icon: <Info className="w-5 h-5 text-info shrink-0" />,
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  action,
  expandableDetails,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const style = variantStyles[variant];

  return (
    <div
      className={[
        'flex flex-col gap-2 p-4 rounded-xl border transition-all text-sm',
        style.bg,
        style.border,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start gap-3">
        {icon || style.icon}

        <div className="flex-1 flex flex-col gap-0.5">
          {title && <h4 className="font-bold text-white tracking-tight">{title}</h4>}
          <div className="text-xs text-zinc-300 leading-relaxed">{children}</div>

          {action && <div className="mt-2">{action}</div>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {expandableDetails && (
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800/50 cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {dismissible && (
            <button
              onClick={() => {
                setIsDismissed(true);
                onDismiss?.();
              }}
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800/50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && expandableDetails && (
        <div className="mt-2 pt-2 border-t border-border/50 text-xs text-zinc-400 font-mono bg-darkBg/60 p-2.5 rounded-lg overflow-x-auto">
          {expandableDetails}
        </div>
      )}
    </div>
  );
};

export default Alert;
