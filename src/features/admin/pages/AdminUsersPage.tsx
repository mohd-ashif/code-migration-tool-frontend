import React, { useState } from 'react';
import { useAdminUsers, useSuspendUser, useReactivateUser } from '../hooks/useAdmin';
import { Search, UserX, UserCheck, Shield } from 'lucide-react';
import { Skeleton } from '../../../components/common/Skeleton';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

export const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useAdminUsers({ search, status: statusFilter });
  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();

  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Inspect user accounts, system roles, and status controls.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by email or name..."
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
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
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
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">System Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Workspaces</th>
                  <th className="p-3.5">Jobs</th>
                  <th className="p-3.5">Joined Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-medium text-slate-100">{u.fullName || 'No Name'}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Shield className="w-3 h-3" />
                        <span>{u.systemRole}</span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5">{u.workspaceCount}</td>
                    <td className="p-3.5">{u.jobCount}</td>
                    <td className="p-3.5 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          window.history.pushState({}, '', `/admin/users/${u.id}`);
                          window.dispatchEvent(new Event('popstate'));
                        }}
                        className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded text-[11px] font-medium transition cursor-pointer"
                      >
                        View 360°
                      </button>
                      {u.status === 'ACTIVE' ? (
                        <button
                          onClick={() => setConfirmUserId(u.id)}
                          className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded text-[11px] font-medium transition inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <UserX className="w-3 h-3" />
                          <span>Suspend</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivateMutation.mutate(u.id)}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-medium transition inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <UserCheck className="w-3 h-3" />
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

      <ConfirmDialog
        isOpen={Boolean(confirmUserId)}
        onClose={() => setConfirmUserId(null)}
        onConfirm={() => {
          if (confirmUserId) suspendMutation.mutate({ userId: confirmUserId });
          setConfirmUserId(null);
        }}
        title="Suspend User Account"
        message="Are you sure you want to suspend this user? They will immediately lose platform access."
        confirmLabel="Suspend User"
        isDestructive={true}
      />
    </div>
  );
};
