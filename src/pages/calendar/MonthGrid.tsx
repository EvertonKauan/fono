import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import { fullDayLabel, monthLabel, todayIso } from '../../utils/calendar.ts'
import { sessionStatusLabel, weekdayLong, weekdayShort } from '../../utils/format.ts'
import type { CalendarItem } from './calendarItems.ts'

type Props = {
  month: string
  weeks: string[][]
  itemsByDate: Map<string, CalendarItem[]>
  onOpen: (item: CalendarItem, anchor: HTMLElement) => void
  onOpenDay: (date: string) => void
}

const border = { border: 1, borderColor: 'divider' } as const

// A partir de md: grade de semanas (domingo a sábado); dias vizinhos ao mês ficam esmaecidos.
export default function MonthGrid({ month, weeks, itemsByDate, onOpen, onOpenDay }: Props) {
  const today = todayIso()

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        component="table"
        aria-label={`Calendário de ${monthLabel(month)}`}
        sx={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}
      >
        <thead>
          <tr>
            {weekdayShort.map((label, day) => (
              <Box component="th" scope="col" key={label} abbr={weekdayLong[day]} sx={{ ...border, py: 0.5, fontSize: '0.8125rem', fontWeight: 600, bgcolor: 'background.paper' }}>
                {label}
              </Box>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((date) => {
                const inMonth = date.startsWith(month)
                const isToday = date === today
                return (
                  <Box
                    component="td"
                    key={date}
                    sx={{ ...border, verticalAlign: 'top', height: 112, p: 0.5, bgcolor: inMonth ? 'background.paper' : 'background.default' }}
                  >
                    <ButtonBase
                      onClick={() => onOpenDay(date)}
                      title={`Ver dia ${fullDayLabel(date)}`}
                      aria-label={`Ver dia ${fullDayLabel(date)}`}
                      sx={{ display: 'block', mb: 0.25, px: 0.5, borderRadius: 0.5, '&:hover, &:focus-visible': { bgcolor: 'action.hover' } }}
                    >
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ fontWeight: isToday ? 700 : 400, color: isToday ? 'primary.main' : inMonth ? 'text.primary' : 'text.secondary' }}
                      >
                        {Number(date.slice(8))}
                        {isToday && ' · hoje'}
                      </Typography>
                    </ButtonBase>
                    <Stack spacing={0.25}>
                      {(itemsByDate.get(date) ?? []).map(({ session, patientName }) => {
                        const label = `${session.time ?? 'Sem horário'} ${patientName} — ${sessionStatusLabel[session.status]}`
                        return (
                          <ButtonBase
                            key={session.id}
                            onClick={(event) => onOpen({ session, patientName }, event.currentTarget)}
                            title={label}
                            aria-label={label}
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-start',
                              width: '100%',
                              gap: 0.5,
                              px: 0.5,
                              py: 0.25,
                              borderRadius: 0.5,
                              textAlign: 'left',
                              '&:hover, &:focus-visible': { bgcolor: 'action.hover' },
                            }}
                          >
                            {session.status === 'realizada' && <CheckCircleOutline sx={{ fontSize: 14 }} />}
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{
                                minWidth: 0,
                                ...(session.status === 'cancelada' && { textDecoration: 'line-through', color: 'text.secondary' }),
                              }}
                            >
                              {session.time ?? '—'} {patientName}
                            </Typography>
                          </ButtonBase>
                        )
                      })}
                    </Stack>
                  </Box>
                )
              })}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  )
}
