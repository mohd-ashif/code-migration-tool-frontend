import React, { useState } from 'react';
import { useAdminLogs } from '../hooks/useAdmin';
import { Skeleton } from '../../../components/ui/Skeleton';

export const AdminLogsPage: React.FC = () => {
  const [levelFilter, setLevelFilter] = useState('');
  const { data, isLoading } = useAdminLogs({ level: levelFilter });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Structured Application Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">Admin-accessible application logs with automatic sensitive token redaction.</p>
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-40"
        >
          <option value="">All Levels</option>
          <option value="info">INFO</option>
          <option value="warn">WARN</option>
          <option value="error">ERROR</option>
        </select>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto space-y-2 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-6 bg-slate-900" />
            ))}
          </div>
        ) : (
          data?.logs.map((l: any) => (
            <div key={l.id} className="flex items-start space-x-3 hover:bg-slate-900/60 p-1.5 rounded transition">
              <span className="text-slate-500 text-[11px] flex-shrink-0">
                [{new Date(l.createdAt).toLocaleTimeString()}]
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                l.level === 'error' ? 'bg-red-500/20 text-red-400' :
                l.level === 'warn' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {l.level || 'info'}
              </span>
              <span className="text-slate-200 break-all">{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
