import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Link from '@mui/material/Link'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import PaymentChip from '../../components/PaymentChip.tsx'
import { formatAge, formatCurrency } from '../../utils/format.ts'
import type { PatientRow } from './patientRows.ts'

const columns: GridColDef<PatientRow>[] = [
  {
    field: 'fullName',
    headerName: 'Nome',
    flex: 1,
    minWidth: 140,
    renderCell: ({ row }) => (
      <Link
        component={RouterLink}
        to={`/pacientes/${row.id}`}
        color="inherit"
        underline="hover"
        onClick={(event) => event.stopPropagation()}
      >
        {row.fullName}
      </Link>
    ),
  },
  { field: 'kind', headerName: 'Tipo', width: 80 },
  {
    field: 'age',
    headerName: 'Idade',
    type: 'number',
    width: 80,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (value: number) => formatAge(value),
  },
  { field: 'days', headerName: 'Dias de atendimento', width: 155 },
  {
    field: 'fee',
    headerName: 'Valor da consulta',
    type: 'number',
    width: 140,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (value: number) => formatCurrency(value),
  },
  {
    field: 'pending',
    headerName: 'Pagamento',
    type: 'boolean',
    width: 115,
    align: 'left',
    headerAlign: 'left',
    renderCell: ({ row }) => <PaymentChip pending={row.pending} />,
  },
  { field: 'phone', headerName: 'Telefone', width: 135 },
]

export default function PatientsTable({ rows, loading }: { rows: PatientRow[]; loading: boolean }) {
  const navigate = useNavigate()

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      autoHeight
      disableColumnMenu
      disableRowSelectionOnClick
      onRowClick={({ row }) => navigate(`/pacientes/${row.id}`)}
      initialState={{
        sorting: { sortModel: [{ field: 'fullName', sort: 'asc' }] },
        pagination: { paginationModel: { pageSize: 25 } },
      }}
      pageSizeOptions={[25, 50, 100]}
      sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
    />
  )
}
