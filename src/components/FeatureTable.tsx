import React from 'react';
// import { Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';

interface FeatureRow {
  id: string;
  name: string;
  type?: string;
  city?: string;
  coordinates: [number, number];
}

interface Props {
  data: FeatureRow[];
  onRowClick: (coordinates: [number, number], name: string) => void;
}

const FeatureTable: React.FC<Props> = ({ data, onRowClick }) => {
  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'city', header: 'City' },
  ];

  const featureData: FeatureRow[] = [
  {
    id: 'test-1',
    name: 'Test Facility',
    type: 'Oil',
    city: 'Nowhere',
    coordinates: [-97, 30]
  }
];


  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableRowSelection={false}
      muiTableBodyRowProps={({ row }) => ({
        onClick: () => onRowClick(row.original.coordinates, row.original.name),
        sx: { cursor: 'pointer' },
      })}
    />
  );
};

export default FeatureTable;
export type { FeatureRow };