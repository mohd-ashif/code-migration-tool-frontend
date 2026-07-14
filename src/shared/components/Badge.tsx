type BadgeStatus = 'completed' | 'failed' | 'pending' | 'running' | 'warning';

interface BadgeProps {
  status: BadgeStatus | string;
  label?: string;
  className?: string;
}

export default function Badge({ status, label, className = '' }: BadgeProps) {
  const normStatus = status.toLowerCase();
  
  let bgClass = 'bg-[#1E1F35]/50 text-gray-400 border border-gray-500/20';
  let dotClass = 'bg-gray-400';
  let resolvedLabel = label || status;

  if (normStatus === 'completed') {
    bgClass = 'bg-[#16C784]/10 text-[#16C784] border border-[#16C784]/20';
    dotClass = 'bg-[#16C784]';
  } else if (normStatus === 'failed') {
    bgClass = 'bg-[#FF5D73]/10 text-[#FF5D73] border border-[#FF5D73]/20';
    dotClass = 'bg-[#FF5D73]';
  } else if (normStatus === 'pending' || normStatus.includes('running') || normStatus.includes('migrating') || normStatus.includes('parsing')) {
    bgClass = 'bg-[#7C6CFF]/10 text-[#7C6CFF] border border-[#7C6CFF]/20';
    dotClass = 'bg-[#7C6CFF] animate-pulse';
    resolvedLabel = label || (normStatus.includes('migrating') ? 'Migrating...' : normStatus.includes('parsing') ? 'Parsing...' : 'Running');
  } else if (normStatus === 'warning' || normStatus.includes('warning')) {
    bgClass = 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20';
    dotClass = 'bg-[#F5A623]';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bgClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span className="capitalize">{resolvedLabel}</span>
    </span>
  );
}
