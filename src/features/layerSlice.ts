import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LayerKey = 'powerPlants' | 'oilGasFields' | 'substations';

interface LayerState {
  visibleLayers: Record<LayerKey, boolean>;
}

const initialState: LayerState = {
  visibleLayers: {
    powerPlants: false,
    oilGasFields: false,
    substations: false,
  },
};

const layerSlice = createSlice({
  name: 'layers',
  initialState,
  reducers: {
    toggleLayer: (state, action: PayloadAction<LayerKey>) => {
      state.visibleLayers[action.payload] = !state.visibleLayers[action.payload];
    },
    setLayerVisibility: (state, action: PayloadAction<{ key: LayerKey; visible: boolean }>) => {
      state.visibleLayers[action.payload.key] = action.payload.visible;
    },
  },
});

export const { toggleLayer, setLayerVisibility } = layerSlice.actions;
export default layerSlice.reducer;
