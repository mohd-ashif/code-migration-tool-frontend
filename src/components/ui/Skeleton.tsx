import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  variant?: 'text' | 'rectangular' | 'circle' | string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height = 16,
  circle = false,
  variant,
  className = '',
}) => {
  const isCircle = circle || variant === 'circle';
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width || '100%',
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      style={style}
      className={[
        'bg-zinc-800/60 animate-pulse',
        isCircle ? 'rounded-full' : 'rounded-lg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
};

export default Skeleton;
