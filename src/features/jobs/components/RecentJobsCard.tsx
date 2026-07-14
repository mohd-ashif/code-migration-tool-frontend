import { memo } from 'react';
import { Activity, Download, ArrowRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getDownloadUrl } from '../api';
import { useRecentJobs } from '../hooks/useRecentJobs';
import { useAppDispatch, useAppSelector, RootState } from '../../../store';
import { setSelectedJobId } from '../../../store/slices/workspaceSlice';
import { JobRecord } from '../../../shared/types/api.types';
import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';

const RecentJobsCard = memo(function RecentJobsCard() {
  const dispatch = useAppDispatch();
  const selectedJobId = useAppSelector((state: RootState) => state.workspace.selectedJobId);
  const { jobs, isLoading } = useRecentJobs();

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
        <div className="p-2 bg-error/10 text-error rounded-xl border border-error/20">
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
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Jobs</h2>
      </div>
      <p className="text-xs text-gray-400 mb-6 select-none">Last transformations run on this workspace.</p>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center select-none text-gray-500 animate-pulse">
          <Activity className="w-8 h-8 mb-2 text-gray-600 animate-pulse" />
          <p className="text-xs font-semibold text-gray-400">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center select-none text-gray-500">
          <Activity className="w-8 h-8 mb-2 text-gray-600" />
          <p className="text-xs font-semibold text-gray-400">No migrations found</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Start one using the migration panel.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#1E1F35] overflow-y-auto max-h-[330px] pr-1 scrollbar">
          {jobs.map((job: JobRecord) => {
            const isSelected = selectedJobId === job.id;
            return (
              <div
                key={job.id}
                onClick={() => dispatch(setSelectedJobId(job.id))}
                className={`py-3.5 px-3 flex justify-between items-center group transition-all duration-200 rounded-xl cursor-pointer mb-2 border ${
                  isSelected
                    ? 'bg-primary/5 border-primary/45 shadow-glow'
                    : 'bg-[#10101B]/20 border-[#1E1F35] hover:bg-[#1E1F35]/30'
                }`}
              >
                {/* Left side details */}
                <div className="flex items-center gap-3 w-3/5">
                  {getIconForStatus(job.status)}
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs text-white font-bold block truncate" title={job.id}>
                      {job.id}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 flex items-center gap-1.5">
                      <span>target: <strong className="text-gray-300 font-bold">{job.result?.targetFramework || 'N/A'}</strong></span>
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
                      className="p-2 bg-[#12131F] text-gray-400 hover:text-white hover:bg-[#1E1F35] rounded-xl border border-[#1E1F35] transition-colors shadow-sm"
                      title="Download transformed project"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
});

export default RecentJobsCard;
