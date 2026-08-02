import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'success'
  | 'warning'
  | 'danger'
  | 'icon'
  | 'solid';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: ReactNode;
  icon?: ReactNode; // Backward compatibility alias for leftIcon / iconOnly
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  tooltip?: string;
  hasPermission?: boolean;
  disabled?: boolean;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover active:bg-primary-active border border-primary/20 shadow-glow focus-visible:ring-2 focus-visible:ring-primary/50',
  solid:
    'bg-primary text-white hover:bg-primary-hover active:bg-primary-active border border-primary/20 shadow-glow focus-visible:ring-2 focus-visible:ring-primary/50',
  secondary:
    'bg-darkCard text-zinc-200 hover:bg-zinc-800/80 active:bg-zinc-800 border border-border focus-visible:ring-2 focus-visible:ring-zinc-500/50',
  outline:
    'bg-transparent text-zinc-200 border border-border hover:bg-zinc-800/50 active:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-primary/50',
  ghost:
    'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50 active:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-500/50',
  link:
    'bg-transparent text-primary hover:text-primary-light hover:underline focus-visible:ring-1 focus-visible:ring-primary p-0 h-auto',
  success:
    'bg-success text-white hover:bg-success-hover border border-success/20 shadow-glow-success focus-visible:ring-2 focus-visible:ring-success/50',
  warning:
    'bg-warning text-darkBg font-semibold hover:bg-warning-hover border border-warning/20 shadow-glow-warning focus-visible:ring-2 focus-visible:ring-warning/50',
  danger:
    'bg-danger text-white hover:bg-danger-hover border border-danger/20 shadow-glow-danger focus-visible:ring-2 focus-visible:ring-danger/50',
  icon:
    'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/60 active:bg-zinc-800 border border-transparent focus-visible:ring-2 focus-visible:ring-primary/50',
};

const sizeClasses: Record<ButtonSize, { standard: string; iconOnly: string }> = {
  xs: {
    standard: 'h-7 px-2.5 text-xs gap-1.5',
    iconOnly: 'w-7 h-7 p-0 text-xs',
  },
  sm: {
    standard: 'h-8 px-3 text-xs gap-1.5',
    iconOnly: 'w-8 h-8 p-0 text-xs',
  },
  md: {
    standard: 'h-10 px-4 text-sm gap-2',
    iconOnly: 'w-10 h-10 p-0 text-sm',
  },
  lg: {
    standard: 'h-12 px-6 text-base gap-2.5',
    iconOnly: 'w-12 h-12 p-0 text-base',
  },
  xl: {
    standard: 'h-14 px-8 text-lg gap-3',
    iconOnly: 'w-14 h-14 p-0 text-lg',
  },
};

const roundedClasses: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  iconOnly,
  icon,
  loading = false,
  loadingText,
  fullWidth = false,
  rounded = 'lg',
  tooltip,
  hasPermission = true,
  disabled,
  className = '',
  ...props
}) => {
  if (!hasPermission) return null;

  const resolvedLeftIcon = leftIcon || icon;
  const resolvedIconOnly = iconOnly || (!children ? icon : undefined);
  const isDisabled = disabled || loading;
  const isIconOnly = Boolean(resolvedIconOnly && !children);

  const classes = [
    'inline-flex items-center justify-center font-medium transition-all cursor-pointer select-none outline-none disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    isIconOnly ? sizeClasses[size].iconOnly : sizeClasses[size].standard,
    roundedClasses[rounded],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.01, y: -1 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={isDisabled}
      title={tooltip}
      className={classes}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          {loadingText ? <span>{loadingText}</span> : !isIconOnly && children}
        </>
      ) : (
        <>
          {resolvedLeftIcon && <span className="shrink-0">{resolvedLeftIcon}</span>}
          {resolvedIconOnly ? <span className="shrink-0">{resolvedIconOnly}</span> : children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;
