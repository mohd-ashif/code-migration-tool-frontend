import { useQuery } from '@tanstack/react-query';
import { generateReport } from '../api';

export function useMigrationReport(jobId: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: ['report', jobId],
    queryFn: () => generateReport(jobId!),
    enabled: !!jobId && enabled,
    select: (data: any) => data.report || null,
  });

  return {
    report: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
