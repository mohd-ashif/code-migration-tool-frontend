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

export type SettingsSubTab = 'profile' | 'security' | 'accounts' | 'api-keys' | 'activities' | 'workspace';

interface UiState {
  activeTab: ActiveTab;
  isOffline: boolean;
  settingsSubTab: SettingsSubTab;
  isSidebarCollapsed: boolean;
  isUpgradeModalOpen: boolean;
  selectedPlanSlug: string | null;
}

const getStoredCollapsed = (): boolean => {
  try {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  } catch {
    return false;
  }
};

const initialState: UiState = {
  activeTab: 'dashboard',
  isOffline: false,
  settingsSubTab: 'profile',
  isSidebarCollapsed: getStoredCollapsed(),
  isUpgradeModalOpen: false,
  selectedPlanSlug: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state: UiState, action: PayloadAction<ActiveTab>) => {
      state.activeTab = action.payload;
    },
    setSettingsSubTab: (state: UiState, action: PayloadAction<SettingsSubTab>) => {
      state.settingsSubTab = action.payload;
    },
    setOfflineStatus: (state: UiState, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    setSidebarCollapsed: (state: UiState, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
      try {
        localStorage.setItem('sidebar_collapsed', String(action.payload));
      } catch (err) {
        console.error('Failed to save sidebar state', err);
      }
    },
    toggleSidebar: (state: UiState) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
      try {
        localStorage.setItem('sidebar_collapsed', String(state.isSidebarCollapsed));
      } catch (err) {
        console.error('Failed to save sidebar state', err);
      }
    },
    setUpgradeModalOpen: (state: UiState, action: PayloadAction<boolean>) => {
      state.isUpgradeModalOpen = action.payload;
    },
    setSelectedPlanSlug: (state: UiState, action: PayloadAction<string | null>) => {
      state.selectedPlanSlug = action.payload;
    },
  },
});

export const { 
  setActiveTab, 
  setSettingsSubTab, 
  setOfflineStatus, 
  setSidebarCollapsed, 
  toggleSidebar,
  setUpgradeModalOpen,
  setSelectedPlanSlug
} = uiSlice.actions;
export default uiSlice.reducer;
