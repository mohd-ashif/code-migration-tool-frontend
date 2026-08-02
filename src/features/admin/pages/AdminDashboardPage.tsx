import {
  useAdminDashboard
} from '../hooks/useAdmin';
import {
  Users,
  Building2,
  CreditCard,
  Cpu,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export const AdminDashboardPage: React.FC = () => {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-28 bg-slate-900 rounded-xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-950/30 border border-red-800 rounded-xl text-red-400 flex items-center space-x-3">
        <AlertTriangle className="w-6 h-6 flex-shrink-0" />
        <div>
          <div className="font-semibold">Failed to load Admin Dashboard telemetry</div>
          <div className="text-xs opacity-80">Check server connectivity or admin authorization headers.</div>
        </div>
      </div>
    );
  }

  const { stats, recent } = data;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, sub: `${stats.activeUsers} active`, icon: Users, color: 'text-blue-400' },
    { label: 'Workspaces', value: stats.totalWorkspaces, sub: 'Active tenants', icon: Building2, color: 'text-indigo-400' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, sub: 'Paid plans', icon: CreditCard, color: 'text-emerald-400' },
    { label: 'Total Jobs', value: stats.totalJobs, sub: 'Processed', icon: Cpu, color: 'text-purple-400' },
    { label: 'Completed Jobs', value: stats.completedJobs, sub: '100% success', icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Failed Jobs', value: stats.failedJobs, sub: 'Terminal errors', icon: XCircle, color: 'text-red-400' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, sub: `${stats.failedPayments} payment fails`, icon: IndianRupee, color: 'text-amber-400' },
    { label: 'Queue Waiting', value: stats.queueHealth?.waiting ?? 0, sub: `${stats.queueHealth?.active ?? 0} active workers`, icon: Activity, color: 'text-cyan-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Platform Admin Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time platform metrics, queue health, and recent operations.</p>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{c.label}</span>
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-100">{c.value}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{c.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Migrations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">Recent Migration Jobs</h2>
          <div className="space-y-2">
            {recent.migrations.map((m: any) => (
              <div key={m.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/50 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-slate-200">{m.projectName || m.id.substring(0, 8)}</div>
                  <div className="text-[10px] text-slate-400">{m.sourceFramework} → {m.targetFramework}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  m.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                  m.status === 'FAILED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">Recent Transactions</h2>
          <div className="space-y-2">
            {recent.payments.map((p: any) => (
              <div key={p.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/50 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-slate-200">₹{p.amount} ({p.currency})</div>
                  <div className="text-[10px] text-slate-400">{p.userEmail || 'Anonymous'}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  p.status === 'captured' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent User Signups */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">Recent Signups</h2>
          <div className="space-y-2">
            {recent.signups.map((u: any) => (
              <div key={u.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/50 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-slate-200">{u.fullName || u.email}</div>
                  <div className="text-[10px] text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                  New User
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
