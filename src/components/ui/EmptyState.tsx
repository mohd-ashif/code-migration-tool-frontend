import React from 'react';
import {
  FolderOpen,
  SearchX,
  Briefcase,
  BarChart3,
  Network,
  History,
  Inbox,
} from 'lucide-react';
import Button from './Button';

export type EmptyStateType =
  | 'default'
  | 'jobs'
  | 'reports'
  | 'files'
  | 'search'
  | 'graph'
  | 'history';

export interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  children?: React.ReactNode; // Support children JSX elements (e.g. custom action buttons)
  compact?: boolean;
  className?: string;
}

const defaultTypeConfigs: Record<
  EmptyStateType,
  { icon: React.ReactNode; title: string; description: string }
> = {
  default: {
    icon: <Inbox className="w-8 h-8 text-zinc-400" />,
    title: 'No Data Available',
    description: 'There are no items to display at this time.',
  },
  jobs: {
    icon: <Briefcase className="w-8 h-8 text-primary" />,
    title: 'No Migration Jobs Found',
    description: 'Create a new migration job to start converting your codebase.',
  },
  reports: {
    icon: <BarChart3 className="w-8 h-8 text-info" />,
    title: 'No Reports Generated',
    description: 'Run a migration task to view detailed reports and analytics.',
  },
  files: {
    icon: <FolderOpen className="w-8 h-8 text-secondary" />,
    title: 'No Files Uploaded',
    description: 'Upload your source code repository or files to begin analysis.',
  },
  search: {
    icon: <SearchX className="w-8 h-8 text-warning" />,
    title: 'No Matching Search Results',
    description: 'Try refining your search terms or clearing filters.',
  },
  graph: {
    icon: <Network className="w-8 h-8 text-primary" />,
    title: 'No Dependency Graph',
    description: 'Select a valid workspace or job to render dependencies.',
  },
  history: {
    icon: <History className="w-8 h-8 text-zinc-400" />,
    title: 'No Migration History',
    description: 'Your previous migration executions will appear here.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  icon,
  title,
  description,
  actionText,
  onAction,
  action,
  children,
  compact = false,
  className = '',
}) => {
  const config = defaultTypeConfigs[type];
  const renderedIcon = icon || config.icon;
  const renderedTitle = title || config.title;
  const renderedDescription = description || config.description;
  const renderedAction = children || action || (actionText && onAction ? (
    <Button variant="primary" size="sm" onClick={onAction}>
      {actionText}
    </Button>
  ) : null);

  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-border/80 bg-darkCard/30',
        compact ? 'py-6 px-4 gap-2' : 'py-12 px-6 gap-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="w-14 h-14 rounded-2xl bg-darkInput border border-border flex items-center justify-center shrink-0 shadow-sm">
        {renderedIcon}
      </div>

      <div className="flex flex-col gap-1 max-w-sm">
        <h4 className="text-base font-bold text-white tracking-tight">{renderedTitle}</h4>
        <p className="text-xs text-zinc-400 leading-relaxed">{renderedDescription}</p>
      </div>

      {renderedAction && <div className="mt-2">{renderedAction}</div>}
    </div>
  );
};

export default EmptyState;
