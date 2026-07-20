import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';

interface WorkspaceState {
  selectedJobId: string | null;
  currentWorkspaceId: string | null;
  currentWorkspaceName: string | null;
  currentWorkspaceRole: string | null;
  workspacesList: any[];
  isLoadingWorkspaces: boolean;
  isInviteDialogOpen: boolean;
  isSwitchDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
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
  currentWorkspaceRole: getStoredItem('current_workspace_role'),
  workspacesList: [],
  isLoadingWorkspaces: false,
  isInviteDialogOpen: false,
  isSwitchDialogOpen: false,
  isDeleteDialogOpen: false,
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
    setWorkspacesList: (state: WorkspaceState, action: PayloadAction<any[]>) => {
      state.workspacesList = action.payload;
    },
    setLoadingWorkspaces: (state: WorkspaceState, action: PayloadAction<boolean>) => {
      state.isLoadingWorkspaces = action.payload;
    },
    setInviteDialogOpen: (state: WorkspaceState, action: PayloadAction<boolean>) => {
      state.isInviteDialogOpen = action.payload;
    },
    setSwitchDialogOpen: (state: WorkspaceState, action: PayloadAction<boolean>) => {
      state.isSwitchDialogOpen = action.payload;
    },
    setDeleteDialogOpen: (state: WorkspaceState, action: PayloadAction<boolean>) => {
      state.isDeleteDialogOpen = action.payload;
    },
    setCurrentWorkspace: (
      state: WorkspaceState,
      action: PayloadAction<{ id: string; name: string; role?: string } | null>
    ) => {
      state.currentWorkspaceId = action.payload?.id ?? null;
      state.currentWorkspaceName = action.payload?.name ?? null;
      state.currentWorkspaceRole = action.payload?.role ?? null;
      try {
        if (action.payload) {
          localStorage.setItem('current_workspace_id', action.payload.id);
          localStorage.setItem('current_workspace_name', action.payload.name);
          if (action.payload.role) {
            localStorage.setItem('current_workspace_role', action.payload.role);
          } else {
            localStorage.removeItem('current_workspace_role');
          }
        } else {
          localStorage.removeItem('current_workspace_id');
          localStorage.removeItem('current_workspace_name');
          localStorage.removeItem('current_workspace_role');
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
      state.currentWorkspaceRole = null;
      state.workspacesList = [];
      state.isLoadingWorkspaces = false;
      state.isInviteDialogOpen = false;
      state.isSwitchDialogOpen = false;
      state.isDeleteDialogOpen = false;
      try {
        localStorage.removeItem('selected_job_id');
        localStorage.removeItem('current_workspace_id');
        localStorage.removeItem('current_workspace_name');
        localStorage.removeItem('current_workspace_role');
      } catch (err) {
        console.error('Failed to clear workspace keys from localStorage on logout', err);
      }
    });
  },
});

export const {
  setSelectedJobId,
  setWorkspacesList,
  setLoadingWorkspaces,
  setCurrentWorkspace,
  setInviteDialogOpen,
  setSwitchDialogOpen,
  setDeleteDialogOpen
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
