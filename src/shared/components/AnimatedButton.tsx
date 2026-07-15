import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { defaultTransition } from '../../animations/variants';
import LoadingSpinner from './LoadingSpinner';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: AnimatedButtonProps) {
  const isReduced = useReducedMotion();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20 shadow-glow-sm';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border';
      case 'ghost':
        return 'text-muted-foreground hover:text-foreground hover:bg-accent/40';
      case 'outline':
        return 'bg-transparent border border-border text-foreground hover:bg-accent/40';
      case 'danger':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive/20';
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-[10px] rounded-lg gap-1.5';
      case 'md':
        return 'h-10 px-5 text-xs rounded-xl gap-2';
      case 'lg':
        return 'h-12 px-6 text-sm rounded-xl gap-2.5';
      default:
        return '';
    }
  };

  const isBtnDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={isBtnDisabled || isReduced ? {} : { scale: 1.025, y: -1 }}
      whileTap={isBtnDisabled || isReduced ? {} : { scale: 0.96 }}
      transition={defaultTransition}
      disabled={isBtnDisabled}
      className={`inline-flex items-center justify-center font-bold tracking-wide uppercase font-mono transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...(props as any)}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <LoadingSpinner className="w-4 h-4 shrink-0 text-current" />
        </motion.div>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </motion.button>
  );
}
