import Loading from '../ui/Loading';

export interface LoaderProps {
  variant?: 'page' | 'fullscreen' | 'card' | 'table' | 'form' | 'upload' | 'graph' | 'button' | 'progress' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  progress?: number;
  message?: string;
  className?: string;
}

export default function Loader({
  variant = 'page',
  size = 'md',
  progress = 0,
  message,
  className = '',
}: LoaderProps) {
  if (variant === 'fullscreen' || variant === 'overlay') {
    return <Loading variant="fullScreen" text={message} className={className} />;
  }

  if (variant === 'progress' || variant === 'upload') {
    return <Loading variant="progress" progress={progress} text={message} className={className} />;
  }

  if (variant === 'card' || variant === 'form') {
    return <Loading variant="card" text={message} className={className} />;
  }

  if (variant === 'table') {
    return <Loading variant="table" className={className} />;
  }

  if (variant === 'graph') {
    return <Loading variant="graph" text={message} className={className} />;
  }

  return <Loading variant="spinner" size={size} text={message} className={className} />;
}
