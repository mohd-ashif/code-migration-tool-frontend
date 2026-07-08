import React from 'react';
import { List, Download, ArrowRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { JobRecord, getDownloadUrl } from '../services/api';

interface JobsListProps {
  jobs: JobRecord[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
}

export default function JobsList({ jobs, selectedJobId, onSelectJob }: JobsListProps) {
  const getStatusBadge = (status: JobRecord['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
            <AlertCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <List className="w-5 h-5 text-indigo-500" /> Recent Jobs
      </h2>

      {jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No migrations found. Start one using the form.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-1">
          {jobs.map((job) => {
            const isSelected = selectedJobId === job.id;
            return (
              <div 
                key={job.id} 
                className={`py-3 px-2 flex justify-between items-center group transition-colors rounded-lg cursor-pointer ${
                  isSelected ? "bg-indigo-50/50" : "hover:bg-gray-50"
                }`}
                onClick={() => onSelectJob(job.id)}
              >
                <div className="w-3/5">
                  <div className="font-mono text-xs text-gray-900 truncate font-semibold">
                    {job.id}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <span>Target: {job.result?.targetFramework || 'N/A'}</span>
                    {job.result?.metadata?.fileCount && (
                      <>
                        <span>•</span>
                        <span>{job.result.metadata.fileCount} files</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                  {job.status === 'completed' && (
                    <a 
                      href={getDownloadUrl(job.id)} 
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download transformed project"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
