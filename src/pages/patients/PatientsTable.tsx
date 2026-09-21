import { useMemo } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
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
    flex: 2,
    minWidth: 240,
    renderCell: ({ row }) => (
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
        <Avatar aria-hidden sx={{ width: 36, height: 36 }}>
          {row.initials}
        </Avatar>
        <Link
          component={RouterLink}
          to={`/pacientes/${row.id}`}
          color="inherit"
          underline="hover"
          noWrap
          sx={{ fontWeight: 600 }}
          onClick={(event) => event.stopPropagation()}
        >
          {row.fullName}
        </Link>
        {row.archived && <Chip label="Arquivado" variant="outlined" />}
      </Stack>
    ),
  },
  {
    field: 'kind',
    headerName: 'Tipo',
    flex: 0.7,
    minWidth: 100,
    renderCell: ({ row }) => <Chip label={row.kind} variant="outlined" />,
  },
  {
    field: 'age',
    headerName: 'Idade',
    type: 'number',
    flex: 0.6,
    minWidth: 90,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (value: number) => formatAge(value),
  },
  {
    field: 'pending',
    headerName: 'Pagamento',
    type: 'boolean',
    flex: 0.9,
    minWidth: 120,
    align: 'left',
    headerAlign: 'left',
    renderCell: ({ row }) => <PaymentChip pending={row.pending} />,
  },
  { field: 'phone', headerName: 'Telefone', flex: 1, minWidth: 150 },
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
      disableColumnResize
      rowHeight={60}
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
