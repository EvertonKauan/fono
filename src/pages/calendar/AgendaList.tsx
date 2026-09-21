import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import SessionStatusLabel from '../../components/SessionStatusLabel.tsx'
import { dayLabel, todayIso } from '../../utils/calendar.ts'
import { billingLabel } from '../../utils/format.ts'
import type { CalendarItem } from './calendarItems.ts'

type Props = {
  days: { date: string; items: CalendarItem[] }[]
  onOpen: (item: CalendarItem) => void
}

// Abaixo de md: só os dias com sessão, cada um com seu título.
export default function AgendaList({ days, onOpen }: Props) {
  const today = todayIso()

  return (
    <Stack spacing={2}>
      {days.map(({ date, items }) => (
        <Box component="section" key={date}>
          <Typography variant="h6" component="h3" sx={{ mb: 0.75, '&::first-letter': { textTransform: 'uppercase' } }}>
            {dayLabel(date)}
            {date === today && ' · hoje'}
          </Typography>
          <Paper component="ul" role="list" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {items.map(({ session, patientName }, index) => (
              <Box component="li" key={session.id} sx={{ borderTop: index > 0 ? 1 : 0, borderColor: 'divider' }}>
                <ButtonBase
                  onClick={() => onOpen({ session, patientName })}
                  sx={{ display: 'flex', width: '100%', textAlign: 'left', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, p: 2 }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 48 }}>
                    {session.time ?? 'Sem horário'}
                  </Typography>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, overflowWrap: 'break-word' }}>{patientName}</Typography>
                    <Stack direction="row" alignItems="center" columnGap={1.5} rowGap={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                      <SessionStatusLabel status={session.status} />
                      <Typography variant="body2">{billingLabel(session)}</Typography>
                    </Stack>
                  </Box>
                </ButtonBase>
              </Box>
            ))}
          </Paper>
        </Box>
      ))}
    </Stack>
  )
}
