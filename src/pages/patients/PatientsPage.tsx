import { useEffect, useMemo, useState } from 'react'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Add from '@mui/icons-material/Add'
import Search from '@mui/icons-material/Search'
import { useTenantId } from '../../auth/useSession.ts'
import { listPatients } from '../../services/patients.ts'
import { listPayments } from '../../services/payments.ts'
import type { Patient } from '../../types/domain.ts'
import NewPatientDialog from './NewPatientDialog.tsx'
import PatientCards from './PatientCards.tsx'
import PatientsTable from './PatientsTable.tsx'
import { filterPatients, toRow, type PatientFilters } from './patientRows.ts'

type Data = { patients: Patient[]; pendingIds: Set<string> }

export default function PatientsPage() {
  const tenantId = useTenantId()
  const isDesktop = useMediaQuery(useTheme().breakpoints.up('md'))
  const [data, setData] = useState<Data | null>(null)
  const [filters, setFilters] = useState<PatientFilters>({ query: '', kind: 'todos', onlyPending: false })
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([listPatients(tenantId), listPayments(tenantId)]).then(([patients, payments]) => {
      if (!active) return
      const pendingIds = new Set(payments.filter((p) => p.status === 'pendente').map((p) => p.patientId))
      setData({ patients, pendingIds })
    })
    return () => {
      active = false
    }
  }, [tenantId])

  const rows = useMemo(() => {
    if (!data) return []
    return filterPatients(data.patients, data.pendingIds, filters)
      .map((patient) => toRow(patient, data.pendingIds))
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'pt-BR'))
  }, [data, filters])

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
        <Typography variant="h1">Pacientes</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          Novo paciente
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <TextField
          label="Buscar por nome"
          name="busca"
          type="search"
          value={filters.query}
          onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          sx={{ flex: { sm: 1 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          label="Tipo"
          name="tipo"
          value={filters.kind}
          onChange={(event) => setFilters({ ...filters, kind: event.target.value as PatientFilters['kind'] })}
          sx={{ minWidth: { sm: 150 } }}
        >
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="crianca">Criança</MenuItem>
          <MenuItem value="adulto">Adulto</MenuItem>
        </TextField>
        <FormControlLabel
          label="Pagamento pendente"
          control={
            <Checkbox
              name="pendentes"
              checked={filters.onlyPending}
              onChange={(event) => setFilters({ ...filters, onlyPending: event.target.checked })}
            />
          }
        />
      </Stack>

      {data && (
        <Typography variant="body2" color="text.secondary" aria-live="polite">
          {rows.length === 1 ? '1 paciente' : `${rows.length} pacientes`}
        </Typography>
      )}
      {isDesktop ? (
        <PatientsTable rows={rows} loading={data === null} />
      ) : (
        data && (rows.length ? <PatientCards rows={rows} /> : <Typography>Nenhum paciente encontrado.</Typography>)
      )}

      <NewPatientDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Stack>
  )
}
