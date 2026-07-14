import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
  selectedJobId: string | null;
}

const initialState: WorkspaceState = {
  selectedJobId: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setSelectedJobId: (state: WorkspaceState, action: PayloadAction<string | null>) => {
      state.selectedJobId = action.payload;
    },
  },
});

export const { setSelectedJobId } = workspaceSlice.actions;
export default workspaceSlice.reducer;
