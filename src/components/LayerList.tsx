import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { toggleLayer, LayerKey } from '../features/layerSlice';
import { List, ListItem, ListItemIcon, ListItemText, Checkbox } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import EvStationIcon from '@mui/icons-material/EvStation';

const LAYER_ICONS: Record<LayerKey, React.ReactElement> = {
  powerPlants: <FlashOnIcon />,
  oilGasFields: <OilBarrelIcon />,
  substations: <EvStationIcon />,
};

const LAYER_LABELS: Record<LayerKey, string> = {
  powerPlants: 'Power Plants',
  oilGasFields: 'Oil & Gas Fields',
  substations: 'Substations',
};

const LayerList: React.FC = () => {
  const dispatch = useDispatch();
  const visibleLayers = useSelector((state: RootState) => state.layers.visibleLayers);

  const handleToggle = (layer: LayerKey) => {
    dispatch(toggleLayer(layer));
  };

  return (
    <div>
      <h3>Layer List</h3>
      <List component="ul">
        {Object.keys(visibleLayers).map((key) => {
          const layer = key as LayerKey;
          return (
            <ListItem
              key={layer}
              button
              onClick={() => handleToggle(layer)}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Checkbox edge="start" checked={visibleLayers[layer]} />
              <ListItemIcon>{LAYER_ICONS[layer]}</ListItemIcon>
              <ListItemText primary={LAYER_LABELS[layer]} />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};

export default LayerList;
