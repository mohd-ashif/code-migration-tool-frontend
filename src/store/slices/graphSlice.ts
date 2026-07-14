import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GraphState {
  selectedNode: any | null;
  search: string;
  filter: string;
  page: number;
}

const initialState: GraphState = {
  selectedNode: null,
  search: '',
  filter: '',
  page: 1,
};

const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    setSelectedNode: (state: GraphState, action: PayloadAction<any | null>) => {
      state.selectedNode = action.payload;
    },
    setSearch: (state: GraphState, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setFilter: (state: GraphState, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    setPage: (state: GraphState, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearNodeDetails: (state: GraphState) => {
      state.selectedNode = null;
    },
  },
});

export const { setSelectedNode, setSearch, setFilter, setPage, clearNodeDetails } = graphSlice.actions;
export default graphSlice.reducer;
