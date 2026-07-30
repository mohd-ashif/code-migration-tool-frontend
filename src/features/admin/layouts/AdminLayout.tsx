import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Receipt,
  Cpu,
  Activity,
  FileText,
  Terminal,
  BarChart3,
  Flag,
  ShieldCheck,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { useAppSelector } from '../../../store';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { AdminWorkspacesPage } from '../pages/AdminWorkspacesPage';
import { AdminSubscriptionsPage } from '../pages/AdminSubscriptionsPage';
import { AdminPaymentsPage } from '../pages/AdminPaymentsPage';
import { AdminJobsPage } from '../pages/AdminJobsPage';
import { AdminCompilerHealthPage } from '../pages/AdminCompilerHealthPage';
import { AdminReportsPage } from '../pages/AdminReportsPage';
import { AdminLogsPage } from '../pages/AdminLogsPage';
import { AdminAnalyticsPage } from '../pages/AdminAnalyticsPage';
import { AdminFeatureFlagsPage } from '../pages/AdminFeatureFlagsPage';
import { AdminAuditLogsPage } from '../pages/AdminAuditLogsPage';

import { AdminPlansPage } from '../pages/AdminPlansPage';
import { AdminUser360Page } from '../pages/AdminUser360Page';
import { AdminWorkspace360Page } from '../pages/AdminWorkspace360Page';
import { AdminUsagePage } from '../pages/AdminUsagePage';
import { AdminAiUsagePage } from '../pages/AdminAiUsagePage';
import { AdminMigrationQualityPage } from '../pages/AdminMigrationQualityPage';
import { AdminFailuresPage } from '../pages/AdminFailuresPage';
import { AdminBillingOpsPage } from '../pages/AdminBillingOpsPage';

export const AdminLayout: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const currentWorkspaceRole = useAppSelector((state) => state.workspace.currentWorkspaceRole);
  const isAdmin = currentWorkspaceRole === 'owner' || currentWorkspaceRole === 'admin';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07070C] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl mb-5 max-w-md shadow-glow-sm">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-100">Access Denied</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            You do not have Administrator permissions for this workspace. Only Workspace Owners and Admins can access administrative controls.
          </p>
        </div>
        <button
          onClick={() => {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new Event('popstate'));
          }}
          className="px-5 py-2.5 bg-primary hover:bg-primary/80 text-white font-semibold text-xs rounded-xl shadow-glow transition-all cursor-pointer"
        >
          Return to Workspace Dashboard
        </button>
      </div>
    );
  }

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setMobileOpen(false);
    window.dispatchEvent(new Event('popstate'));
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Workspaces', path: '/admin/workspaces', icon: Building2 },
    { label: 'Subscription Plans', path: '/admin/plans', icon: CreditCard },
    { label: 'Billing Operations', path: '/admin/billing', icon: Receipt },
    { label: 'Usage & Quotas', path: '/admin/usage', icon: Activity },
    { label: 'AI Cost Center', path: '/admin/ai-usage', icon: BarChart3 },
    { label: 'Migration Quality', path: '/admin/migration-quality', icon: Cpu },
    { label: 'Failed Migrations', path: '/admin/failures', icon: Flag },
    { label: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
    { label: 'Payments', path: '/admin/payments', icon: Receipt },
    { label: 'Migration Jobs', path: '/admin/jobs', icon: Cpu },
    { label: 'Compiler Health', path: '/admin/compiler-health', icon: Activity },
    { label: 'Reports', path: '/admin/reports', icon: FileText },
    { label: 'Logs', path: '/admin/logs', icon: Terminal },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Feature Flags', path: '/admin/feature-flags', icon: Flag },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: ShieldCheck },
  ];

  const systemRole = (user as any)?.systemRole || (user as any)?.system_role || 'SUPER_ADMIN';

  const renderActiveModule = () => {
    if (currentPath.startsWith('/admin/users/')) {
      const targetUserId = currentPath.replace('/admin/users/', '');
      if (targetUserId) {
        return <AdminUser360Page userId={targetUserId} onNavigateBack={() => navigate('/admin/users')} />;
      }
    }

    if (currentPath.startsWith('/admin/workspaces/')) {
      const targetWsId = currentPath.replace('/admin/workspaces/', '');
      if (targetWsId) {
        return <AdminWorkspace360Page workspaceId={targetWsId} onNavigateBack={() => navigate('/admin/workspaces')} />;
      }
    }

    switch (currentPath) {
      case '/admin/users':
        return <AdminUsersPage />;
      case '/admin/workspaces':
        return <AdminWorkspacesPage />;
      case '/admin/plans':
        return <AdminPlansPage />;
      case '/admin/billing':
        return <AdminBillingOpsPage />;
      case '/admin/usage':
        return <AdminUsagePage />;
      case '/admin/ai-usage':
        return <AdminAiUsagePage />;
      case '/admin/migration-quality':
        return <AdminMigrationQualityPage />;
      case '/admin/failures':
        return <AdminFailuresPage />;
      case '/admin/subscriptions':
        return <AdminSubscriptionsPage />;
      case '/admin/payments':
        return <AdminPaymentsPage />;
      case '/admin/jobs':
        return <AdminJobsPage />;
      case '/admin/compiler-health':
        return <AdminCompilerHealthPage />;
      case '/admin/reports':
        return <AdminReportsPage />;
      case '/admin/logs':
        return <AdminLogsPage />;
      case '/admin/analytics':
        return <AdminAnalyticsPage />;
      case '/admin/feature-flags':
        return <AdminFeatureFlagsPage />;
      case '/admin/audit-logs':
        return <AdminAuditLogsPage />;
      default:
        return <AdminDashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-indigo-400 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Migration Studio</span>
          </a>

          <span className="text-slate-700">|</span>

          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-slate-100 text-sm md:text-base">Admin Panel</span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {systemRole}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-slate-200">{user?.email || 'admin@studio.internal'}</div>
            <div className="text-[10px] text-slate-400">Platform Administrator</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-200 ease-in-out
            ${mobileOpen ? 'translate-x-0 top-16' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="p-4 uppercase text-[10px] font-semibold tracking-wider text-slate-500">
            Administration Modules
          </div>
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = item.exact
                ? currentPath === item.path
                : currentPath.startsWith(item.path);
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left
                    ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};
