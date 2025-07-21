import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, AppBar, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MapView from './components/MapView';
import LayerPanel from './components/LayerPanel';
import FeatureTable from './components/FeatureTable';

// --- Types ---
export interface FeatureRow {
  id: string;
  name: string;
  type?: string;
  city?: string;
  country?: string;
  coordinates: [number, number];
  status?: string;
  operator?: string;
  capacity_mw?: number;
  commissioned?: number;
}

export interface LayerSettings {
  city?: string;
  country?: string;
  status?: string;
  operator?: string;
}

const App = () => {
  const [featureData, setFeatureData] = useState<FeatureRow[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<FeatureRow | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);

  // Dynamic dropdown options (populated from data)
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [operatorOptions, setOperatorOptions] = useState<string[]>([]);

  // Per-layer settings (filters)
  const [layerSettings, setLayerSettings] = useState<Record<string, LayerSettings>>({
    powerPlants: { city: 'All', status: 'All', operator: 'All', country: 'All' },
    oilGasFields: { city: 'All', status: 'All', operator: 'All', country: 'All' },
    substations: { city: 'All', status: 'All', operator: 'All', country: 'All' },
  });

  useEffect(() => {
    const loadData = async () => {
      const datasets = await Promise.all([
        fetch('/data/powerPlants.geojson').then(res => res.json()),
        fetch('/data/oilGasFields.geojson').then(res => res.json()),
        fetch('/data/substations.geojson').then(res => res.json()),
      ]);

      const allFeatures: FeatureRow[] = datasets.flatMap((data, index) =>
        (data.features ?? []).map((f: any, i: number) => ({
          id: `${['plant', 'field', 'sub'][index]}-${i}`,
          name: f.properties?.name || 'Unnamed',
          type: f.properties?.type || 'N/A',
          city: f.properties?.city || 'Unknown',
          country: f.properties?.country || 'Unknown',
          coordinates: f.geometry?.coordinates?.slice(0, 2) ?? [0, 0],
          status: f.properties?.status || 'Unknown',
          operator: f.properties?.operator || 'Unknown',
          capacity_mw: f.properties?.capacity_mw,
          commissioned: f.properties?.commissioned,
        }))
      );

      setFeatureData(allFeatures);

      // Extract unique dropdown options with "All"
      const extractOptions = (field: keyof FeatureRow): string[] => {
        const values = allFeatures
          .map(f => f[field])
          .filter((v): v is string => typeof v === 'string' && v.trim() !== '');
        return ['All', ...Array.from(new Set(values))];
      };

      setCityOptions(extractOptions('city'));
      setStatusOptions(extractOptions('status'));
      setOperatorOptions(extractOptions('operator'));
    };

    loadData();
  }, []);

  const handleRowClick = (feature: FeatureRow) => {
    setSelectedFeature(feature);
  };

  return (
    <Box sx={{ backgroundColor: '#f4f6fa', minHeight: '100vh' }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#5c6bc0',
          borderRadius: 0,
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setLayersOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            Energy Map Explorer
          </Typography>
        </Toolbar>
      </AppBar>

      <LayerPanel
        open={layersOpen}
        onClose={() => setLayersOpen(false)}
        layerSettings={layerSettings}
        setLayerSettings={setLayerSettings}
        cityOptions={cityOptions}
        statusOptions={statusOptions}
        operatorOptions={operatorOptions}
      />

      <Box sx={{ px: 2, py: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Paper elevation={3} sx={{ mb: 2, borderRadius: 2 }}>
              <MapView
                selectedFeature={selectedFeature}
                featureData={featureData}
                layerSettings={layerSettings}
              />
            </Paper>
            <Paper elevation={3} sx={{ borderRadius: 2 }}>
              <FeatureTable data={featureData} onRowClick={handleRowClick} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default App;
