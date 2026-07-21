import React from 'react';
import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';
import { FrameworkDto } from '../../../shared/types/framework.types';
import { Code, Globe, Activity, Shield, Cpu, Sliders, FileCode, Database, Layers, Zap } from 'lucide-react';

export function getFrameworkIcon(slug: string) {
  switch (slug) {
    case 'react':
      return <Code className="w-4 h-4 text-sky-400" />;
    case 'vue':
      return <Layers className="w-4 h-4 text-emerald-400" />;
    case 'angular':
      return <Shield className="w-4 h-4 text-rose-500" />;
    case 'nextjs':
      return <Globe className="w-4 h-4 text-indigo-400" />;
    case 'nuxt':
      return <Activity className="w-4 h-4 text-green-400" />;
    case 'svelte':
      return <Zap className="w-4 h-4 text-amber-500" />;
    case 'solidjs':
      return <Cpu className="w-4 h-4 text-blue-400" />;
    case 'qwik':
      return <Sliders className="w-4 h-4 text-purple-400" />;
    case 'typescript':
      return <FileCode className="w-4 h-4 text-blue-500" />;
    case 'javascript':
      return <Database className="w-4 h-4 text-yellow-500" />;
    default:
      return <Code className="w-4 h-4 text-primary" />;
  }
}

interface FrameworkCardProps {
  framework: FrameworkDto;
  onClick: (id: string) => void;
}

export const FrameworkCard = React.memo(({ framework, onClick }: FrameworkCardProps) => {
  return (
    <Card
      onClick={() => onClick(framework.id)}
      className="flex flex-col justify-between hover:border-primary/20 hover:shadow-glow transition-all duration-300 cursor-pointer group"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl shadow-glow group-hover:border-primary/40 group-hover:scale-105 transition-all duration-300">
            {getFrameworkIcon(framework.slug)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-mono">{framework.displayName}</h4>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Version: {framework.currentVersion}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono">
            Configure →
          </span>
          <Badge status={framework.status === 'active' ? 'completed' : framework.status === 'maintenance' ? 'warning' : 'failed'} label={framework.status} />
        </div>
      </div>

      <p className="text-xs text-gray-400 font-sans mt-3 line-clamp-2 leading-relaxed">
        {framework.description}
      </p>

      <div className="mt-6 flex justify-between items-center border-t border-[#1E1F35] pt-4 text-[10px] font-mono text-gray-500">
        <span className="flex items-center gap-1">
          Success Rate: <strong className="text-success">{framework.avgSuccessRate ? `${framework.avgSuccessRate.toFixed(1)}%` : 'N/A'}</strong>
        </span>
        <span>
          Active Codemods: <strong className="text-white">{framework.codemodCount ?? 0}</strong>
        </span>
      </div>
    </Card>
  );
});
