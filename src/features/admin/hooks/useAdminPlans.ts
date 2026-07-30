import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/http/apiClient';

export interface AdminPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isPublic: boolean;
  isRecommended: boolean;
  displayOrder: number;
  version: number;
  trialDays: number;
  subscriberCount: number;
  createdAt: string;
  updatedAt?: string;
  archivedAt?: string;
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const response: any = await apiClient.get('/api/admin/plans');
      const list = response.plans || response.data?.plans || [];
      return list as AdminPlan[];
    },
    staleTime: 10 * 1000,
  });
}

export function useAdminPlan(id?: string) {
  return useQuery({
    queryKey: ['admin', 'plans', id],
    queryFn: async () => {
      if (!id) return null;
      const response: any = await apiClient.get(`/api/admin/plans/${id}`);
      return response.plan || response.data?.plan || null;
    },
    enabled: Boolean(id),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const response: any = await apiClient.post('/api/admin/plans', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const response: any = await apiClient.patch(`/api/admin/plans/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
    },
  });
}

export function usePublishPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response: any = await apiClient.post(`/api/admin/plans/${id}/publish`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
    },
  });
}

export function useUnpublishPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response: any = await apiClient.post(`/api/admin/plans/${id}/unpublish`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
    },
  });
}

export function useArchivePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response: any = await apiClient.post(`/api/admin/plans/${id}/archive`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
    },
  });
}

export function useDuplicatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response: any = await apiClient.post(`/api/admin/plans/${id}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
    },
  });
}

export function usePlanSubscribers(id?: string) {
  return useQuery({
    queryKey: ['admin', 'plans', id, 'subscribers'],
    queryFn: async () => {
      if (!id) return [];
      const response: any = await apiClient.get(`/api/admin/plans/${id}/subscribers`);
      return response.subscribers || response.data?.subscribers || [];
    },
    enabled: Boolean(id),
  });
}
