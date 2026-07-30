import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/http/apiClient';

export function useAdminUsage() {
  return useQuery({
    queryKey: ['admin', 'usage'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/usage');
      return res.usage || res.data?.usage;
    },
  });
}

export function useCreateQuotaOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { workspaceId: string; metric: string; overrideValue: number; reason: string; expiresAt: string }) => {
      const res: any = await apiClient.post('/api/admin/usage/overrides', payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usage'] });
    },
  });
}

export function useAdminAiUsage() {
  return useQuery({
    queryKey: ['admin', 'aiUsage'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/ai-usage');
      return res.aiUsage || res.data?.aiUsage;
    },
  });
}

export function useAdminMigrationQuality() {
  return useQuery({
    queryKey: ['admin', 'migrationQuality'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/migration-quality');
      return res.quality || res.data?.quality;
    },
  });
}

export function useAdminFailures() {
  return useQuery({
    queryKey: ['admin', 'failures'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/failures');
      return (res.failures || res.data?.failures || []) as any[];
    },
  });
}

export function useUpdateFailureGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, assignedTo, internalNotes }: { id: string; status?: string; assignedTo?: string; internalNotes?: string }) => {
      const res: any = await apiClient.patch(`/api/admin/failures/${id}`, { status, assignedTo, internalNotes });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'failures'] });
    },
  });
}
