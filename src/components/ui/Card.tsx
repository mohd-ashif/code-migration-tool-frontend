import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export type CardVariant =
  | 'default'
  | 'dashboard'
  | 'statistic'
  | 'report'
  | 'job'
  | 'file'
  | 'graph'
  | 'metric';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'title'> {
  variant?: CardVariant;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  loading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  hoverable?: boolean;
  glow?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  title,
  subtitle,
  action,
  footer,
  children,
  loading = false,
  isEmpty = false,
  emptyTitle = 'No data available',
  emptyDescription,
  hoverable = false,
  glow = false,
  className = '',
  ...props
}) => {
  const isInteractive = hoverable || variant === 'job' || variant === 'file' || variant === 'report';

  return (
    <motion.div
      whileHover={isInteractive ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
      className={[
        'bg-darkCard border border-border rounded-2xl shadow-card overflow-hidden flex flex-col transition-all relative',
        glow ? 'shadow-glow border-primary/40' : '',
        isInteractive ? 'hover:border-zinc-700 hover:shadow-hover cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {/* Card Header */}
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between p-5 pb-4 border-b border-border/50 shrink-0">
          <div className="flex flex-col gap-0.5">
            {title && typeof title === 'string' ? (
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && typeof subtitle === 'string' ? (
              <p className="text-xs text-zinc-400">{subtitle}</p>
            ) : (
              subtitle
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col">
        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton height={24} width="60%" />
            <Skeleton height={16} width="85%" />
            <Skeleton height={16} width="40%" />
          </div>
        ) : isEmpty ? (
          <EmptyState title={emptyTitle} description={emptyDescription} compact />
        ) : (
          children
        )}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="p-4 px-5 bg-darkSidebar/50 border-t border-border/50 shrink-0 text-xs text-zinc-400">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;
