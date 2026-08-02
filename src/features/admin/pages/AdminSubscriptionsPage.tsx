import React from 'react';
import { useAdminSubscriptions } from '../hooks/useAdmin';
import { Skeleton } from '../../../components/ui/Skeleton';

export const AdminSubscriptionsPage: React.FC = () => {
  const { data, isLoading } = useAdminSubscriptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Subscriptions Management</h1>
        <p className="text-xs text-slate-400 mt-0.5">Platform subscription tiers, status tracking, and renewal periods.</p>
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
                  <th className="p-3.5">Workspace</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Current Period Start</th>
                  <th className="p-3.5">Current Period End</th>
                  <th className="p-3.5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.subscriptions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-medium text-slate-100">{s.workspaceName || s.workspaceId}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {s.planId}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        s.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{s.currentPeriodStart ? new Date(s.currentPeriodStart).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-3.5 text-slate-400">{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-3.5 text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
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
