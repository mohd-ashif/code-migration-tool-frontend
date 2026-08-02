import React from 'react';
import { Loader2 } from 'lucide-react';
import Skeleton from './Skeleton';

export interface LoadingProps {
  variant?: 'spinner' | 'progress' | 'card' | 'table' | 'editor' | 'graph' | 'fullScreen';
  progress?: number;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  progress,
  text,
  size = 'md',
  className = '',
}) => {
  const spinnerSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (variant === 'fullScreen') {
    return (
      <div className="fixed inset-0 z-[9999] bg-darkBg/90 backdrop-blur-md flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        {text && <span className="text-sm font-semibold text-zinc-300 tracking-wide">{text}</span>}
      </div>
    );
  }

  if (variant === 'progress') {
    const value = Math.min(100, Math.max(0, progress || 0));
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-400">{text || 'Loading...'}</span>
          <span className="font-semibold text-primary-light">{value}%</span>
        </div>
        <div className="w-full h-2 bg-darkInput border border-border/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 bg-darkCard border border-border rounded-2xl flex flex-col gap-4 ${className}`}>
        <Skeleton height={24} width="50%" />
        <Skeleton height={16} width="80%" />
        <Skeleton height={16} width="65%" />
        <Skeleton height={40} className="mt-2" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`flex flex-col gap-3 p-4 bg-darkCard border border-border rounded-xl ${className}`}>
        <Skeleton height={32} width="100%" />
        <Skeleton height={20} width="100%" />
        <Skeleton height={20} width="100%" />
        <Skeleton height={20} width="100%" />
      </div>
    );
  }

  if (variant === 'editor') {
    return (
      <div className={`p-4 bg-darkInput border border-border rounded-xl flex flex-col gap-3 ${className}`}>
        <Skeleton height={20} width="30%" />
        <Skeleton height={120} width="100%" />
      </div>
    );
  }

  if (variant === 'graph') {
    return (
      <div className={`p-6 bg-darkCard border border-border rounded-2xl flex items-center justify-center min-h-[260px] ${className}`}>
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-xs font-medium">Rendering graph nodes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 text-zinc-400 ${className}`}>
      <Loader2 className={`${spinnerSizeMap[size]} text-primary animate-spin shrink-0`} />
      {text && <span className="text-xs font-medium">{text}</span>}
    </div>
  );
};

export default Loading;
