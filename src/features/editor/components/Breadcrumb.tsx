import { ChevronRight, FileCode, Folder } from 'lucide-react';

interface BreadcrumbProps {
  filePath: string;
}

export default function Breadcrumb({ filePath }: BreadcrumbProps) {
  if (!filePath) return null;
  const parts = filePath.split('/');

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 py-1.5 px-3 select-none overflow-hidden shrink-0 border-b border-border bg-[#0E0F1A]">
      <Folder className="w-3.5 h-3.5 text-[#A68CFF] shrink-0" />
      <span>root</span>
      {parts.map((p, idx) => {
        const isLast = idx === parts.length - 1;
        return (
          <div key={idx} className="flex items-center gap-1.5 shrink-0">
            <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
            {isLast ? (
              <FileCode className="w-3.5 h-3.5 text-primary shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-[#A68CFF] shrink-0" />
            )}
            <span className={isLast ? 'text-gray-300 font-bold' : ''}>{p}</span>
          </div>
        );
      })}
    </div>
  );
}
