import React, { useState } from 'react';
import { useAdminJobs, useRetryAdminJob, useCancelAdminJob } from '../hooks/useAdmin';
import { Search, RotateCcw, XCircle } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export const AdminJobsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useAdminJobs({ search, status: statusFilter });

  const retryMutation = useRetryAdminJob();
  const cancelMutation = useCancelAdminJob();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Global Migration Jobs</h1>
          <p className="text-xs text-slate-400 mt-0.5">Platform-wide job processing stream, worker assignments, and elevated controls.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search job ID or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="QUEUED">QUEUED</option>
            <option value="MIGRATING">MIGRATING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
            <option value="PAUSED">PAUSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3.5">Job ID / Project</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Framework Pair</th>
                  <th className="p-3.5">Status / Stage</th>
                  <th className="p-3.5">Progress</th>
                  <th className="p-3.5">Worker</th>
                  <th className="p-3.5">Created At</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.jobs.map((j: any) => (
                  <tr key={j.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-medium text-slate-100">
                      <div>{j.projectName || 'Migration Project'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{j.id.substring(0, 13)}...</div>
                    </td>
                    <td className="p-3.5 text-slate-400">{j.userEmail || j.userId || 'System'}</td>
                    <td className="p-3.5 font-semibold text-indigo-400">
                      {j.sourceFramework} → {j.targetFramework}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        j.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        j.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                        j.status === 'CANCELLED' ? 'bg-slate-700 text-slate-300' : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${j.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400">{j.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[10px]">{j.workerId || 'pool-worker-1'}</td>
                    <td className="p-3.5 text-slate-400">{new Date(j.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 text-right space-x-2">
                      {(j.status === 'FAILED' || j.status === 'CANCELLED') && (
                        <button
                          onClick={() => retryMutation.mutate(j.id)}
                          className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded text-[11px] font-medium transition inline-flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}
                      {(j.status === 'QUEUED' || j.status === 'MIGRATING' || j.status === 'PAUSED') && (
                        <button
                          onClick={() => cancelMutation.mutate(j.id)}
                          className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded text-[11px] font-medium transition inline-flex items-center space-x-1"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
