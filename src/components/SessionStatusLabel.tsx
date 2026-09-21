import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import type { SessionStatus } from '../types/domain.ts'
import { sessionStatusLabel } from '../utils/format.ts'

// Sem cor nova: Agendada = chip outlined; Realizada = ícone de check; Cancelada = texto riscado.
export default function SessionStatusLabel({ status }: { status: SessionStatus }) {
  const label = sessionStatusLabel[status]
  if (status === 'agendada') return <Chip label={label} color="primary" variant="outlined" />
  if (status === 'realizada') {
    return (
      <Stack direction="row" alignItems="center" gap={0.5}>
        <CheckCircleOutline fontSize="small" />
        <Typography variant="body2">{label}</Typography>
      </Stack>
    )
  }
  return (
    <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
      {label}
    </Typography>
  )
}
