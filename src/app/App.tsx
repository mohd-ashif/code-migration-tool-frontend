import { useEffect, useRef, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../shared/components/Sidebar';
import Topbar from '../shared/components/Topbar';
import PageHeader from '../shared/components/PageHeader';
import EmptyState from '../shared/components/EmptyState';
import { Network, Loader2 } from 'lucide-react';

import { useAppDispatch, useAppSelector, RootState } from '../store';
import { setActiveTab } from '../store/slices/uiSlice';
import {
  setCredentials,
  logout,
  setVerificationToken,
  setResetToken,
} from '../store/slices/authSlice';

import UploadCard from '../features/upload/components/UploadCard';
import RecentJobsCard from '../features/jobs/components/RecentJobsCard';
import TargetFrameworks from '../features/migration/components/TargetFrameworks';
import ApiKeys from '../features/migration/components/ApiKeys';
import DependencyGraph from '../features/dependency-graph/components/DependencyGraph';
import JobDetails from '../features/reports/components/JobDetails';
import { CommandPalette } from '../features/command-palette/components/CommandPalette';
import MigrationHistory from '../features/history/components/MigrationHistory';
import ReportsList from '../features/reports/components/ReportsList';

import AuthLayout from '../features/auth/components/AuthLayout';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import ForgotPasswordForm from '../features/auth/components/ForgotPasswordForm';
import ResetPasswordForm from '../features/auth/components/ResetPasswordForm';
import VerifyEmailView from '../features/auth/components/VerifyEmailView';
import apiClient from '../services/http/apiClient';

import { ReduxProvider } from './providers/ReduxProvider';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider, useTheme } from '../lib/ThemeContext';
import { fadeIn, defaultTransition } from '../animations/variants';
import { ToastProvider } from '../shared/components/NotificationToast';
import { useWorkspace } from '../hooks/useWorkspace';

import ShortcutProvider from '../shortcuts/shortcutProvider';
import ShortcutDialog from '../shortcuts/components/keyboard/ShortcutDialog';
import ShortcutContext from '../shortcuts/shortcutContext';
import { useGlobalShortcut } from '../shortcuts/hooks/useGlobalShortcut';

function AppContent() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state: RootState) => state.ui.activeTab);
  const selectedJobId = useAppSelector((state: RootState) => state.workspace.selectedJobId);
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state: RootState) => state.auth.isLoading);
  const authView = useAppSelector((state: RootState) => state.auth.authView);
  const detailsRef = useRef<HTMLDivElement>(null);
  const checkSessionStarted = useRef(false);

  // Load workspace after auth — syncs currentWorkspaceId/Name into Redux
  const { isLoading: workspaceLoading } = useWorkspace();

  const { theme, setTheme } = useTheme();
  const shortcutCtx = useContext(ShortcutContext);
  const isHelpOpen = shortcutCtx?.isHelpOpen || false;
  const setIsHelpOpen = shortcutCtx?.setIsHelpOpen || (() => {});

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Startup: Parse URL query parameters and verify/silent refresh session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const mode = params.get('mode');

    if (token) {
      if (mode === 'reset-password') {
        dispatch(setResetToken(token));
      } else if (mode === 'verify-email') {
        dispatch(setVerificationToken(token));
      }
      // Clean query params from address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (checkSessionStarted.current) return;
    checkSessionStarted.current = true;

    const checkSession = async () => {
      try {
        const response: any = await apiClient.post('/api/auth/refresh');
        const { user, accessToken } = response.data;
        dispatch(setCredentials({ user, accessToken }));
      } catch {
        dispatch(logout());
      }
    };

    checkSession();
  }, [dispatch]);

  useGlobalShortcut('toggle-sidebar', () => setIsSidebarCollapsed((prev: boolean) => !prev));

  // Bind Alt+1..8 to tabs
  useGlobalShortcut('nav-dashboard', () => dispatch(setActiveTab('dashboard')));
  useGlobalShortcut('nav-upload', () => {
    dispatch(setActiveTab('dashboard'));
    setTimeout(() => {
      document.querySelector<HTMLElement>('#upload-card-root')?.focus();
    }, 100);
  });
  useGlobalShortcut('nav-jobs', () => dispatch(setActiveTab('jobs')));
  useGlobalShortcut('nav-job-details', () => dispatch(setActiveTab('jobs')));
  useGlobalShortcut('nav-graph', () => dispatch(setActiveTab('graph')));
  useGlobalShortcut('nav-settings', () => dispatch(setActiveTab('targets')));

  // Bind Theme & Help
  useGlobalShortcut('toggle-theme', () => setTheme(theme === 'dark' ? 'light' : 'dark'));
  useGlobalShortcut('help-dialog', () => setIsHelpOpen(!isHelpOpen));
  useGlobalShortcut('cancel-action', () => {
    if (isHelpOpen) {
      setIsHelpOpen(false);
    }
  });

  // Cross-page Global Actions
  useGlobalShortcut('upload-zip', () => {
    dispatch(setActiveTab('dashboard'));
    setTimeout(() => {
      const fileInput = document.querySelector<HTMLInputElement>('#upload-card-root input[type="file"]');
      if (fileInput) fileInput.click();
    }, 150);
  });

  useGlobalShortcut('start-migration', () => {
    const btn = document.querySelector<HTMLButtonElement>('#upload-card-root button');
    if (btn && !btn.disabled) {
      btn.click();
    }
  });

  useGlobalShortcut('search-files', () => {
    const fileSearch = document.querySelector<HTMLInputElement>('input[placeholder*="Search files"]');
    if (fileSearch) {
      fileSearch.focus();
    } else {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      window.dispatchEvent(event);
    }
  });

  useGlobalShortcut('refresh-jobs', () => {
    const refreshBtn = document.querySelector<HTMLButtonElement>('button[title*="Refresh"]');
    if (refreshBtn) {
      refreshBtn.click();
    }
  });

  // Smooth scroll to details ref when a job is selected or started
  useEffect(() => {
    if (selectedJobId) {
      const timer = setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [selectedJobId]);

  if (isLoading || (isAuthenticated && workspaceLoading)) {
    return (
      <div className="min-h-screen bg-[#0B0B12] text-white flex items-center justify-center flex-col gap-4 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#7C6CFF]" />
        <p className="text-zinc-500 text-sm animate-pulse">
          {isLoading ? 'Initializing workspace session...' : 'Loading your workspace...'}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const getAuthTitle = () => {
      switch (authView) {
        case 'register':
          return 'Create an Account';
        case 'forgot-password':
          return 'Reset Password';
        case 'reset-password':
          return 'Choose New Password';
        case 'verify-email':
          return 'Verify Email';
        default:
          return 'Welcome Back';
      }
    };

    const getAuthSubtitle = () => {
      switch (authView) {
        case 'register':
          return 'Sign up to analyze and compile your codebases';
        case 'forgot-password':
          return 'Enter your email to receive a password reset link';
        case 'reset-password':
          return 'Enter your new password below';
        case 'verify-email':
          return 'Hold on, verifying your credentials';
        default:
          return 'Sign in to access your code migration workspace';
      }
    };

    const renderAuthForm = () => {
      switch (authView) {
        case 'register':
          return <RegisterForm />;
        case 'forgot-password':
          return <ForgotPasswordForm />;
        case 'reset-password':
          return <ResetPasswordForm />;
        case 'verify-email':
          return <VerifyEmailView />;
        default:
          return <LoginForm />;
      }
    };

    return (
      <AuthLayout title={getAuthTitle()} subtitle={getAuthSubtitle()}>
        {renderAuthForm()}
      </AuthLayout>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-start gap-4">
              <PageHeader
                title="Start a Migration"
                subtitle="upload a project, pick a target, let the AST engine handle the rest"
              />
            </div>

            {/* Split cards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <UploadCard />
              </div>
              <div className="lg:col-span-5 flex flex-col">
                <RecentJobsCard />
              </div>
            </div>

            {/* Lower section selected details */}
            <AnimatePresence>
              {selectedJobId && (
                <motion.div
                  key="job-details-wrapper"
                  initial={{ opacity: 0, height: 0, y: 15 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 15 }}
                  transition={defaultTransition}
                  ref={detailsRef}
                  className="pt-2 border-t border-border overflow-hidden"
                >
                  <JobDetails />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'graph':
        if (!selectedJobId) {
          return (
            <div className="py-16 max-w-xl mx-auto">
              <EmptyState
                icon={Network}
                title="No Active Dependency Graph"
                description="Please select a completed migration job from the dashboard or history list to load and inspect its symbol dependency graph."
              >
                <button
                  onClick={() => dispatch(setActiveTab('dashboard'))}
                  className="px-4 py-2 bg-primary hover:bg-[#8D7EFF] text-white text-xs font-semibold rounded-xl transition-all shadow-glow active:scale-[0.98]"
                >
                  Return to Dashboard
                </button>
              </EmptyState>
            </div>
          );
        }
        return <DependencyGraph />;

      case 'jobs':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <RecentJobsCard />
            </div>
            <div className="lg:col-span-7">
              <JobDetails />
            </div>
          </div>
        );

      case 'targets':
        return <TargetFrameworks />;

      case 'apiKeys':
        return <ApiKeys />;

      case 'history':
        return <MigrationHistory />;

      case 'reports':
        return <ReportsList />;

      case 'billing':
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-4 bg-zinc-800/50 rounded-2xl mb-4">
              <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Billing & Subscription</h3>
            <p className="text-zinc-500 text-xs max-w-xs">Billing management is coming soon. You're currently on the Free plan with 100 migrations per month.</p>
          </div>
        );

      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-4 bg-zinc-800/50 rounded-2xl mb-4">
              <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Settings</h3>
            <p className="text-zinc-500 text-xs max-w-xs">Account and workspace settings are coming soon.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation Left Panel */}
      <Sidebar collapsed={isSidebarCollapsed} />

      {/* Main workspace frame right panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.15 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Keyboard-navigable Command Palette (Ctrl + K) */}
      <CommandPalette />

      {/* Keyboard Shortcuts Reference Dialog (F1) */}
      <ShortcutDialog />
    </div>
  );
}

export default function App() {
  return (
    <ReduxProvider>
      <QueryProvider>
        <ThemeProvider>
          <ShortcutProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </ShortcutProvider>
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
