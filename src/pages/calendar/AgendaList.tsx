import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import SessionStatusLabel from '../../components/SessionStatusLabel.tsx'
import { dayLabel, fullDayLabel, todayIso } from '../../utils/calendar.ts'
import { billingLabel, capitalize } from '../../utils/format.ts'
import type { CalendarItem } from './calendarItems.ts'

type Props = {
  days: { date: string; items: CalendarItem[] }[]
  onOpen: (item: CalendarItem, anchor: HTMLElement) => void
  onOpenDay: (date: string) => void
}

// Abaixo de md (Mês e Semana): só os dias com sessão; o título do dia leva à visão Dia.
export default function AgendaList({ days, onOpen, onOpenDay }: Props) {
  const today = todayIso()

  return (
    <Stack spacing={2}>
      {days.map(({ date, items }) => (
        <Box component="section" key={date}>
          <Typography variant="h6" component="h3" sx={{ mb: 0.75 }}>
            <ButtonBase
              onClick={() => onOpenDay(date)}
              title={`Ver dia ${fullDayLabel(date)}`}
              sx={{ font: 'inherit', textAlign: 'left', borderRadius: 0.5, '&:hover, &:focus-visible': { textDecoration: 'underline' } }}
            >
              {capitalize(dayLabel(date))}
              {date === today && ' · hoje'}
            </ButtonBase>
          </Typography>
          <Paper component="ul" role="list" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {items.map(({ session, patientName }, index) => (
              <Box component="li" key={session.id} sx={{ borderTop: index > 0 ? 1 : 0, borderColor: 'divider' }}>
                <ButtonBase
                  onClick={(event) => onOpen({ session, patientName }, event.currentTarget)}
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
