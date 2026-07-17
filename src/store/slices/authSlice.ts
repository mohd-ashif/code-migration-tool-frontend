import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkspaceDto } from '../../shared/types/api.types';
import { queryClient } from '../../app/providers/QueryProvider';

export interface UserDto {
  id: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';

interface AuthState {
  user: UserDto | null;
  currentUser: UserDto | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  initialized: boolean;
  authView: AuthView;
  verificationToken: string | null;
  resetToken: string | null;
  currentWorkspace: WorkspaceDto | null;
}

const getInitialUser = (): UserDto | null => {
  try {
    const stored = localStorage.getItem('current_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initialUser = getInitialUser();

const initialState: AuthState = {
  user: initialUser,
  currentUser: initialUser,
  accessToken: null,
  isAuthenticated: !!initialUser,
  isLoading: true, // starts loading while silently checking refresh token
  isInitializing: true,
  initialized: false,
  authView: 'login',
  verificationToken: null,
  resetToken: null,
  currentWorkspace: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state: AuthState,
      action: PayloadAction<{ user: UserDto; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.currentUser = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isInitializing = false;
      state.initialized = true;
      try {
        localStorage.setItem('current_user', JSON.stringify(action.payload.user));
      } catch (err) {
        console.error('Failed to save current_user to localStorage', err);
      }
    },
    logout: (state: AuthState) => {
      state.user = null;
      state.currentUser = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isInitializing = false;
      state.initialized = true;
      state.currentWorkspace = null;
      try {
        localStorage.removeItem('current_user');
      } catch (err) {
        console.error('Failed to remove current_user from localStorage', err);
      }
      try {
        queryClient.clear();
      } catch (err) {
        console.error('Failed to clear query client cache', err);
      }
    },
    setLoading: (state: AuthState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthView: (state: AuthState, action: PayloadAction<AuthView>) => {
      state.authView = action.payload;
    },
    setVerificationToken: (state: AuthState, action: PayloadAction<string | null>) => {
      state.verificationToken = action.payload;
      state.authView = 'verify-email';
    },
    setResetToken: (state: AuthState, action: PayloadAction<string | null>) => {
      state.resetToken = action.payload;
      state.authView = 'reset-password';
    },
    setAuthWorkspace: (state: AuthState, action: PayloadAction<WorkspaceDto | null>) => {
      state.currentWorkspace = action.payload;
    },
  },
});

export const {
  setCredentials,
  logout,
  setLoading,
  setAuthView,
  setVerificationToken,
  setResetToken,
  setAuthWorkspace,
} = authSlice.actions;

export default authSlice.reducer;
