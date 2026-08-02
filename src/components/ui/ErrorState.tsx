import React from 'react';
import { AlertOctagon, ShieldAlert, Lock, ServerCrash, WifiOff, Wrench, RefreshCw } from 'lucide-react';
import Button from './Button';

export type ErrorPageType = '404' | '403' | '401' | '500' | 'network' | 'maintenance';

export interface ErrorStateProps {
  type?: ErrorPageType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

const errorConfigs: Record<
  ErrorPageType,
  { code: string; icon: React.ReactNode; title: string; description: string }
> = {
  '404': {
    code: '404',
    icon: <AlertOctagon className="w-12 h-12 text-warning" />,
    title: 'Page Not Found',
    description: 'The page or resource you are looking for does not exist or has been moved.',
  },
  '403': {
    code: '403',
    icon: <ShieldAlert className="w-12 h-12 text-danger" />,
    title: 'Access Forbidden',
    description: 'You do not have the required permissions to access this area.',
  },
  '401': {
    code: '401',
    icon: <Lock className="w-12 h-12 text-info" />,
    title: 'Unauthorized Session',
    description: 'Your session has expired or you need to authenticate to continue.',
  },
  '500': {
    code: '500',
    icon: <ServerCrash className="w-12 h-12 text-danger" />,
    title: 'Internal Server Error',
    description: 'An unexpected system error occurred while processing your request.',
  },
  network: {
    code: 'OFFLINE',
    icon: <WifiOff className="w-12 h-12 text-warning" />,
    title: 'Network Connection Lost',
    description: 'Please check your internet connection and try connecting again.',
  },
  maintenance: {
    code: '503',
    icon: <Wrench className="w-12 h-12 text-primary" />,
    title: 'Under Maintenance',
    description: 'System upgrades are currently in progress. We will be back shortly.',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = '500',
  title,
  description,
  onRetry,
  onGoHome,
  className = '',
}) => {
  const config = errorConfigs[type];

  return (
    <div
      className={`min-h-[400px] w-full flex flex-col items-center justify-center text-center p-8 bg-darkBg rounded-2xl border border-border ${className}`}
    >
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-2xl bg-darkCard border border-border flex items-center justify-center shadow-lg">
          {config.icon}
        </div>
        <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-extrabold uppercase bg-danger/20 text-danger border border-danger/30 rounded-full font-mono">
          {config.code}
        </span>
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <h2 className="text-xl font-bold text-white tracking-tight">{title || config.title}</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">{description || config.description}</p>
      </div>

      <div className="flex items-center gap-3 mt-6">
        {onRetry && (
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button variant="primary" size="sm" onClick={onGoHome}>
            Return Home
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
