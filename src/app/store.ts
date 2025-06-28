import { configureStore } from '@reduxjs/toolkit';
import wellReducer from '../features/wellSlice';

export const store = configureStore({
    reducer: {
        well: wellReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;