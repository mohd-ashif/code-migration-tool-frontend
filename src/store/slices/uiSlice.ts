import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ActiveTab =
  | 'dashboard'
  | 'graph'
  | 'jobs'
  | 'targets'
  | 'apiKeys'
  | 'history'
  | 'reports'
  | 'billing'
  | 'settings';

interface UiState {
  activeTab: ActiveTab;
  isOffline: boolean;
}

const initialState: UiState = {
  activeTab: 'dashboard',
  isOffline: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state: UiState, action: PayloadAction<ActiveTab>) => {
      state.activeTab = action.payload;
    },
    setOfflineStatus: (state: UiState, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
  },
});

export const { setActiveTab, setOfflineStatus } = uiSlice.actions;
export default uiSlice.reducer;
