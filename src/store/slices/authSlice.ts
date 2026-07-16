import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserDto {
  id: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authView: AuthView;
  verificationToken: string | null;
  resetToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // starts loading while silently checking refresh token
  authView: 'login',
  verificationToken: null,
  resetToken: null,
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
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logout: (state: AuthState) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
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
  },
});

export const {
  setCredentials,
  logout,
  setLoading,
  setAuthView,
  setVerificationToken,
  setResetToken,
} = authSlice.actions;

export default authSlice.reducer;
