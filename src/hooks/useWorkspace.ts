import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setCurrentWorkspace } from '../store/slices/workspaceSlice';
import { setAuthWorkspace } from '../store/slices/authSlice';
import apiClient from '../services/http/apiClient';
import { WorkspaceDto } from '../shared/types/api.types';

async function fetchWorkspace(): Promise<WorkspaceDto> {
  const res: any = await apiClient.get('/api/workspace/me');
  return res.data;
}

export function useWorkspace() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const query = useQuery<WorkspaceDto>({
    queryKey: ['workspace'],
    queryFn: fetchWorkspace,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: isAuthenticated,
  });

  // Sync workspace name/id into Redux UI state whenever resolved
  useEffect(() => {
    if (query.data) {
      dispatch(setCurrentWorkspace({ id: query.data.id, name: query.data.name }));
      dispatch(setAuthWorkspace(query.data));
    }
  }, [query.data, dispatch]);

  return {
    workspace: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
