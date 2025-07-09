import { configureStore } from '@reduxjs/toolkit';
import wellReducer from '../features/wellSlice';
import layerReducer from '../features/layerSlice';

export const store = configureStore({
  reducer: {
    well: wellReducer,
    layers: layerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export {};
