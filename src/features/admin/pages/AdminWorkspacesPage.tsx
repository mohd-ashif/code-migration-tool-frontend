import React, { useState } from 'react';
import { useAdminWorkspaces, useSuspendWorkspace, useReactivateWorkspace } from '../hooks/useAdmin';
import { Search, Ban, CheckCircle } from 'lucide-react';
import { Skeleton } from '../../../components/common/Skeleton';

export const AdminWorkspacesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminWorkspaces({ search });
  const suspendMutation = useSuspendWorkspace();
  const reactivateMutation = useReactivateWorkspace();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Workspace Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Platform multi-tenant workspace catalog, membership counts, and billing tiers.</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search workspace name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
          />
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
                  <th className="p-3.5">Workspace</th>
                  <th className="p-3.5">Owner</th>
                  <th className="p-3.5">Members</th>
                  <th className="p-3.5">Active Plan</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Created At</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.workspaces.map((w: any) => (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-medium text-slate-100">{w.name}</td>
                    <td className="p-3.5 text-slate-400">{w.ownerEmail || w.ownerId}</td>
                    <td className="p-3.5">{w.memberCount}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {w.planId || 'Free'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        w.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          window.history.pushState({}, '', `/admin/workspaces/${w.id}`);
                          window.dispatchEvent(new Event('popstate'));
                        }}
                        className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded text-[11px] font-medium transition cursor-pointer"
                      >
                        View 360°
                      </button>
                      {w.status === 'ACTIVE' ? (
                        <button
                          onClick={() => suspendMutation.mutate({ workspaceId: w.id })}
                          className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded text-[11px] font-medium transition inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Suspend</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivateMutation.mutate(w.id)}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-medium transition inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Reactivate</span>
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
