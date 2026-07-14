import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  className = '',
  children,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-[#1E1F35] bg-[#12131F] rounded-2xl ${className}`}>
      <div className="p-4 bg-[#7C6CFF]/5 border border-[#7C6CFF]/15 text-[#7C6CFF] rounded-2xl mb-4 shadow-glow">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-md font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed mb-4">{description}</p>
      {children}
    </div>
  );
}
