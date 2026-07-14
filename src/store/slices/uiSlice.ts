import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ActiveTab = 'dashboard' | 'graph' | 'jobs' | 'targets' | 'apiKeys';

interface UiState {
  activeTab: ActiveTab;
}

const initialState: UiState = {
  activeTab: 'dashboard',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state: UiState, action: PayloadAction<ActiveTab>) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = uiSlice.actions;
export default uiSlice.reducer;
