import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  status?: string; // Legacy status alias
  label?: React.ReactNode; // Legacy label alias
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary/15 text-primary-light border-primary/30',
  secondary: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  success: 'bg-success/15 text-success-text border-success/30',
  warning: 'bg-warning/15 text-warning-text border-warning/30',
  danger: 'bg-danger/15 text-danger-text border-danger/30',
  info: 'bg-info/15 text-info-text border-info/30',
  outline: 'bg-transparent text-zinc-300 border-border',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-zinc-400',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  outline: 'bg-zinc-400',
};

function mapStatusToVariant(status?: string): BadgeVariant {
  if (!status) return 'primary';
  const s = status.toLowerCase();
  if (['completed', 'paid', 'active', 'success', 'stable', 'passed'].includes(s)) return 'success';
  if (['failed', 'error', 'cancelled', 'destructive', 'deprecated'].includes(s)) return 'danger';
  if (['processing', 'pending', 'parsing...', 'migrating...', 'beta', 'warning'].includes(s)) return 'warning';
  if (['info', 'experimental', 'draft'].includes(s)) return 'info';
  return 'secondary';
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  status,
  label,
  size = 'md',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  const resolvedVariant = variant || (status ? mapStatusToVariant(status) : 'primary');
  const content = children ?? label ?? status;

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-semibold',
    lg: 'text-xs px-3 py-1 font-bold',
  };

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border font-mono tracking-wide select-none capitalize',
        variantStyles[resolvedVariant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[resolvedVariant]}`} />}
      {content}
    </span>
  );
};

export default Badge;
