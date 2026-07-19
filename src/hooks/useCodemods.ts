import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/http/apiClient';
import { CodemodDto, PatchCodemodPayload, CompilerSettingsDto, PatchCompilerSettingsPayload } from '../shared/types/framework.types';

export function useCodemods(frameworkId?: string) {
  return useQuery<CodemodDto[]>({
    queryKey: ['codemods', frameworkId],
    queryFn: async () => {
      const url = frameworkId ? `/api/codemods?frameworkId=${frameworkId}` : '/api/codemods';
      const res: any = await apiClient.get(url);
      return res.data;
    },
    enabled: frameworkId !== undefined,
  });
}

export function useUpdateCodemod() {
  const queryClient = useQueryClient();

  return useMutation<CodemodDto, Error, { id: string; patch: PatchCodemodPayload }>({
    mutationFn: async ({ id, patch }) => {
      const res: any = await apiClient.patch(`/api/codemods/${id}`, patch);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codemods'] });
      queryClient.invalidateQueries({ queryKey: ['frameworks'] });
      queryClient.invalidateQueries({ queryKey: ['frameworkDetail'] });
    },
  });
}

export function useUpdateCompilerSettings() {
  const queryClient = useQueryClient();

  return useMutation<CompilerSettingsDto, Error, { frameworkId: string; patch: PatchCompilerSettingsPayload }>({
    mutationFn: async ({ frameworkId, patch }) => {
      const res: any = await apiClient.patch(`/api/compiler-settings/${frameworkId}`, patch);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['frameworkDetail', variables.frameworkId] });
      queryClient.invalidateQueries({ queryKey: ['frameworks'] });
    },
  });
}
