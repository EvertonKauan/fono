import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PaymentChip from '../../components/PaymentChip.tsx'
import { formatAge, formatCurrency } from '../../utils/format.ts'
import type { PatientRow } from './patientRows.ts'

export default function PatientCards({ rows }: { rows: PatientRow[] }) {
  return (
    <Stack component="ul" role="list" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {rows.map((row) => (
        <li key={row.id}>
          <Card>
            <CardActionArea component={RouterLink} to={`/pacientes/${row.id}`} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Typography variant="h6" component="h2">
                  {row.fullName}
                </Typography>
                <PaymentChip pending={row.pending} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {row.kind} · {formatAge(row.age)}
              </Typography>
              <Box
                component="dl"
                sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.25, m: 0, mt: 1 }}
              >
                <Typography component="dt" variant="body2" color="text.secondary">
                  Dias de atendimento
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                  {row.days}
                </Typography>
                <Typography component="dt" variant="body2" color="text.secondary">
                  Valor da consulta
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                  {formatCurrency(row.fee)}
                </Typography>
                <Typography component="dt" variant="body2" color="text.secondary">
                  Telefone
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                  {row.phone || '—'}
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        </li>
      ))}
    </Stack>
  )
}
