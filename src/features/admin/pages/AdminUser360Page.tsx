import React, { useState } from 'react';
import {
  useUser360,
  useRevokeSessions,
  useRevokeApiKeys,
  useResetUserUsage,
} from '../hooks/useAdmin360';
import { useSuspendUser, useReactivateUser } from '../hooks/useAdmin';
import {
  Shield,
  Building2,
  CreditCard,
  Cpu,
  Key,
  Globe,
  FileText,
  CheckCircle2,
  XCircle,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import Skeleton from '../../../components/common/Skeleton';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

interface AdminUser360PageProps {
  userId: string;
  onNavigateBack: () => void;
}

export const AdminUser360Page: React.FC<AdminUser360PageProps> = ({ userId, onNavigateBack }) => {
  const { data: user360, isLoading } = useUser360(userId);
  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();
  const revokeSessionsMutation = useRevokeSessions();
  const revokeApiKeysMutation = useRevokeApiKeys();
  const resetUsageMutation = useResetUserUsage();

  const [activeTab, setActiveTab] = useState<'workspaces' | 'billing' | 'migrations' | 'security' | 'audit'>('workspaces');
  const [confirmAction, setConfirmAction] = useState<{ type: string; title: string; message: string } | null>(null);

  if (isLoading || !user360) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full bg-slate-900" />
        <Skeleton className="h-96 w-full bg-slate-900 border border-slate-800" />
      </div>
    );
  }

  const { user, workspaces, subscription, migrationStats, recentMigrations, payments, sessions, apiKeys, auditLogs } = user360;

  const handleActionConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'suspend') suspendMutation.mutate({ userId: user.id });
    if (confirmAction.type === 'reactivate') reactivateMutation.mutate(user.id);
    if (confirmAction.type === 'revokeSessions') revokeSessionsMutation.mutate(user.id);
    if (confirmAction.type === 'revokeApiKeys') revokeApiKeysMutation.mutate(user.id);
    if (confirmAction.type === 'resetUsage') resetUsageMutation.mutate({ userId: user.id });
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onNavigateBack}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          ← Back to Users
        </button>
        <span className="text-slate-600">/</span>
        <span className="text-xs text-slate-400 font-mono">User 360° Profile</span>
      </div>

      {/* Hero User Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-2xl">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              (user.fullName || user.email)[0].toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-slate-100">{user.fullName || 'Unnamed Account'}</h1>
              <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                user.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {user.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">{user.email}</p>
            <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-2">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-indigo-400" /> {user.systemRole}</span>
              <span>•</span>
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {user.status === 'ACTIVE' ? (
            <button
              onClick={() => setConfirmAction({
                type: 'suspend',
                title: 'Suspend Customer Account',
                message: `Are you sure you want to suspend ${user.email}? They will lose access to all API and dashboard services immediately.`,
              })}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Suspend
            </button>
          ) : (
            <button
              onClick={() => setConfirmAction({
                type: 'reactivate',
                title: 'Reactivate Account',
                message: `Reactivate account ${user.email}? Access will be restored immediately.`,
              })}
              className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Reactivate
            </button>
          )}

          <button
            onClick={() => setConfirmAction({
              type: 'revokeSessions',
              title: 'Revoke Active Sessions',
              message: `Force log out ${user.email} from all active web and mobile browser sessions?`,
            })}
            className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Revoke Sessions
          </button>

          <button
            onClick={() => setConfirmAction({
              type: 'revokeApiKeys',
              title: 'Revoke API Keys',
              message: `Deactivate all API keys for ${user.email}? Programmatic API integrations will immediately stop.`,
            })}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <Key className="w-4 h-4 text-amber-400" /> Revoke API Keys
          </button>

          <button
            onClick={() => setConfirmAction({
              type: 'resetUsage',
              title: 'Reset Usage Counters',
              message: `Reset workspace monthly migration & storage usage counters to zero for ${user.email}?`,
            })}
            className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Reset Usage
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Workspaces</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{workspaces.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Active Plan</div>
          <div className="text-xl font-bold text-indigo-400 mt-1 uppercase font-mono">{subscription?.planSlug || 'Free'}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Migrations (Total / Failed)</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">
            {migrationStats.total} <span className="text-xs text-rose-400 font-normal">({migrationStats.failed} failed)</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Lifetime Spend</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
            ₹{payments.reduce((acc: number, p: any) => acc + (p.status === 'captured' ? Number(p.amount) : 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-medium space-x-6">
        {[
          { id: 'workspaces', label: 'Workspaces', icon: Building2 },
          { id: 'billing', label: 'Subscription & Billing', icon: CreditCard },
          { id: 'migrations', label: 'Migration History', icon: Cpu },
          { id: 'security', label: 'Sessions & API Keys', icon: Key },
          { id: 'audit', label: 'Audit Trail', icon: FileText },
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
      {activeTab === 'workspaces' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Workspace</th>
                <th className="p-4">Role</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Storage Used</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {workspaces.map((ws: any) => (
                <tr key={ws.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-semibold text-slate-200">{ws.name} <span className="text-slate-500 text-[10px] font-mono">({ws.slug})</span></td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">{ws.role}</span></td>
                  <td className="p-4 font-mono uppercase text-indigo-400 font-bold">{ws.planId || 'free'}</td>
                  <td className="p-4 font-mono text-slate-400">{(Number(ws.storageUsed || 0) / 1024 / 1024).toFixed(1)} MB</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">{ws.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Active Subscription Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Active Subscription & Snapshot</h3>
            {subscription ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div><span className="text-slate-500 block">Plan:</span> <span className="text-indigo-400 font-bold">{subscription.planName} ({subscription.planSlug})</span></div>
                <div><span className="text-slate-500 block">Billing Cycle:</span> <span className="text-slate-200 capitalize">{subscription.billingCycle}</span></div>
                <div><span className="text-slate-500 block">Status:</span> <span className="text-emerald-400 font-bold uppercase">{subscription.status}</span></div>
                <div><span className="text-slate-500 block">Expires / Renews:</span> <span className="text-slate-300">{new Date(subscription.expiresAt).toLocaleDateString()}</span></div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active paid subscription found. Defaulting to Free Tier.</p>
            )}
          </div>

          {/* Payment History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-xs text-slate-200">Payment & Transaction History</div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Workspace</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-500">No payment records found.</td></tr>
                ) : (
                  payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono text-slate-300">{p.transactionId}</td>
                      <td className="p-4 text-slate-300">{p.workspaceName}</td>
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
        </div>
      )}

      {activeTab === 'migrations' && (
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
                    {m.errorMessage && <p className="text-[10px] text-rose-400 mt-1 font-mono">{m.errorMessage}</p>}
                  </td>
                  <td className="p-4 font-mono text-slate-500">{new Date(m.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Sessions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" /> Active Web & Mobile Sessions
            </h3>
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500">No active browser sessions.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((s: any) => (
                  <div key={s.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-slate-300 font-bold">{s.ipAddress || '127.0.0.1'}</div>
                    <div className="text-slate-500 text-[10px] truncate">{s.userAgent}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Masked API Keys Metadata */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> API Keys Metadata (Masked)
            </h3>
            {apiKeys.length === 0 ? (
              <p className="text-xs text-slate-500">No active API keys found.</p>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((k: any) => (
                  <div key={k.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-mono space-y-1 flex justify-between items-center">
                    <div>
                      <div className="text-slate-200 font-bold">{k.name}</div>
                      <div className="text-indigo-400 text-[11px]">{k.keyPrefix || 'sk_live_****'}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">{k.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="space-y-4">
            {auditLogs.map((log: any, idx: number) => (
              <div key={idx} className="flex items-start space-x-3 text-xs font-mono border-b border-slate-800/60 pb-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><FileText className="w-3.5 h-3.5" /></div>
                <div className="flex-1">
                  <div className="text-slate-200 font-bold">{log.action}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Resource: {log.resourceType} ({log.resourceId})</div>
                </div>
                <div className="text-slate-500 text-[10px]">{new Date(log.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleActionConfirm}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmLabel="Confirm Action"
        isDestructive={confirmAction?.type === 'suspend' || confirmAction?.type?.startsWith('revoke')}
      />
    </div>
  );
};
