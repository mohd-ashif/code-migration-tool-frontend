import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';

interface WorkspaceState {
  selectedJobId: string | null;
  currentWorkspaceId: string | null;
  currentWorkspaceName: string | null;
}

const getStoredItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const initialState: WorkspaceState = {
  selectedJobId: getStoredItem('selected_job_id'),
  currentWorkspaceId: getStoredItem('current_workspace_id'),
  currentWorkspaceName: getStoredItem('current_workspace_name'),
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setSelectedJobId: (state: WorkspaceState, action: PayloadAction<string | null>) => {
      state.selectedJobId = action.payload;
      try {
        if (action.payload) {
          localStorage.setItem('selected_job_id', action.payload);
        } else {
          localStorage.removeItem('selected_job_id');
        }
      } catch (err) {
        console.error('Failed to update selected_job_id in localStorage', err);
      }
    },
    setCurrentWorkspace: (
      state: WorkspaceState,
      action: PayloadAction<{ id: string; name: string } | null>
    ) => {
      state.currentWorkspaceId = action.payload?.id ?? null;
      state.currentWorkspaceName = action.payload?.name ?? null;
      try {
        if (action.payload) {
          localStorage.setItem('current_workspace_id', action.payload.id);
          localStorage.setItem('current_workspace_name', action.payload.name);
        } else {
          localStorage.removeItem('current_workspace_id');
          localStorage.removeItem('current_workspace_name');
        }
      } catch (err) {
        console.error('Failed to update current workspace in localStorage', err);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.selectedJobId = null;
      state.currentWorkspaceId = null;
      state.currentWorkspaceName = null;
      try {
        localStorage.removeItem('selected_job_id');
        localStorage.removeItem('current_workspace_id');
        localStorage.removeItem('current_workspace_name');
      } catch (err) {
        console.error('Failed to clear workspace keys from localStorage on logout', err);
      }
    });
  },
});

export const { setSelectedJobId, setCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
