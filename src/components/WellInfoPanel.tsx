import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { Box, Card, CardContent, Typography } from '@mui/material';

const WellInfoPanel: React.FC = () => {
  const selectedWell = useSelector((state: RootState) => state.well.selectedWell);

  return (
    <Box m={2} width="300px">
      <Card variant="outlined">
        <CardContent>
          {selectedWell ? (
            <>
              <Typography variant="h6" gutterBottom>
                Well Info
              </Typography>
              <Typography><strong>Name:</strong> {selectedWell.name}</Typography>
              <Typography><strong>Latitude:</strong> {selectedWell.lat}</Typography>
              <Typography><strong>Longitude:</strong> {selectedWell.lng}</Typography>
            </>
          ) : (
            <Typography color="text.secondary">
              No well selected. Choose one from the dropdown above.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default WellInfoPanel;
export {};