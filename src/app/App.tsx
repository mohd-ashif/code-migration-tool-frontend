import { lazy, Suspense, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../shared/components/Sidebar';
import Topbar from '../shared/components/Topbar';
import PageHeader from '../shared/components/PageHeader';
import EmptyState from '../shared/components/EmptyState';
import { Network, Loader2, FileCode2, WifiOff } from 'lucide-react';

import { useAppDispatch, useAppSelector, RootState } from '../store';
import { setActiveTab, toggleSidebar } from '../store/slices/uiSlice';
import {
  setCredentials,
  logout,
  setVerificationToken,
  setResetToken,
  setMagicToken,
  setInviteToken,
} from '../store/slices/authSlice';

// ── Eagerly loaded (above-the-fold, always needed) ──
import UploadCard from '../features/upload/components/UploadCard';
import RecentJobsCard from '../features/jobs/components/RecentJobsCard';
import TargetFrameworks from '../features/migration/components/TargetFrameworks';
import ApiKeys from '../features/migration/components/ApiKeys';
import { CommandPalette } from '../features/command-palette/components/CommandPalette';

// ── Lazily loaded (route-level splits → separate chunks) ──────────────────────
const DependencyGraph  = lazy(() => import('../features/dependency-graph/components/DependencyGraph'));
const JobDetails       = lazy(() => import('../features/reports/components/JobDetails'));
const MigrationHistory = lazy(() => import('../features/history/components/MigrationHistory'));
const ReportsList      = lazy(() => import('../features/reports/components/ReportsList'));
const BillingView      = lazy(() => import('../features/billing/components/BillingView'));

import AuthLayout from '../features/auth/components/AuthLayout';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import ForgotPasswordForm from '../features/auth/components/ForgotPasswordForm';
import ResetPasswordForm from '../features/auth/components/ResetPasswordForm';
import VerifyEmailView from '../features/auth/components/VerifyEmailView';
import MagicLinkView from '../features/auth/components/MagicLinkView';
import AcceptInviteView from '../features/auth/components/AcceptInviteView';
import SettingsView from '../features/auth/components/SettingsView';
import apiClient from '../services/http/apiClient';

import { ReduxProvider } from './providers/ReduxProvider';
import { QueryProvider, queryClient } from './providers/QueryProvider';
import { ErrorBoundary } from './providers/ErrorBoundary';
import { ThemeProvider, useTheme } from '../lib/ThemeContext';
import { fadeIn, defaultTransition } from '../animations/variants';
import { ToastProvider } from '../components/common/Toast';
import { useWorkspace } from '../hooks/useWorkspace';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useOffline } from '../hooks/useOffline';

import ShortcutProvider from '../shortcuts/shortcutProvider';
import ShortcutDialog from '../shortcuts/components/keyboard/ShortcutDialog';
import ShortcutContext from '../shortcuts/shortcutContext';
import { useGlobalShortcut } from '../shortcuts/hooks/useGlobalShortcut';

import { initPerformanceMonitor } from '../utils/performanceMonitor';
import { logger } from '../utils/logger';

// ── Lazy fallback skeleton ────────────────────────────────────────────────────
function TabSkeleton() {
  return (
    <div className="flex items-center justify-center py-32 w-full">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
        <span className="text-xs font-mono text-zinc-500 tracking-wide animate-pulse">
          Loading module…
        </span>
      </div>
    </div>
  );
}

// ── Offline banner ────────────────────────────────────────────────────────────
function OfflineBanner() {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full z-[9998] flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold font-mono tracking-wide"
      style={{
        background: 'linear-gradient(90deg, rgba(248,113,113,0.12) 0%, rgba(251,146,60,0.12) 100%)',
        borderBottom: '1px solid rgba(248,113,113,0.2)',
        backdropFilter: 'blur(8px)',
        color: '#FCA5A5',
      }}
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      You are currently offline — uploads and migrations are disabled.
    </motion.div>
  );
}

// ── Main app content ──────────────────────────────────────────────────────────
function AppContent() {
  const dispatch = useAppDispatch();
  const activeTab       = useAppSelector((state: RootState) => state.ui.activeTab);
  const selectedJobId   = useAppSelector((state: RootState) => state.workspace.selectedJobId);
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const isInitializing  = useAppSelector((state: RootState) => state.auth.isInitializing);
  const authView        = useAppSelector((state: RootState) => state.auth.authView);
  const isOffline       = useAppSelector((state: RootState) => state.ui.isOffline);
  const inviteToken     = useAppSelector((state: RootState) => state.auth.inviteToken);

  const detailsRef          = useRef<HTMLDivElement>(null);
  const checkSessionStarted = useRef(false);

  // Observability
  useOffline();   // Subscribe to network events → Redux + toasts

  const currentUserQuery              = useCurrentUser();
  const { isLoading: workspaceLoading } = useWorkspace();

  const { theme, setTheme } = useTheme();
  const shortcutCtx  = useContext(ShortcutContext);
  const isHelpOpen   = shortcutCtx?.isHelpOpen   || false;
  const setIsHelpOpen = shortcutCtx?.setIsHelpOpen || (() => {});

  // Combined loading gate — prevents UI flicker on refresh
  const isAuthLoading = isInitializing || (isAuthenticated && currentUserQuery.isLoading);
  const isAppLoading  = isAuthLoading  || (isAuthenticated && workspaceLoading);

  // Startup: parse URL tokens + silent session refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const mode   = params.get('mode');

    if (token) {
      if (mode === 'reset-password')  dispatch(setResetToken(token));
      else if (mode === 'verify-email') dispatch(setVerificationToken(token));
      else if (mode === 'magic-link') dispatch(setMagicToken(token));
      else if (mode === 'accept-invite') dispatch(setInviteToken(token));
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (checkSessionStarted.current) return;
    checkSessionStarted.current = true;

    const checkSession = async () => {
      try {
        const response: any = await apiClient.post('/api/auth/refresh');
        const { user, accessToken } = response.data;
        try { queryClient.setQueryData(['currentUser'], user); }
        catch (err) { logger.error('Failed to seed query cache on startup', err); }
        dispatch(setCredentials({ user, accessToken }));
        logger.info('[Auth] Session restored from refresh token.');
      } catch {
        dispatch(logout());
      }
    };

    checkSession();
  }, [dispatch]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useGlobalShortcut('toggle-sidebar', () => dispatch(toggleSidebar()));
  useGlobalShortcut('nav-dashboard',  () => dispatch(setActiveTab('dashboard')));
  useGlobalShortcut('nav-upload', () => {
    dispatch(setActiveTab('dashboard'));
    setTimeout(() => {
      document.querySelector<HTMLElement>('#upload-card-root')?.focus();
    }, 100);
  });
  useGlobalShortcut('nav-jobs',       () => dispatch(setActiveTab('jobs')));
  useGlobalShortcut('nav-job-details',() => dispatch(setActiveTab('jobs')));
  useGlobalShortcut('nav-graph',      () => dispatch(setActiveTab('graph')));
  useGlobalShortcut('nav-settings',   () => dispatch(setActiveTab('targets')));
  useGlobalShortcut('toggle-theme',   () => setTheme(theme === 'dark' ? 'light' : 'dark'));
  useGlobalShortcut('help-dialog',    () => setIsHelpOpen(!isHelpOpen));
  useGlobalShortcut('cancel-action',  () => { if (isHelpOpen) setIsHelpOpen(false); });
  useGlobalShortcut('upload-zip', () => {
    dispatch(setActiveTab('dashboard'));
    setTimeout(() => {
      const fileInput = document.querySelector<HTMLInputElement>('#upload-card-root input[type="file"]');
      if (fileInput) fileInput.click();
    }, 150);
  });
  useGlobalShortcut('start-migration', () => {
    const btn = document.querySelector<HTMLButtonElement>('#upload-card-root button');
    if (btn && !btn.disabled) btn.click();
  });
  useGlobalShortcut('search-files', () => {
    const fs = document.querySelector<HTMLInputElement>('input[placeholder*="Search files"]');
    if (fs) fs.focus();
    else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  });
  useGlobalShortcut('refresh-jobs', () => {
    document.querySelector<HTMLButtonElement>('button[title*="Refresh"]')?.click();
  });

  // Smooth scroll to job details when a job is selected
  useEffect(() => {
    if (selectedJobId) {
      const timer = setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [selectedJobId]);

  // ── Loading splash ────────────────────────────────────────────────────────

  if (isAppLoading) {
    const loadingText = isAuthLoading ? 'Restoring Session…' : 'Loading your workspace…';
    return (
      <div className="min-h-screen bg-[#07070C] text-white flex items-center justify-center flex-col gap-6 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#A68CFF]/5 rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          animate={{ scale: [1, 1.04, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="p-5 bg-gradient-to-br from-primary to-[#A68CFF] text-white rounded-3xl shadow-glow relative z-10"
        >
          <FileCode2 className="w-10 h-10" />
        </motion.div>

        <div className="space-y-3 text-center relative z-10">
          <h2 className="text-sm font-bold tracking-wider uppercase text-zinc-400 font-mono">
            Migration Studio
          </h2>
          <p className="text-zinc-500 text-xs font-semibold tracking-wide animate-pulse">
            {loadingText}
          </p>
          <div className="w-48 h-1 bg-[#1E1F35] rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-[#A68CFF] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Workspace Invitation Intercept ─────────────────────────────────────────

  if (authView === 'accept-invite' && inviteToken) {
    return (
      <AuthLayout title="Join Workspace" subtitle="Hold on, accepting your invitation">
        <AcceptInviteView />
      </AuthLayout>
    );
  }

  // ── Auth screens ──────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    const getAuthTitle = () => {
      switch (authView) {
        case 'register':         return 'Create an Account';
        case 'forgot-password':  return 'Reset Password';
        case 'reset-password':   return 'Choose New Password';
        case 'verify-email':     return 'Verify Email';
        case 'magic-link':       return 'Logging in...';
        case 'accept-invite':    return 'Join Workspace';
        default:                 return 'Welcome Back';
      }
    };
    const getAuthSubtitle = () => {
      switch (authView) {
        case 'register':         return 'Sign up to analyze and compile your codebases';
        case 'forgot-password':  return 'Enter your email to receive a password reset link';
        case 'reset-password':   return 'Enter your new password below';
        case 'verify-email':     return 'Hold on, verifying your credentials';
        case 'magic-link':       return 'Hold on, authenticating your credentials';
        case 'accept-invite':    return 'Hold on, accepting your invitation';
        default:                 return 'Sign in to access your code migration workspace';
      }
    };
    const renderAuthForm = () => {
      switch (authView) {
        case 'register':        return <RegisterForm />;
        case 'forgot-password': return <ForgotPasswordForm />;
        case 'reset-password':  return <ResetPasswordForm />;
        case 'verify-email':    return <VerifyEmailView />;
        case 'magic-link':      return <MagicLinkView />;
        case 'accept-invite':    return <AcceptInviteView />;
        default:                return <LoginForm />;
      }
    };
    return (
      <AuthLayout title={getAuthTitle()} subtitle={getAuthSubtitle()}>
        {renderAuthForm()}
      </AuthLayout>
    );
  }

  // ── Tab content ───────────────────────────────────────────────────────────

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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <UploadCard disabled={isOffline} />
              </div>
              <div className="lg:col-span-5 flex flex-col">
                <RecentJobsCard />
              </div>
            </div>

            <AnimatePresence>
              {selectedJobId && (
                <motion.div
                  key="job-details-wrapper"
                  initial={{ opacity: 0, height: 0, y: 15 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 15 }}
                  transition={defaultTransition}
                  ref={detailsRef}
                  className="pt-2 border-t border-border overflow-hidden"
                >
                  <Suspense fallback={<TabSkeleton />}>
                    <JobDetails />
                  </Suspense>
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
        return (
          <Suspense fallback={<TabSkeleton />}>
            <DependencyGraph />
          </Suspense>
        );

      case 'jobs':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <RecentJobsCard />
            </div>
            <div className="lg:col-span-7">
              <Suspense fallback={<TabSkeleton />}>
                <JobDetails />
              </Suspense>
            </div>
          </div>
        );

      case 'targets':
        return <TargetFrameworks />;

      case 'apiKeys':
        return <ApiKeys />;

      case 'history':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <MigrationHistory />
          </Suspense>
        );

      case 'reports':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <ReportsList />
          </Suspense>
        );

      case 'billing':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <BillingView />
          </Suspense>
        );

      case 'settings':
        return <SettingsView />;

      default:
        return null;
    }
  };

  // ── Authenticated layout ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Offline banner */}
      <AnimatePresence>
        {isOffline && <OfflineBanner />}
      </AnimatePresence>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Main workspace */}
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

        {/* Command Palette */}
        <CommandPalette />

        {/* Keyboard Shortcuts Dialog */}
        <ShortcutDialog />
      </div>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function App() {
  // Initialise performance monitoring once at root, outside React render tree
  useEffect(() => {
    initPerformanceMonitor();
    logger.info('[App] Migration Studio initialised.');
  }, []);

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
