import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Unarchive from '@mui/icons-material/Unarchive'
import PaymentChip from '../../components/PaymentChip.tsx'
import { formatAge } from '../../utils/format.ts'
import type { PatientRow } from './patientRows.ts'

type Props = {
  rows: PatientRow[]
  onUnarchive?: (id: string) => void // só com o filtro "Arquivados"
}

export default function PatientCards({ rows, onUnarchive }: Props) {
  return (
    <Stack component="ul" role="list" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {rows.map((row) => (
        <li key={row.id}>
          <Card>
            <CardActionArea component={RouterLink} to={`/pacientes/${row.id}`} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Typography variant="h6" component="h2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  {row.fullName}
                </Typography>
                <Stack direction="row" gap={0.5} flexShrink={0}>
                  {row.archived && <Chip label="Arquivado" variant="outlined" />}
                  <PaymentChip pending={row.pending} />
                </Stack>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {row.kind} · {formatAge(row.age)}
              </Typography>
              <Box
                component="dl"
                sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.25, m: 0, mt: 1 }}
              >
                <Typography component="dt" variant="body2" color="text.secondary">
                  Telefone
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                  {row.phone || '—'}
                </Typography>
              </Box>
            </CardActionArea>
            {onUnarchive && (
              <Box sx={{ px: 2, pb: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Unarchive />}
                  aria-label={`Desarquivar ${row.fullName}`}
                  onClick={() => onUnarchive(row.id)}
                >
                  Desarquivar
                </Button>
              </Box>
            )}
          </Card>
        </li>
      ))}
    </Stack>
  )
}
