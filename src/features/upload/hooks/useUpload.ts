import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseProject, startMigration } from '../api';

export function useUpload() {
  const queryClient = useQueryClient();

  const parseMutation = useMutation({
    mutationFn: parseProject,
  });

  const migrateMutation = useMutation({
    mutationFn: (variables: {
      projectFiles: any[];
      targetFramework: string;
      sourceFramework?: string;
    }) =>
      startMigration(
        variables.projectFiles,
        variables.targetFramework,
        variables.sourceFramework
      ),
    onSuccess: () => {
      // Invalidate recent jobs queries to update list history instantly
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
    },
  });

  return {
    parseProject: parseMutation.mutateAsync,
    isParsing: parseMutation.isPending,
    startMigration: migrateMutation.mutateAsync,
    isMigrating: migrateMutation.isPending,
    error: parseMutation.error || migrateMutation.error,
  };
}
