import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getJobStatus } from '../api';
import { useEffect } from 'react';

export function useJob(jobId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (queryData: any) => {
      const jobData = queryData.state.data?.job;
      if (!jobData) return false;
      const inProgress = jobData.status === 'pending' || jobData.status === 'processing';
      return inProgress ? 2000 : false; // Poll every 2 seconds if pending/processing
    },
    select: (data: any) => data.job || null,
  });

  const job = query.data;

  // Invalidate the jobs list when the job is no longer running to show the correct status
  useEffect(() => {
    if (job && (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled')) {
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
    }
  }, [job?.status, queryClient]);

  return {
    job,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
  };
}
