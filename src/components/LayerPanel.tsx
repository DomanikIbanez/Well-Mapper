import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Switch,
  TextField,
  MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import EvStationIcon from '@mui/icons-material/EvStation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { toggleLayer, LayerKey } from '../features/layerSlice';
import type { LayerSettings } from '../App';

interface Props {
  open: boolean;
  onClose: () => void;
  layerSettings: Record<string, LayerSettings>;
  setLayerSettings: (settings: Record<string, LayerSettings>) => void;
  cityOptions: string[];
  statusOptions: string[];
  operatorOptions: string[];
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

const LayerPanel: React.FC<Props> = ({
  open,
  onClose,
  layerSettings,
  setLayerSettings,
  cityOptions,
  statusOptions,
  operatorOptions
}) => {
  const dispatch = useDispatch();
  const visibleLayers = useSelector((state: RootState) => state.layers.visibleLayers);

  const handleToggle = (layer: LayerKey) => {
    dispatch(toggleLayer(layer));
  };

  const updateSetting = (layer: LayerKey, field: keyof LayerSettings, value: string) => {
    setLayerSettings({
      ...layerSettings,
      [layer]: {
        ...layerSettings[layer],
        [field]: value === 'All' ? '' : value,
      },
    });
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 300,
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
            <Box key={layer} sx={{ mb: 3 }}>
              <ListItem
                onClick={() => handleToggle(layer)}
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <Switch edge="start" checked={visibleLayers[layer]} />
                <ListItemIcon>{LAYER_ICONS[layer]}</ListItemIcon>
                <ListItemText primary={LAYER_LABELS[layer]} />
              </ListItem>

              {/* Filters */}
              <Box sx={{ pl: 5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[{ label: 'City', field: 'city', options: cityOptions },
                  { label: 'Status', field: 'status', options: statusOptions },
                  { label: 'Operator', field: 'operator', options: operatorOptions }]
                  .map(({ label, field, options }) => (
                    <TextField
                      key={field}
                      select
                      label={label}
                      size="small"
                      value={layerSettings[layer]?.[field as keyof LayerSettings] || ''}
                      onChange={(e) => updateSetting(layer, field as keyof LayerSettings, e.target.value)}
                    >
                      {options.map((opt, i) => (
                        <MenuItem key={i} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                  ))}
              </Box>
            </Box>
          );
        })}
      </List>
    </Drawer>
  );
};

export default LayerPanel;
