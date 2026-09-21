import { useMemo } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Unarchive from '@mui/icons-material/Unarchive'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import PaymentChip from '../../components/PaymentChip.tsx'
import { formatAge } from '../../utils/format.ts'
import type { PatientRow } from './patientRows.ts'

const baseColumns: GridColDef<PatientRow>[] = [
  {
    field: 'fullName',
    headerName: 'Nome',
    flex: 1,
    minWidth: 140,
    renderCell: ({ row }) => (
      <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
        <Link
          component={RouterLink}
          to={`/pacientes/${row.id}`}
          color="inherit"
          underline="hover"
          noWrap
          onClick={(event) => event.stopPropagation()}
        >
          {row.fullName}
        </Link>
        {row.archived && <Chip label="Arquivado" variant="outlined" />}
      </Stack>
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

type Props = {
  rows: PatientRow[]
  loading: boolean
  onUnarchive?: (id: string) => void // só com o filtro "Arquivados"
}

export default function PatientsTable({ rows, loading, onUnarchive }: Props) {
  const navigate = useNavigate()

  const columns = useMemo<GridColDef<PatientRow>[]>(
    () =>
      onUnarchive
        ? [
            ...baseColumns,
            {
              field: 'actions',
              headerName: 'Ações',
              width: 140,
              sortable: false,
              renderCell: ({ row }) => (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Unarchive />}
                  aria-label={`Desarquivar ${row.fullName}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onUnarchive(row.id)
                  }}
                >
                  Desarquivar
                </Button>
              ),
            },
          ]
        : baseColumns,
    [onUnarchive],
  )

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
