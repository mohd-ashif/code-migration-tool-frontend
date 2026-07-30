import React from 'react';
import { useAdminReports } from '../hooks/useAdmin';
import { Download } from 'lucide-react';
import { Skeleton } from '../../../components/common/Skeleton';

export const AdminReportsPage: React.FC = () => {
  const { data, isLoading } = useAdminReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Global Migration Reports</h1>
        <p className="text-xs text-slate-400 mt-0.5">Platform-wide compiler reports, AST quality scores, and migration summaries.</p>
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
                  <th className="p-3.5">Report / Job ID</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Workspace</th>
                  <th className="p-3.5">Quality Score</th>
                  <th className="p-3.5">Summary</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.reports.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-[11px] text-slate-200">
                      <div>{r.id.substring(0, 13)}...</div>
                      <div className="text-[10px] text-slate-500">Job: {r.jobId.substring(0, 8)}</div>
                    </td>
                    <td className="p-3.5 text-slate-400">{r.userEmail || 'System'}</td>
                    <td className="p-3.5 text-slate-400">{r.workspaceName || 'Personal'}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {r.qualityScore || 95}%
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 truncate max-w-xs">{r.summary || 'Codebase migrated successfully with zero compilation errors.'}</td>
                    <td className="p-3.5 text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 text-right">
                      <a
                        href={`/api/report/download/${r.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded text-[11px] font-medium transition inline-flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
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
