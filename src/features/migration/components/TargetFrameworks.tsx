import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';
import PageHeader from '../../../shared/components/PageHeader';
import { Zap } from 'lucide-react';

export default function TargetFrameworks() {
  const frameworks = [
    { name: 'React (JSX / TSX)', status: 'Active', version: 'v18.2.0', speed: 'Ultra', count: 12 },
    { name: 'Next.js Router Compiler', status: 'Active', version: 'v14.0.0', speed: 'High', count: 8 },
    { name: 'Vue 3 SFC Engine', status: 'Active', version: 'v3.4.0', speed: 'High', count: 5 },
    { name: 'Nuxt 3 Composables Translators', status: 'Active', version: 'v3.8.0', speed: 'Medium', count: 4 },
    { name: 'Svelte Reactive Compiler', status: 'Active', version: 'v4.2.0', speed: 'High', count: 6 },
    { name: 'SolidJS AST Signals Mapper', status: 'Active', version: 'v1.8.0', speed: 'Ultra', count: 3 },
    { name: 'Qwik Optimizer Translator', status: 'Active', version: 'v1.5.0', speed: 'Medium', count: 2 },
  ];

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <PageHeader
        title="Configure Target Frameworks"
        subtitle="Manage active AST engines and framework compilation pipelines"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frameworks.map((fw) => (
          <Card key={fw.name} className="flex flex-col justify-between hover:border-primary/20 hover:shadow-glow transition-all duration-300">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl shadow-glow">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">{fw.name}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Version: {fw.version}</p>
                </div>
              </div>
              <Badge status="completed" label={fw.status} />
            </div>

            <div className="mt-6 flex justify-between items-center border-t border-[#1E1F35] pt-4 text-[10px] font-mono text-gray-500">
              <span className="flex items-center gap-1">
                Optimization: <strong className="text-success">{fw.speed}</strong>
              </span>
              <span>
                Active Codemods: <strong className="text-white">{fw.count}</strong>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
