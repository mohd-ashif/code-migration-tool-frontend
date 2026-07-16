import { useQuery } from '@tanstack/react-query';
import { getJobs } from '../api';
import { useAppSelector, RootState } from '../../../store';

export function useRecentJobs() {
  const workspaceId = useAppSelector((state: RootState) => state.workspace.currentWorkspaceId);

  const query = useQuery({
    queryKey: ['recentJobs', workspaceId],
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
