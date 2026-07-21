import { Loader2 } from 'lucide-react';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

interface LoaderProps {
  variant?: 'page' | 'fullscreen' | 'card' | 'table' | 'form' | 'upload' | 'graph' | 'button' | 'progress' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  progress?: number;
  message?: string;
  className?: string;
}

export default function Loader({
  variant = 'page', // Default loading spinner
  size = 'md',
  progress = 0,
  message,
  className = '',
}: LoaderProps) {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'md':
      default:
        return 'w-6 h-6';
    }
  };

  switch (variant) {
    case 'button':
      return (
        <Loader2 className={`animate-spin text-current shrink-0 ${getSpinnerSize()} ${className}`} />
      );

    case 'page':
      return (
        <div className={`flex flex-col items-center justify-center py-20 w-full animate-fadeIn ${className}`}>
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size={size} className="text-primary" />
            {message && (
              <span className="text-xs font-mono text-zinc-500 tracking-wide animate-pulse">
                {message}
              </span>
            )}
          </div>
        </div>
      );

    case 'fullscreen':
    case 'overlay':
      return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn ${className}`}>
          <div className="text-center space-y-4 max-w-sm px-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <LoadingSpinner size="lg" className="text-primary w-16 h-16" />
            </div>
            {message && (
              <p className="text-xs text-zinc-400 font-mono tracking-wide animate-pulse uppercase">
                {message}
              </p>
            )}
          </div>
        </div>
      );

    case 'card':
    case 'form':
      return (
        <div className={`flex flex-col items-center justify-center py-12 px-6 h-full min-h-[200px] border border-border/50 bg-[#0B0B14]/40 rounded-2xl animate-fadeIn ${className}`}>
          <LoadingSpinner size={size} className="text-primary" />
          {message && (
            <p className="text-xs text-zinc-500 font-mono mt-3 animate-pulse">
              {message}
            </p>
          )}
        </div>
      );

    case 'table':
      return (
        <div className={`w-full py-8 space-y-3 animate-pulse ${className}`}>
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex gap-4 px-4 py-3 border-b border-zinc-800/40">
              <div className="h-4 bg-[#1E1F35] rounded-md w-1/12" />
              <div className="h-4 bg-[#1E1F35] rounded-md w-4/12" />
              <div className="h-4 bg-[#1E1F35] rounded-md w-2/12" />
              <div className="h-4 bg-[#1E1F35] rounded-md w-3/12" />
              <div className="h-4 bg-[#1E1F35] rounded-md w-2/12" />
            </div>
          ))}
        </div>
      );

    case 'upload':
      return (
        <div className={`flex flex-col items-center justify-center p-8 border border-dashed border-[#7C6CFF]/30 bg-[#7C6CFF]/5 rounded-2xl text-center gap-3 animate-pulse ${className}`}>
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-mono text-zinc-400">{message || 'Uploading & parsing project...'}</p>
          <div className="w-48 h-1.5 bg-[#1E1F35] rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-gradient-to-r from-primary to-[#A68CFF] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      );

    case 'graph':
      return (
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-[#07080E]/85 z-20 backdrop-blur-sm animate-fadeIn ${className}`}>
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase animate-pulse">
            {message || 'Rendering AST Dependency Nodes...'}
          </p>
        </div>
      );

    case 'progress':
      return (
        <div className={`space-y-1.5 ${className}`}>
          <div className="flex justify-between text-[10px] font-mono text-zinc-400">
            <span>{message || 'Progress'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#1E1F35] rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      );

    default:
      return <LoadingSpinner size={size} className={className} />;
  }
}
