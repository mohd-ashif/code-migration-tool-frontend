import { memo } from 'react';
import { Activity, Download, ArrowRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDownloadUrl } from '../api';
import { useRecentJobs } from '../hooks/useRecentJobs';
import { useAppDispatch, useAppSelector, RootState } from '../../../store';
import { setSelectedJobId } from '../../../store/slices/workspaceSlice';
import { JobRecord } from '../../../shared/types/api.types';
import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';
import { staggerContainer, slideUp, springTransition } from '../../../animations/variants';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

const RecentJobsCard = memo(function RecentJobsCard() {
  const dispatch = useAppDispatch();
  const selectedJobId = useAppSelector((state: RootState) => state.workspace.selectedJobId);
  const { jobs, isLoading } = useRecentJobs();
  const isReduced = useReducedMotion();

  const getIconForStatus = (status: string) => {
    const baseStyle = "w-4 h-4";
    if (status === 'completed') {
      return (
        <div className="p-2 bg-success/10 text-success rounded-xl border border-success/20">
          <CheckCircle2 className={baseStyle} />
        </div>
      );
    }
    if (status === 'failed') {
      return (
        <div className="p-2 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
          <AlertTriangle className={baseStyle} />
        </div>
      );
    }
    return (
      <div className="p-2 bg-warning/10 text-warning rounded-xl border border-warning/20 animate-pulse">
        <Clock className={baseStyle} />
      </div>
    );
  };

  return (
    <Card className="flex flex-col flex-1 h-[460px]">
      <div className="flex items-center gap-2 mb-1.5 select-none">
        <Activity className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Recent Jobs</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-6 select-none">Last transformations run on this workspace.</p>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center select-none text-muted-foreground animate-pulse">
          <Activity className="w-8 h-8 mb-2 text-muted-foreground animate-pulse" />
          <p className="text-xs font-semibold text-muted-foreground">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center select-none text-muted-foreground">
          <Activity className="w-8 h-8 mb-2 text-muted-foreground" />
          <p className="text-xs font-semibold text-muted-foreground">No migrations found</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Start one using the migration panel.</p>
        </div>
      ) : (
        <div className="flex-1 pr-1 overflow-y-auto max-h-[330px] scrollbar animate-fadeIn">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="divide-y divide-border space-y-2"
          >
            <AnimatePresence mode="popLayout">
              {jobs.map((job: JobRecord) => {
                const isSelected = selectedJobId === job.id;
                return (
                  <motion.div
                    layout={isReduced ? "position" : true}
                    key={job.id}
                    variants={slideUp}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={springTransition}
                    whileHover={isReduced ? {} : { scale: 1.015, y: -1, zIndex: 10 }}
                    whileTap={isReduced ? {} : { scale: 0.985 }}
                    onClick={() => dispatch(setSelectedJobId(job.id))}
                    className={`py-3 px-2.5 flex justify-between items-center group transition-all duration-200 rounded-xl cursor-pointer border ${
                      isSelected
                        ? 'bg-primary/5 border-primary/45 shadow-glow'
                        : 'bg-card/25 border-border hover:bg-accent/40'
                    }`}
                  >
                    {/* Left side details */}
                    <div className="flex items-center gap-3 w-3/5">
                      {getIconForStatus(job.status)}
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-xs text-foreground font-bold block truncate" title={job.id}>
                          {job.id}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono mt-1 flex items-center gap-1.5">
                          <span>target: <strong className="text-foreground font-bold">{job.result?.targetFramework || 'N/A'}</strong></span>
                          {job.result?.metadata?.fileCount !== undefined && (
                            <>
                              <span>•</span>
                              <span>{job.result.metadata.fileCount} files</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Right side status and download */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge status={job.status} />
                      
                      {job.status === 'completed' && (
                        <a
                          href={getDownloadUrl(job.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-[#12131F] text-muted-foreground hover:text-foreground hover:bg-[#1E1F35] rounded-xl border border-border transition-colors shadow-sm"
                          title="Download transformed project"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </Card>
  );
});

export default RecentJobsCard;
