import { Shield, CheckCircle2 } from 'lucide-react';

interface QualityGateCardProps {
  validationGates: string[];
}

export default function QualityGateCard({ validationGates }: QualityGateCardProps) {
  if (validationGates.length === 0) return null;

  return (
    <div className="space-y-2.5 select-none">
      <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-mono">
        <Shield className="w-3.5 h-3.5 text-success shrink-0" /> Quality Gates Status
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {validationGates.map((gate, i) => {
          const isLastAndOdd = i === validationGates.length - 1 && validationGates.length % 2 !== 0;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 p-2.5 bg-success/5 border border-success/15 rounded-xl text-[11px] text-success font-medium ${
                isLastAndOdd ? 'sm:col-span-2' : ''
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
              <span className="truncate" title={gate}>
                {gate}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
