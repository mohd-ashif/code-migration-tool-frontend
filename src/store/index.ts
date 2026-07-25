import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import uiReducer from './slices/uiSlice';
import workspaceReducer from './slices/workspaceSlice';
import graphReducer from './slices/graphSlice';
import authReducer from './slices/authSlice';
import billingUIReducer from './slices/billingSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    workspace: workspaceReducer,
    graph: graphReducer,
    auth: authReducer,
    billingUI: billingUIReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
