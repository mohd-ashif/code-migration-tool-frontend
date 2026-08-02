import React from 'react';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  const getInitials = (n?: string) => {
    if (!n) return '';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={[
          'rounded-full bg-darkCard border border-border flex items-center justify-center font-bold text-white overflow-hidden shadow-sm select-none',
          sizeMap[size],
        ].join(' ')}
      >
        {src ? (
          <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
        ) : name ? (
          <span>{getInitials(name)}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-zinc-400" />
        )}
      </div>

      {status && (
        <span
          className={[
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-darkBg',
            status === 'online' ? 'bg-success' : status === 'busy' ? 'bg-danger' : 'bg-zinc-500',
          ].join(' ')}
        />
      )}
    </div>
  );
};

export default Avatar;
