import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import EvStationIcon from '@mui/icons-material/EvStation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { toggleLayer, LayerKey } from '../features/layerSlice';

interface Props {
  open: boolean;
  onClose: () => void;
}

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

const LayerPanel: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const visibleLayers = useSelector((state: RootState) => state.layers.visibleLayers);

  const handleToggle = (layer: LayerKey) => {
    dispatch(toggleLayer(layer));
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: '#f4f6fa',
          padding: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Layer Filters</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List>
        {Object.keys(visibleLayers).map((key) => {
          const layer = key as LayerKey;
          return (
            <ListItem
              key={layer}
              onClick={() => handleToggle(layer)}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <Checkbox edge="start" checked={visibleLayers[layer]} />
              <ListItemIcon>{LAYER_ICONS[layer]}</ListItemIcon>
              <ListItemText primary={LAYER_LABELS[layer]} />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default LayerPanel;
