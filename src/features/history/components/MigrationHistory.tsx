import { useState } from 'react';
import { History, Search, Download, RefreshCw, Trash2, CheckCircle2, AlertTriangle, Clock, XCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMigrationHistory } from '../../../hooks/useMigrationHistory';
import { useAppDispatch } from '../../../store';
import { setSelectedJobId } from '../../../store/slices/workspaceSlice';
import { setActiveTab } from '../../../store/slices/uiSlice';
import { JobRecord } from '../../../shared/types/api.types';
import Card from '../../../shared/components/Card';
import { staggerContainer, slideUp } from '../../../animations/variants';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import apiClient from '../../../services/http/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../shared/components/NotificationToast';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';

const PAGE_SIZE = 15;

const STATUS_COLORS: Record<string, { dot: string; badge: string }> = {
  completed: { dot: 'bg-emerald-400', badge: 'success' },
  failed: { dot: 'bg-rose-400', badge: 'destructive' },
  cancelled: { dot: 'bg-zinc-500', badge: 'muted' },
  pending: { dot: 'bg-amber-400 animate-pulse', badge: 'warning' },
  processing: { dot: 'bg-blue-400 animate-pulse', badge: 'info' },
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
  if (status === 'failed') return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
  if (status === 'cancelled') return <XCircle className="w-3.5 h-3.5 text-zinc-500" />;
  return <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getFrameworkLabel(fw?: string | null) {
  if (!fw) return '—';
  const map: Record<string, string> = {
    react: 'React',
    vue: 'Vue',
    angular: 'Angular',
    svelte: 'Svelte',
    next: 'Next.js',
    nuxt: 'Nuxt',
  };
  return map[fw.toLowerCase()] ?? fw;
}

export default function MigrationHistory() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const isReduced = useReducedMotion();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  const { jobs, isLoading, refetch } = useMigrationHistory({
    search,
    status: statusFilter,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const handleViewJob = (job: JobRecord) => {
    dispatch(setSelectedJobId(job.id));
    dispatch(setActiveTab('jobs'));
  };

  const handleRetry = (_job: JobRecord) => {
    dispatch(setSelectedJobId(null));
    dispatch(setActiveTab('dashboard'));
    // Scroll to upload
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>('[data-upload-zone]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  const handleDelete = (jobId: string) => {
    setDeleteJobId(jobId);
  };

  const confirmDelete = async () => {
    if (!deleteJobId) return;
    try {
      await apiClient.delete(`/api/history/${deleteJobId}`);
      queryClient.invalidateQueries({ queryKey: ['migrationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
      toast.warning('Migration job has been deleted.');
    } catch {
      toast.error('Failed to delete migration job.');
    } finally {
      setDeleteJobId(null);
    }
  };

  const hasPrev = page > 0;
  const hasNext = jobs.length === PAGE_SIZE;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-none">Migration History</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Your complete workspace migration log</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-3 py-2 bg-[#12131F] border border-[#1E1F35] rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="pl-9 pr-6 py-2 bg-[#12131F] border border-[#1E1F35] rounded-xl text-xs text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-zinc-800/50 rounded-2xl mb-4">
              <History className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-white font-semibold mb-1">No migration jobs yet</h3>
            <p className="text-zinc-500 text-xs mb-4 max-w-xs">
              {search || statusFilter
                ? 'No jobs match your current filters. Try adjusting your search.'
                : 'Upload your first project to get started.'}
            </p>
            {!search && !statusFilter && (
              <button
                onClick={() => dispatch(setActiveTab('dashboard'))}
                className="px-4 py-2 text-xs font-semibold bg-primary/90 hover:bg-primary text-white rounded-xl transition-all"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={isReduced ? {} : staggerContainer}
            initial="hidden"
            animate="show"
          >
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_120px_120px_100px_100px_auto] gap-4 px-4 py-2.5 border-b border-[#1E1F35] text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <span>Job ID</span>
              <span>Source</span>
              <span>Target</span>
              <span>Status</span>
              <span>Created</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Table Rows */}
            <AnimatePresence>
              {jobs.map((job) => {
                const source = job.request?.sourceFramework ?? job.result?.sourceFramework;
                const target = job.request?.targetFramework ?? job.result?.targetFramework;
                const statusColor = STATUS_COLORS[job.status] ?? STATUS_COLORS['pending'];

                return (
                  <motion.div
                    key={job.id}
                    variants={isReduced ? {} : slideUp}
                    className="grid grid-cols-[1fr_120px_120px_100px_100px_auto] gap-4 px-4 py-3.5 border-b border-[#1E1F35]/50 hover:bg-white/[0.02] transition-colors group items-center"
                  >
                    {/* Job ID */}
                    <button
                      onClick={() => handleViewJob(job)}
                      className="text-left font-mono text-[11px] text-zinc-300 hover:text-primary transition-colors truncate"
                      title={job.id}
                    >
                      {job.id.slice(0, 8)}…
                    </button>

                    {/* Source */}
                    <span className="text-xs text-zinc-400 truncate">
                      {getFrameworkLabel(source)}
                    </span>

                    {/* Target */}
                    <span className="text-xs text-zinc-300 truncate">
                      {getFrameworkLabel(target)}
                    </span>

                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor.dot}`} />
                      <StatusIcon status={job.status} />
                      <span className="text-[11px] text-zinc-300 capitalize">{job.status}</span>
                    </div>

                    {/* Date */}
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {formatDate(job.created_at)}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 justify-end">
                      {job.status === 'completed' && (
                        <a
                          href={`/api/download?jobId=${job.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-zinc-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {(job.status === 'failed' || job.status === 'cancelled') && (
                        <button
                          onClick={() => handleRetry(job)}
                          className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all"
                          title="Retry"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </Card>

      {/* Pagination */}
      {(hasPrev || hasNext) && (
        <div className="flex justify-center gap-3">
          <button
            disabled={!hasPrev}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs text-zinc-500 font-mono">Page {page + 1}</span>
          <button
            disabled={!hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Reusable premium Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteJobId !== null}
        title="Delete Migration Job"
        message="Are you sure you want to delete this migration job? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onClose={() => setDeleteJobId(null)}
      />
    </div>
  );
}
