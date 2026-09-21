import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import SessionStatusLabel from '../../components/SessionStatusLabel.tsx'
import { fullDayLabel } from '../../utils/calendar.ts'
import { billingLabel, capitalize } from '../../utils/format.ts'
import type { CalendarItem } from './calendarItems.ts'

type Props = { item: CalendarItem; anchorEl: HTMLElement; onClose: () => void; onEdit: () => void }

// Montada só enquanto a prévia está aberta. Foco, Esc e clique fora vêm do Popover (Modal do MUI).
export default function SessionPreview({ item: { session, patientName }, anchorEl, onClose, onEdit }: Props) {
  return (
    <Popover
      open
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{ paper: { role: 'dialog', 'aria-labelledby': 'previa-titulo' } }}
    >
      <Stack spacing={1.5} sx={{ p: 2, width: 300, maxWidth: 'calc(100vw - 32px)' }}>
        <Typography id="previa-titulo" variant="h6" component="h2" sx={{ overflowWrap: 'break-word' }}>
          {patientName}
        </Typography>
        <Typography variant="body2">
          {capitalize(fullDayLabel(session.date))} · {session.time ?? 'Sem horário'}
        </Typography>
        <Stack direction="row" alignItems="center" columnGap={1.5} rowGap={0.5} flexWrap="wrap">
          <SessionStatusLabel status={session.status} />
          <Typography variant="body2">{billingLabel(session)}</Typography>
        </Stack>
        <Button variant="outlined" onClick={onEdit} sx={{ alignSelf: 'flex-start' }}>
          Editar
        </Button>
      </Stack>
    </Popover>
  )
}
