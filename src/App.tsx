import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper } from '@mui/material';
import MapView from './components/MapView';
import LayerList from './components/LayerList';
import FeatureTable from './components/FeatureTable';

type FeatureRow = {
  id: string;
  name: string;
  type?: string;
  city?: string;
  coordinates: [number, number];
};

const App = () => {
  const [featureData, setFeatureData] = useState<FeatureRow[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<{ coordinates: [number, number]; name: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const datasets = await Promise.all([
        fetch('/data/powerPlants.geojson').then(res => res.json()),
        fetch('/data/oilGasFields.geojson').then(res => res.json()),
        fetch('/data/substations.geojson').then(res => res.json()),
      ]);

      const allFeatures = datasets.flatMap((data, index) =>
        (data.features ?? []).map((f: any, i: number) => ({
          id: `${['plant', 'field', 'sub'][index]}-${i}`,
          name: f.properties?.name || 'Unnamed',
          type: f.properties?.type || 'N/A',
          city: f.properties?.city || 'Unknown',
          coordinates: f.geometry?.coordinates?.slice(0, 2) ?? [0, 0],
        }))
      );

      console.log('✅ Loaded Feature Data:', allFeatures);
      setFeatureData(allFeatures);
    };

    loadData();
  }, []);

  const handleRowClick = (coords: [number, number], name: string) => {
    setSelectedFeature({ coordinates: coords, name });
  };

  return (
    <Box p={2}>
      <h2>Energy Map Explorer</h2>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <LayerList />
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper elevation={2} sx={{ mb: 2 }}>
            <MapView selectedFeature={selectedFeature} />
          </Paper>
          <Paper elevation={2}>
            <FeatureTable data={featureData} onRowClick={handleRowClick} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
