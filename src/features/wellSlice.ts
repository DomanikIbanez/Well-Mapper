import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Well } from '../types/well'

interface WellState {
  selectedWell: Well | null;
}

const initialState: WellState = {
  selectedWell: null,
};

const wellSlice = createSlice({
  name: 'well',
  initialState,
  reducers: {
    setSelectedWell: (state, action: PayloadAction<Well>) => {
      state.selectedWell = action.payload;
    },
    clearSelectedWell: (state) => {
      state.selectedWell = null;
    },
  },
});

export const { setSelectedWell, clearSelectedWell } = wellSlice.actions;
export default wellSlice.reducer;
export {};

