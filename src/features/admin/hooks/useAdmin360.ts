import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/http/apiClient';

export function useUser360(userId?: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId, '360'],
    queryFn: async () => {
      if (!userId) return null;
      const response: any = await apiClient.get(`/api/admin/users/${userId}`);
      return response.user360 || response.data?.user360;
    },
    enabled: Boolean(userId),
  });
}

export function useRevokeSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response: any = await apiClient.post(`/api/admin/users/${userId}/revoke-sessions`);
      return response;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId, '360'] });
    },
  });
}

export function useRevokeApiKeys() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response: any = await apiClient.post(`/api/admin/users/${userId}/revoke-api-keys`);
      return response;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId, '360'] });
    },
  });
}

export function useResetUserUsage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, metric }: { userId: string; metric?: string }) => {
      const response: any = await apiClient.post(`/api/admin/users/${userId}/reset-usage`, { metric });
      return response;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId, '360'] });
    },
  });
}

export function useWorkspace360(workspaceId?: string) {
  return useQuery({
    queryKey: ['admin', 'workspaces', workspaceId, '360'],
    queryFn: async () => {
      if (!workspaceId) return null;
      const response: any = await apiClient.get(`/api/admin/workspaces/${workspaceId}`);
      return response.workspace360 || response.data?.workspace360;
    },
    enabled: Boolean(workspaceId),
  });
}
