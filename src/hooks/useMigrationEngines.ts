import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/http/apiClient';
import { MigrationEngineDto, PatchEnginePayload } from '../shared/types/framework.types';

export function useMigrationEngines() {
  return useQuery<MigrationEngineDto[]>({
    queryKey: ['migrationEngines'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/engines');
      return res.data;
    },
  });
}

export function useUpdateEngine() {
  const queryClient = useQueryClient();

  return useMutation<MigrationEngineDto, Error, { id: string; patch: PatchEnginePayload }>({
    mutationFn: async ({ id, patch }) => {
      const res: any = await apiClient.patch(`/api/engines/${id}`, patch);
      return res.data;
    },
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ['migrationEngines'] });
      queryClient.invalidateQueries({ queryKey: ['frameworks'] });
      queryClient.invalidateQueries({ queryKey: ['frameworkDetail'] });
    },
  });
}
