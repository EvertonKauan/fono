import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import { fullDayLabel, slotOf, slotRange, todayIso } from '../../utils/calendar.ts'
import { sessionStatusLabel, weekdayShort } from '../../utils/format.ts'
import type { CalendarItem } from './calendarItems.ts'

type Props = {
  label: string
  dates: string[]
  items: CalendarItem[]
  onOpen: (item: CalendarItem, anchor: HTMLElement) => void
  onOpenDay?: (date: string) => void
  onCreate: (date: string, time: string) => void
}

const visuallyHidden = {
  position: 'absolute',
  width: '1px', // no sx do MUI, 1 (sem unidade) vale 100%
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const

const line = { borderTop: 1, borderTopColor: 'divider' } as const
const cellBorder = { borderLeft: 1, borderLeftColor: 'divider' } as const

const byTimeThenName = (a: CalendarItem, b: CalendarItem) =>
  (a.session.time ?? '').localeCompare(b.session.time ?? '') || a.patientName.localeCompare(b.patientName, 'pt-BR')

// Semana (a partir de md, 7 dias) e Dia (todas as larguras, 1 dia): linhas de 30 minutos, uma coluna por dia.
// A sessão não tem duração: ocupa a fatia do seu horário; na mesma fatia ficam empilhadas.
// Célula vazia é alvo de clique/toque para criar sessão (fora da ordem de tabulação; o teclado usa "Nova sessão").
export default function TimeGrid({ label, dates, items, onOpen, onOpenDay, onCreate }: Props) {
  const today = todayIso()
  const untimed = new Map<string, CalendarItem[]>()
  const bySlot = new Map<string, CalendarItem[]>()
  for (const item of [...items].sort(byTimeThenName)) {
    const { date, time } = item.session
    const key = time ? `${date}|${slotOf(time)}` : date
    const target = time ? bySlot : untimed
    target.set(key, [...(target.get(key) ?? []), item])
  }
  const slots = slotRange(items.flatMap(({ session }) => (session.time ? [session.time] : [])))

  const renderItems = (list: CalendarItem[] | undefined) =>
    list && (
      <Stack spacing={0.25}>
        {list.map((item) => {
          const { session, patientName } = item
          const text = `${session.time ?? 'Sem horário'} ${patientName} — ${sessionStatusLabel[session.status]}`
          return (
            <ButtonBase
              key={session.id}
              onClick={(event) => onOpen(item, event.currentTarget)}
              title={text}
              aria-label={text}
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                width: '100%',
                gap: 0.5,
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5,
                border: 1,
                borderColor: 'divider',
                borderLeftWidth: 3,
                borderLeftColor: session.status === 'cancelada' ? 'divider' : 'primary.main',
                bgcolor: 'background.paper',
                textAlign: 'left',
                '&:hover, &:focus-visible': { bgcolor: 'action.hover' },
              }}
            >
              {session.status === 'realizada' && <CheckCircleOutline sx={{ fontSize: 14, mt: 0.25 }} />}
              <Typography
                variant="caption"
                sx={{
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  ...(session.status === 'cancelada' && { textDecoration: 'line-through', color: 'text.secondary' }),
                }}
              >
                {session.time ? `${session.time} ` : ''}
                {patientName}
              </Typography>
            </ButtonBase>
          )
        })}
      </Stack>
    )

  const columnBg = (date: string) => (date === today ? 'action.hover' : 'transparent')

  return (
    <Box
      component="table"
      aria-label={label}
      sx={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <thead>
        <tr>
          <Box component="th" scope="col" sx={{ width: 56, position: 'sticky', top: 'var(--app-bar-height, 49px)', zIndex: 1, bgcolor: 'background.paper' }}>
            <Box component="span" sx={visuallyHidden}>
              Horário
            </Box>
          </Box>
          {dates.map((date) => {
            const isToday = date === today
            const head = (
              <>
                <Typography component="span" variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                  {weekdayShort[dayjs(date).day()]}
                </Typography>
                <Typography component="span" variant="h6" sx={{ display: 'block', lineHeight: 1.2 }}>
                  {Number(date.slice(8))}
                </Typography>
                {isToday && <Box component="span" sx={visuallyHidden}> (hoje)</Box>}
              </>
            )
            return (
              <Box
                component="th"
                scope="col"
                key={date}
                sx={{
                  ...cellBorder,
                  position: 'sticky',
                  top: 'var(--app-bar-height, 49px)',
                  zIndex: 1,
                  py: 0.5,
                  bgcolor: 'background.paper',
                  color: isToday ? 'primary.main' : 'text.primary',
                  borderBottom: 2,
                  borderBottomColor: isToday ? 'primary.main' : 'divider',
                }}
              >
                {onOpenDay ? (
                  <ButtonBase
                    onClick={() => onOpenDay(date)}
                    title={`Ver dia ${fullDayLabel(date)}`}
                    sx={{ display: 'block', width: '100%', py: 0.25, color: 'inherit', font: 'inherit', '&:hover, &:focus-visible': { bgcolor: 'action.hover' } }}
                  >
                    {head}
                  </ButtonBase>
                ) : (
                  head
                )}
              </Box>
            )
          })}
        </tr>
      </thead>
      <tbody>
        <tr>
          <Box component="th" scope="row" sx={{ ...line, p: 0.5, verticalAlign: 'top', fontWeight: 400 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
              Sem horário
            </Typography>
          </Box>
          {dates.map((date) => (
            <Box component="td" key={date} sx={{ ...line, ...cellBorder, p: 0.25, verticalAlign: 'top', bgcolor: columnBg(date) }}>
              {renderItems(untimed.get(date))}
            </Box>
          ))}
        </tr>
        {slots.map((slot) => {
          const onTheHour = slot.endsWith(':00')
          return (
            <tr key={slot}>
              <Box
                component="th"
                scope="row"
                sx={{ borderTop: 1, borderTopColor: onTheHour ? 'divider' : 'transparent', p: 0.5, verticalAlign: 'top', fontWeight: 400, textAlign: 'right' }}
              >
                <Typography variant="caption" color="text.secondary">
                  {slot}
                </Typography>
              </Box>
              {dates.map((date) => {
                const cellItems = bySlot.get(`${date}|${slot}`)
                return (
                <Box
                  component="td"
                  key={date}
                  onClick={cellItems ? undefined : () => onCreate(date, slot)}
                  sx={{
                    ...cellBorder,
                    borderTop: 1,
                    borderTopColor: 'divider',
                    borderTopStyle: onTheHour ? 'solid' : 'dotted',
                    height: 40,
                    p: 0.25,
                    verticalAlign: 'top',
                    bgcolor: columnBg(date),
                    ...(!cellItems && { cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }),
                  }}
                >
                  {renderItems(cellItems)}
                </Box>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </Box>
  )
}
