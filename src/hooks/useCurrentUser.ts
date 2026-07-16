import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/http/apiClient';
import { useAppDispatch, useAppSelector } from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';
import { useEffect } from 'react';

export function useCurrentUser() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.accessToken);

  const query = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response: any = await apiClient.get('/api/auth/me');
      return response.data.user;
    },
    enabled: isAuthenticated && !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setCredentials({ user: query.data, accessToken: token || '' }));
    } else if (query.isError) {
      dispatch(logout());
    }
  }, [query.data, query.isError, dispatch, token]);

  return query;
}
