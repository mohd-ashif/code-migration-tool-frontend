import React, { useState } from 'react';
import { useWorkspace360 } from '../hooks/useAdmin360';
import { useSuspendWorkspace, useReactivateWorkspace } from '../hooks/useAdmin';
import {
  Building2,
  Users,
  CreditCard,
  Cpu,
  HardDrive,
  FileText,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react';
import Skeleton from '../../../components/ui/Skeleton';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

interface AdminWorkspace360PageProps {
  workspaceId: string;
  onNavigateBack: () => void;
}

export const AdminWorkspace360Page: React.FC<AdminWorkspace360PageProps> = ({ workspaceId, onNavigateBack }) => {
  const { data: workspace360, isLoading } = useWorkspace360(workspaceId);
  const suspendMutation = useSuspendWorkspace();
  const reactivateMutation = useReactivateWorkspace();

  const [activeTab, setActiveTab] = useState<'members' | 'entitlements' | 'migrations' | 'billing' | 'audit'>('members');
  const [confirmAction, setConfirmAction] = useState<{ type: string; title: string; message: string } | null>(null);

  if (isLoading || !workspace360) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full bg-slate-900" />
        <Skeleton className="h-96 w-full bg-slate-900 border border-slate-800" />
      </div>
    );
  }

  const { workspace, members, subscription, entitlements, migrationStats, recentMigrations, failedMigrations, payments, auditLogs } = workspace360;

  const storageUsedMb = Number(workspace.storageUsed || 0) / 1024 / 1024;
  const storageLimitMb = Number(workspace.storageLimit || 5 * 1024 * 1024 * 1024) / 1024 / 1024;
  const storagePercent = Math.min(100, Math.round((storageUsedMb / storageLimitMb) * 100));

  const handleActionConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'suspend') suspendMutation.mutate(workspace.id);
    if (confirmAction.type === 'reactivate') reactivateMutation.mutate(workspace.id);
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onNavigateBack}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          ← Back to Workspaces
        </button>
        <span className="text-slate-600">/</span>
        <span className="text-xs text-slate-400 font-mono">Workspace 360° Tenant Diagnostic</span>
      </div>

      {/* Hero Tenant Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-slate-100">{workspace.name}</h1>
              <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                workspace.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {workspace.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">Tenant ID: {workspace.id}</p>
            <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-2">
              <span>Owner: <strong className="text-slate-300">{workspace.ownerName}</strong> ({workspace.ownerEmail})</span>
              <span>•</span>
              <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Workspace Quick Actions */}
        <div className="flex items-center space-x-3">
          {workspace.status === 'ACTIVE' ? (
            <button
              onClick={() => setConfirmAction({
                type: 'suspend',
                title: 'Suspend Workspace Tenant',
                message: `Are you sure you want to suspend workspace '${workspace.name}'? All member access and API services will be blocked.`,
              })}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Suspend Tenant
            </button>
          ) : (
            <button
              onClick={() => setConfirmAction({
                type: 'reactivate',
                title: 'Reactivate Workspace Tenant',
                message: `Reactivate workspace '${workspace.name}'? All member access will be restored immediately.`,
              })}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Reactivate Tenant
            </button>
          )}
        </div>
      </div>

      {/* Diagnostic KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Team Members</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{members.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Active Subscription</div>
          <div className="text-xl font-bold text-indigo-400 mt-1 uppercase font-mono">{subscription?.planSlug || 'Free'}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Migrations (Files / Lines)</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">
            {migrationStats.totalFiles} <span className="text-xs text-slate-400 font-normal">({migrationStats.totalLines.toLocaleString()} lines)</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Storage Utilization</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">
            {storagePercent}% <span className="text-xs text-slate-500 font-normal">({storageUsedMb.toFixed(0)} MB)</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-medium space-x-6">
        {[
          { id: 'members', label: 'Team Members & Roles', icon: Users },
          { id: 'entitlements', label: 'Entitlements & Usage', icon: Zap },
          { id: 'migrations', label: 'Migration Jobs & Failures', icon: Cpu },
          { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
          { id: 'audit', label: 'Security Audit Logs', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'members' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Member Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Tenant Role</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-semibold text-slate-200">{m.fullName || 'Unnamed'}</td>
                  <td className="p-4 font-mono text-slate-400">{m.email}</td>
                  <td className="p-4"><span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-bold text-[10px] uppercase">{m.role}</span></td>
                  <td className="p-4 font-mono text-slate-500">{new Date(m.joinedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'entitlements' && (
        <div className="space-y-6">
          {/* Storage Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-200">
              <span className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-indigo-400" /> Storage Capacity</span>
              <span className="font-mono text-indigo-400">{storageUsedMb.toFixed(1)} MB / {storageLimitMb.toFixed(0)} MB ({storagePercent}%)</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all" style={{ width: `${storagePercent}%` }} />
            </div>
          </div>

          {/* Entitlements Feature Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-200">Active Package Feature Capabilities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(entitlements?.entitlements || {}).map(([key, val]: any) => (
                <div key={key} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="capitalize text-slate-300 font-medium">{key.replace(/_/g, ' ')}</span>
                  <span className="font-mono font-bold text-indigo-400">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'migrations' && (
        <div className="space-y-6">
          {/* Failure Diagnostics */}
          {failedMigrations.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-rose-400 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" /> Diagnostic Alert: {failedMigrations.length} Failed Migration Runs
              </h3>
              <div className="space-y-2">
                {failedMigrations.map((fm: any) => (
                  <div key={fm.id} className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/30 text-xs font-mono">
                    <div className="text-rose-300 font-bold">{fm.sourceLang} → {fm.targetLang}</div>
                    <div className="text-rose-400 text-[11px] mt-1">{fm.errorMessage}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Migrations Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Language Pair</th>
                  <th className="p-4">Files / Lines</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentMigrations.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono font-bold text-slate-200">{m.sourceLang} → {m.targetLang}</td>
                    <td className="p-4 font-mono text-slate-400">{m.filesCount} files / {m.totalLines} lines</td>
                    <td className="p-4 font-mono text-slate-400">{(m.durationMs / 1000).toFixed(2)}s</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        m.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{new Date(m.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500">No payment history for this workspace.</td></tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono text-slate-300">{p.transactionId}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="p-4 text-slate-400 capitalize">{p.paymentMethod}</td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">{p.status}</span></td>
                    <td className="p-4 font-mono text-slate-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500">No security audit logs recorded for this tenant.</p>
            ) : (
              auditLogs.map((log: any, idx: number) => (
                <div key={idx} className="flex items-start space-x-3 text-xs font-mono border-b border-slate-800/60 pb-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><FileText className="w-3.5 h-3.5" /></div>
                  <div className="flex-1">
                    <div className="text-slate-200 font-bold">{log.action}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">IP: {log.ipAddress || '127.0.0.1'}</div>
                  </div>
                  <div className="text-slate-500 text-[10px]">{new Date(log.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleActionConfirm}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmLabel="Confirm Action"
        isDestructive={confirmAction?.type === 'suspend'}
      />
    </div>
  );
};
