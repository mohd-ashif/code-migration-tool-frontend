import { useQuery } from '@tanstack/react-query';
import { getJobs } from '../api';

export function useRecentJobs() {
  const query = useQuery({
    queryKey: ['recentJobs'],
    queryFn: getJobs,
    refetchInterval: 5000, // Poll list every 5 seconds
    select: (data: any) => data.jobs || [],
  });

  return {
    jobs: query.data || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}
