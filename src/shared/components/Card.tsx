import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  glow?: boolean;
}

export default function Card({ children, hoverEffect = false, glow = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-darkCard border border-[#1E1F35] rounded-2xl p-6 transition-all duration-300 ${
        hoverEffect ? 'hover:-translate-y-1 hover:border-[#7C6CFF]/30 hover:shadow-glow' : ''
      } ${glow ? 'shadow-glow border-[#7C6CFF]/20' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
