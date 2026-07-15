import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../shared/components/Sidebar';
import Topbar from '../shared/components/Topbar';
import PageHeader from '../shared/components/PageHeader';
import EmptyState from '../shared/components/EmptyState';
import { Network } from 'lucide-react';

import { useAppDispatch, useAppSelector, RootState } from '../store';
import { setActiveTab } from '../store/slices/uiSlice';

import UploadCard from '../features/upload/components/UploadCard';
import RecentJobsCard from '../features/jobs/components/RecentJobsCard';
import TargetFrameworks from '../features/migration/components/TargetFrameworks';
import ApiKeys from '../features/migration/components/ApiKeys';
import DependencyGraph from '../features/dependency-graph/components/DependencyGraph';
import JobDetails from '../features/reports/components/JobDetails';
import { CommandPalette } from '../features/command-palette/components/CommandPalette';

import { ReduxProvider } from './providers/ReduxProvider';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from '../lib/ThemeContext';
import { fadeIn, defaultTransition } from '../animations/variants';

function AppContent() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state: RootState) => state.ui.activeTab);
  const selectedJobId = useAppSelector((state: RootState) => state.workspace.selectedJobId);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to details ref when a job is selected or started
  useEffect(() => {
    if (selectedJobId) {
      const timer = setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [selectedJobId]);

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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation Left Panel */}
      <Sidebar />

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
    </div>
  );
}

export default function App() {
  return (
    <ReduxProvider>
      <QueryProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
