import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { defaultTransition } from '../../animations/variants';
import Loader from './Loader';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'solid';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: ReactNode;
  loading?: boolean;
  tooltip?: string;
  hasPermission?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  iconOnly,
  loading = false,
  tooltip,
  hasPermission = true,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isReduced = useReducedMotion();

  if (!hasPermission) {
    return null;
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
      case 'solid':
        return 'bg-primary text-white hover:bg-primary/95 border border-primary/20 shadow-glow-sm active:bg-primary/90';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-border active:bg-secondary/80';
      case 'ghost':
        return 'text-muted-foreground hover:text-foreground hover:bg-accent/40 active:bg-accent/60';
      case 'outline':
        return 'bg-transparent border border-border text-foreground hover:bg-accent/40 active:bg-accent/60';
      case 'danger':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/95 border border-destructive/20 active:bg-destructive/90';
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return iconOnly ? 'w-8 h-8 rounded-lg' : 'h-8 px-3 text-[10px] rounded-lg gap-1.5';
      case 'md':
        return iconOnly ? 'w-10 h-10 rounded-xl' : 'h-10 px-5 text-xs rounded-xl gap-2';
      case 'lg':
        return iconOnly ? 'w-12 h-12 rounded-xl' : 'h-12 px-6 text-sm rounded-xl gap-2.5';
      case 'xl':
        return iconOnly ? 'w-14 h-14 rounded-2xl' : 'h-14 px-8 text-base rounded-2xl gap-3';
      default:
        return '';
    }
  };

  const isBtnDisabled = disabled || loading;

  const buttonContent = (
    <>
      {loading ? (
        <Loader variant="button" size="sm" className="shrink-0" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {iconOnly ? <span className="shrink-0">{iconOnly}</span> : children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </>
  );

  return (
    <motion.button
      whileHover={isBtnDisabled || isReduced ? {} : { scale: 1.02, y: -0.5 }}
      whileTap={isBtnDisabled || isReduced ? {} : { scale: 0.97 }}
      transition={defaultTransition}
      disabled={isBtnDisabled}
      title={tooltip}
      className={`inline-flex items-center justify-center font-bold tracking-wide uppercase font-mono transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props as any}
    >
      {buttonContent}
    </motion.button>
  );
}
