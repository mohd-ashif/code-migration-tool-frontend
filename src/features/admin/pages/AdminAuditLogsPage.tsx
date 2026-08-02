import React from 'react';
import { useAdminAuditLogs } from '../hooks/useAdmin';
import { Skeleton } from '../../../components/ui/Skeleton';

export const AdminAuditLogsPage: React.FC = () => {
  const { data, isLoading } = useAdminAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Immutable Admin Audit Trail</h1>
        <p className="text-xs text-slate-400 mt-0.5">Audit trail of all administrative mutations, user suspensions, refunds, and feature flag changes.</p>
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
                  <th className="p-3.5">Admin User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Resource</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.logs.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-medium text-slate-100">{a.adminEmail || a.adminUserId || 'System Super Admin'}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {a.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {a.resourceType}:{a.resourceId || 'global'}
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono">{a.ipAddress || '127.0.0.1'}</td>
                    <td className="p-3.5 text-slate-400">{new Date(a.createdAt).toLocaleString()}</td>
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
