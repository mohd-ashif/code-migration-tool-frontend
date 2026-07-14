interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  const activeSize = (size || 'md') as 'sm' | 'md' | 'lg';

  return (
    <div
      className={`animate-spin rounded-full border-t-transparent border-current ${sizes[activeSize]} ${className}`}
      style={{
        borderLeftColor: 'transparent',
      }}
    />
  );
}
