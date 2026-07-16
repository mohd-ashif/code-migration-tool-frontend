import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
  selectedJobId: string | null;
  currentWorkspaceId: string | null;
  currentWorkspaceName: string | null;
}

const initialState: WorkspaceState = {
  selectedJobId: null,
  currentWorkspaceId: null,
  currentWorkspaceName: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setSelectedJobId: (state: WorkspaceState, action: PayloadAction<string | null>) => {
      state.selectedJobId = action.payload;
    },
    setCurrentWorkspace: (
      state: WorkspaceState,
      action: PayloadAction<{ id: string; name: string } | null>
    ) => {
      state.currentWorkspaceId = action.payload?.id ?? null;
      state.currentWorkspaceName = action.payload?.name ?? null;
    },
  },
});

export const { setSelectedJobId, setCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
