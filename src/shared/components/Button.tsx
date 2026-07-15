import React from 'react';
import AnimatedButton from './AnimatedButton';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <AnimatedButton
      variant={variant}
      size={size}
      isLoading={loading}
      icon={icon}
      className={className}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
}
