import React from 'react';
import LoadingSpinner from './LoadingSpinner';

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
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 select-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#7C6CFF] to-[#A68CFF] text-white hover:brightness-110 hover:shadow-glow active:scale-[0.98] disabled:from-[#7C6CFF]/40 disabled:to-[#A68CFF]/40 disabled:pointer-events-none',
    secondary: 'bg-[#1E1F35] text-white hover:bg-[#2A2B4D] active:scale-[0.98] disabled:bg-[#1E1F35]/50 disabled:text-gray-500',
    outline: 'border border-[#1E1F35] bg-transparent text-gray-300 hover:text-white hover:bg-[#1E1F35] active:scale-[0.98] disabled:border-[#1E1F35]/50',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-[#1E1F35] active:scale-[0.98]',
    danger: 'bg-gradient-to-r from-[#FF5D73] to-[#FF8093] text-white hover:brightness-110 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
