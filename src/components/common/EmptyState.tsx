import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  children,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-[#1E1F35] bg-[#12131F]/50 rounded-2xl animate-fadeIn ${className}`}>
      <div className="p-4 bg-[#7C6CFF]/5 border border-[#7C6CFF]/15 text-[#7C6CFF] rounded-2xl mb-4 shadow-glow">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-5">{description}</p>
      
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}

      {children}
    </div>
  );
}
