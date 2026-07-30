import React, { useState } from 'react';
import { useAdminUsage, useCreateQuotaOverride } from '../hooks/useAdminExtendedAnalytics';
import { AlertTriangle, Plus, ShieldCheck, Activity } from 'lucide-react';
import Skeleton from '../../../components/common/Skeleton';

export const AdminUsagePage: React.FC = () => {
  const { data: usageData, isLoading } = useAdminUsage();
  const createOverrideMutation = useCreateQuotaOverride();

  const [modalOpen, setModalOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    workspaceId: '',
    metric: 'storage_bytes',
    overrideValue: 10737418240, // 10 GB
    reason: 'Temporary enterprise POC quota boost',
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <Skeleton className="h-96 bg-slate-900 border border-slate-800" />
      </div>
    );
  }

  const handleCreateOverride = (e: React.FormEvent) => {
    e.preventDefault();
    createOverrideMutation.mutate(
      {
        workspaceId: overrideForm.workspaceId,
        metric: overrideForm.metric,
        overrideValue: Number(overrideForm.overrideValue),
        reason: overrideForm.reason,
        expiresAt: new Date(overrideForm.expiresAt).toISOString(),
      },
      {
        onSuccess: () => setModalOpen(false),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-400" />
            <span>Usage & Quota Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time consumption across tenants and grant controlled, audited limit overrides.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Grant Quota Override</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Migrations Run</div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{usageData?.totalMigrations || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Storage Consumed</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
            {((usageData?.totalStorageBytes || 0) / 1024 / 1024 / 1024).toFixed(2)} GB
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Active Quota Violations</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">{usageData?.violations?.length || 0}</div>
        </div>
      </div>

      {/* Quota Violations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-xs text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-2 text-rose-400"><AlertTriangle className="w-4 h-4" /> Tenant Quota Violations (At Limit)</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="p-4">Workspace</th>
              <th className="p-4">Owner Email</th>
              <th className="p-4">Current Plan</th>
              <th className="p-4">Storage Consumption</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {usageData?.violations?.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">No active quota violations detected.</td></tr>
            ) : (
              usageData?.violations?.map((v: any) => (
                <tr key={v.workspaceId} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-semibold text-slate-200">{v.workspaceName}</td>
                  <td className="p-4 font-mono text-slate-400">{v.ownerEmail}</td>
                  <td className="p-4 font-mono uppercase text-indigo-400 font-bold">{v.planName || 'Free'}</td>
                  <td className="p-4 font-mono text-rose-400 font-bold">
                    {(Number(v.storageUsed) / 1024 / 1024).toFixed(0)} MB / {(Number(v.storageLimit) / 1024 / 1024).toFixed(0)} MB (100%)
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setOverrideForm({ ...overrideForm, workspaceId: v.workspaceId });
                        setModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      Boost Limit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Active Overrides Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-xs text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Administrative Quota Overrides
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="p-4">Workspace</th>
              <th className="p-4">Metric</th>
              <th className="p-4">Override Value</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Granted By</th>
              <th className="p-4">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {usageData?.activeOverrides?.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No active quota overrides recorded.</td></tr>
            ) : (
              usageData?.activeOverrides?.map((o: any) => (
                <tr key={o.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-semibold text-slate-200">{o.workspaceName}</td>
                  <td className="p-4 font-mono text-indigo-400">{o.metric}</td>
                  <td className="p-4 font-mono font-bold text-slate-100">{Number(o.overrideValue).toLocaleString()}</td>
                  <td className="p-4 text-slate-300 italic">{o.reason}</td>
                  <td className="p-4 text-slate-400">{o.grantedByName || 'Super Admin'}</td>
                  <td className="p-4 font-mono text-emerald-400">{new Date(o.expiresAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quota Override Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100">Grant Administrative Quota Override</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateOverride} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Workspace ID</label>
                <input
                  type="text"
                  required
                  value={overrideForm.workspaceId}
                  onChange={(e) => setOverrideForm({ ...overrideForm, workspaceId: e.target.value })}
                  placeholder="e.g. 76982941-0119-4551-8177-0eefd2c9f829"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Metric</label>
                  <select
                    value={overrideForm.metric}
                    onChange={(e) => setOverrideForm({ ...overrideForm, metric: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="storage_bytes">Storage (Bytes)</option>
                    <option value="migrations">Migrations Count</option>
                    <option value="ai_requests">AI Requests</option>
                    <option value="team_members">Team Seats</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Override Value</label>
                  <input
                    type="number"
                    required
                    value={overrideForm.overrideValue}
                    onChange={(e) => setOverrideForm({ ...overrideForm, overrideValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Mandatory Override Reason</label>
                <textarea
                  rows={2}
                  required
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder="Approved by Account Exec for Enterprise Evaluation..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={overrideForm.expiresAt}
                  onChange={(e) => setOverrideForm({ ...overrideForm, expiresAt: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createOverrideMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  {createOverrideMutation.isPending ? 'Granting...' : 'Grant Audited Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
