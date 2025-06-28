import React from 'react';
import './App.css';
import MapView from './components/MapView';
import WellSelector from './components/WellSelector';
import WellInfoPanel from './components/WellInfoPanel';
import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';


function App() {
  return (
   <Box p={2}>
  <h2>Well Mapper</h2>
  <Grid container spacing={2}>
    <Grid xs={12} md={4}>
      <WellSelector />
      <WellInfoPanel />
    </Grid>
    <Grid xs={12} md={8}>
      <MapView />
    </Grid>
  </Grid>
</Box>

  );
}
export default App;
