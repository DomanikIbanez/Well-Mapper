import React from 'react';
import { MaterialReactTable } from 'material-react-table';

interface FeatureRow {
  id: string;
  name: string;
  type?: string;
  city?: string;
  coordinates: [number, number];
  status?: string;
  operator?: string;
  capacity_mw?: number;
  commissioned?: number;
}

interface Props {
  data: FeatureRow[];
  onRowClick: (feature: FeatureRow) => void;
}

const FeatureTable: React.FC<Props> = ({ data, onRowClick }) => {
  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'city', header: 'City' },
  ];

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableRowSelection={false}
      muiTablePaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3,
          border: '1px solid #ddd',
        },
      }}
      muiTableHeadCellProps={{
        sx: {
          background: 'linear-gradient(to right, rgb(109, 85, 154), #1e88e5)',
          color: '#fff',
          fontWeight: 'bold',
        },
      }}
      muiTableBodyCellProps={{
        sx: {
          backgroundColor: '#f4f6fc',
          color: '#0d47a1',
        },
      }}
      muiTableBodyRowProps={({ row }) => ({
        onClick: () => onRowClick(row.original),
        sx: {
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#e3f2fd',
          },
        },
      })}
    />
  );
};

export default FeatureTable;
export type { FeatureRow };
