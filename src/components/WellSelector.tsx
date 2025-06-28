import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedWell } from '../features/wellSlice';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { mockWells } from '../data/mockWells';
import type { Well } from '../types/well'

const WellSelector: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = useState('');

  const handleChange = (event: SelectChangeEvent) => {
    const id = event.target.value;
    setSelectedId(id);
    const selected = mockWells.find(well => well.id === id);
    if (selected) {
      dispatch(setSelectedWell(selected));
    }
  };

  return (
    <Box m={2} width="300px">
      <FormControl fullWidth>
        <InputLabel id="well-label">Select a well</InputLabel>
        <Select
          labelId="well-label"
          id="well-select"
          value={selectedId}
          label="Select a well"
          onChange={handleChange}
        >
          {mockWells.map(well => (
            <MenuItem key={well.id} value={well.id}>
              {well.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default WellSelector;
export {};
