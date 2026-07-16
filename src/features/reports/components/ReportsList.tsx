import { FileText, Download, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecentJobs } from '../../jobs/hooks/useRecentJobs';
import { useAppDispatch } from '../../../store';
import { setSelectedJobId } from '../../../store/slices/workspaceSlice';
import { setActiveTab } from '../../../store/slices/uiSlice';
import Card from '../../../shared/components/Card';
import { staggerContainer, slideUp } from '../../../animations/variants';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

export default function ReportsList() {
  const dispatch = useAppDispatch();
  const isReduced = useReducedMotion();
  const { jobs, isLoading } = useRecentJobs();

  // Reports are jobs with a completed status that have results
  const reports = jobs.filter((j: any) => j.status === 'completed' && j.result);

  const handleView = (jobId: string) => {
    dispatch(setSelectedJobId(jobId));
    dispatch(setActiveTab('dashboard'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg leading-none">Reports</h2>
          <p className="text-zinc-500 text-xs mt-0.5">AI-generated migration analysis reports for your workspace</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-zinc-800/50 rounded-2xl mb-4">
              <FileText className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-white font-semibold mb-1">No reports available</h3>
            <p className="text-zinc-500 text-xs mb-4 max-w-xs">
              Reports are generated automatically when a migration completes successfully.
            </p>
            <button
              onClick={() => dispatch(setActiveTab('dashboard'))}
              className="px-4 py-2 text-xs font-semibold bg-primary/90 hover:bg-primary text-white rounded-xl transition-all"
            >
              Start a Migration
            </button>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_140px_140px_auto] gap-4 px-4 py-2.5 border-b border-[#1E1F35] text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <span>Job ID</span>
              <span>Framework</span>
              <span>Files</span>
              <span className="text-right">Actions</span>
            </div>

            <motion.div
              variants={isReduced ? {} : staggerContainer}
              initial="hidden"
              animate="show"
            >
              {reports.map((job: any) => (
                <motion.div
                  key={job.id}
                  variants={isReduced ? {} : slideUp}
                  className="grid grid-cols-[1fr_140px_140px_auto] gap-4 px-4 py-3.5 border-b border-[#1E1F35]/50 hover:bg-white/[0.02] transition-colors group items-center"
                >
                  {/* Job ID */}
                  <button
                    onClick={() => handleView(job.id)}
                    className="text-left font-mono text-[11px] text-zinc-300 hover:text-primary transition-colors truncate"
                    title={job.id}
                  >
                    {job.id.slice(0, 8)}…
                  </button>

                  {/* Framework */}
                  <span className="text-xs text-zinc-300">
                    {job.result?.targetFramework ?? '—'}
                  </span>

                  {/* File Count */}
                  <span className="text-xs text-zinc-400 font-mono">
                    {job.result?.migratedFiles?.length ?? 0} files
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => handleView(job.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      title="View Report"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <a
                      href={`/api/download?jobId=${job.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      title="Download ZIP"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </Card>
    </div>
  );
}
