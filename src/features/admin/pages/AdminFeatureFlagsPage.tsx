import React from 'react';
import { useFeatureFlags, useSaveFeatureFlag } from '../hooks/useAdmin';
import { Flag, ToggleLeft, ToggleRight } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export const AdminFeatureFlagsPage: React.FC = () => {
  const { data: flags, isLoading } = useFeatureFlags();
  const saveMutation = useSaveFeatureFlag();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Feature Flags Control Center</h1>
        <p className="text-xs text-slate-400 mt-0.5">Toggle runtime feature flags, set rollout percentages, and target specific plans/workspaces.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {flags?.map((f: any) => (
              <div key={f.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition">
                <div>
                  <div className="flex items-center space-x-2">
                    <Flag className={`w-4 h-4 ${f.enabled ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="font-semibold text-slate-200 text-sm">{f.key}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.enabled ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {f.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{f.description}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-xs text-slate-400">
                    Rollout: <span className="font-bold text-slate-200">{f.rolloutPercentage}%</span>
                  </div>

                  <button
                    onClick={() => {
                      saveMutation.mutate({
                        key: f.key,
                        description: f.description,
                        enabled: !f.enabled,
                        rolloutPercentage: f.rolloutPercentage,
                      });
                    }}
                    className={`p-1.5 rounded-lg border transition ${
                      f.enabled
                        ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {f.enabled ? <ToggleRight className="w-6 h-6 text-indigo-400" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
