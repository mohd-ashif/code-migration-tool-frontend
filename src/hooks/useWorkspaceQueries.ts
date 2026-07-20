import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/http/apiClient';
import { WorkspaceDto, WorkspaceMemberDto } from '../shared/types/api.types';
import { useAppSelector } from '../store';

// Fetch functions
async function fetchWorkspaces(): Promise<WorkspaceDto[]> {
  const res: any = await apiClient.get('/api/workspace');
  return res.workspaces || [];
}

async function fetchCurrentWorkspace(): Promise<WorkspaceDto> {
  const res: any = await apiClient.get('/api/workspace/me');
  return res.workspace || res.data;
}

async function fetchWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberDto[]> {
  const res: any = await apiClient.get(`/api/workspace/${workspaceId}/members`);
  return res.members || [];
}

async function fetchWorkspacePendingInvites(workspaceId: string): Promise<any[]> {
  const res: any = await apiClient.get(`/api/workspace/${workspaceId}/invites`);
  return res.invitations || [];
}

async function fetchUserInvitations(): Promise<any[]> {
  const res: any = await apiClient.get('/api/workspace/invites');
  return res.invitations || [];
}

async function fetchWorkspaceUsage(workspaceId: string): Promise<any> {
  const res: any = await apiClient.get(`/api/workspace/${workspaceId}/usage`);
  return res.data || res.usage || null;
}

async function fetchWorkspaceActivity(workspaceId: string): Promise<any> {
  const res: any = await apiClient.get(`/api/workspace/${workspaceId}/activity`);
  return res.logs || [];
}

async function fetchWorkspaceStorage(workspaceId: string): Promise<any> {
  const res: any = await apiClient.get(`/api/workspace/${workspaceId}/storage`);
  return res.data || res.storage || null;
}

// Hooks

export function useWorkspaces() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return useQuery<WorkspaceDto[]>({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
    enabled: isAuthenticated,
    staleTime: 30000,
  });
}

export function useCurrentWorkspace() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return useQuery<WorkspaceDto>({
    queryKey: ['workspace', 'current'],
    queryFn: fetchCurrentWorkspace,
    enabled: isAuthenticated,
    staleTime: 30000,
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return useQuery<WorkspaceMemberDto[]>({
    queryKey: ['workspace', workspaceId, 'members'],
    queryFn: () => fetchWorkspaceMembers(workspaceId),
    enabled: isAuthenticated && !!workspaceId,
    staleTime: 30000,
  });
}

export function useWorkspacePendingInvites(workspaceId: string) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return useQuery<any[]>({
    queryKey: ['workspace', workspaceId, 'invites'],
    queryFn: () => fetchWorkspacePendingInvites(workspaceId),
    enabled: isAuthenticated && !!workspaceId,
    staleTime: 30000,
  });
}

export function useWorkspaceInvitations() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return useQuery<any[]>({
    queryKey: ['workspace', 'invitations'],
    queryFn: fetchUserInvitations,
    enabled: isAuthenticated,
    staleTime: 30000,
  });
}

export function useWorkspaceUsage(workspaceId: string) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return useQuery<any>({
    queryKey: ['workspace', workspaceId, 'usage'],
    queryFn: () => fetchWorkspaceUsage(workspaceId),
    enabled: isAuthenticated && !!workspaceId,
    staleTime: 30000,
  });
}

export function useWorkspaceActivity(workspaceId: string) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return useQuery<any>({
    queryKey: ['workspace', workspaceId, 'activity'],
    queryFn: () => fetchWorkspaceActivity(workspaceId),
    enabled: isAuthenticated && !!workspaceId,
    staleTime: 30000,
  });
}

export function useWorkspaceStorage(workspaceId: string) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return useQuery<any>({
    queryKey: ['workspace', workspaceId, 'storage'],
    queryFn: () => fetchWorkspaceStorage(workspaceId),
    enabled: isAuthenticated && !!workspaceId,
    staleTime: 30000,
  });
}

// Mutations

export function useCreateWorkspaceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; logoUrl?: string }) => {
      const res: any = await apiClient.post('/api/workspace', data);
      return res.workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useUpdateWorkspaceMutation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; slug?: string; logoUrl?: string; description?: string }) => {
      const res: any = await apiClient.put(`/api/workspace/${workspaceId}`, data);
      return res.workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', 'current'] });
    },
  });
}

export function useDeleteWorkspaceMutation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/api/workspace/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useInviteMemberMutation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res: any = await apiClient.post(`/api/workspace/${workspaceId}/invites`, data);
      return res.invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'invites'] });
    },
  });
}

export function useCancelInviteMutation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteId: string) => {
      await apiClient.delete(`/api/workspace/${workspaceId}/invites/${inviteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'invites'] });
    },
  });
}

export function useUpdateMemberRoleMutation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      const res: any = await apiClient.put(`/api/workspace/${workspaceId}/members/${data.userId}`, { role: data.role });
      return res.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'members'] });
    },
  });
}

export function useRemoveMemberMutation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/api/workspace/${workspaceId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'members'] });
    },
  });
}

export function useTransferOwnershipMutation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOwnerId: string) => {
      await apiClient.post(`/api/workspace/${workspaceId}/transfer`, { newOwnerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', 'current'] });
    },
  });
}

export function useAcceptInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      await apiClient.post('/api/workspace/invites/accept', { token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useRejectInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      await apiClient.post('/api/workspace/invites/reject', { token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'invitations'] });
    },
  });
}
