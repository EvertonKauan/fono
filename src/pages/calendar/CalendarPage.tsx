import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import { useTenantId } from '../../auth/useSession.ts'
import SessionDialog from '../../components/SessionDialog.tsx'
import Toast from '../../components/Toast.tsx'
import { listPatients } from '../../services/patients.ts'
import { listSessionsBetween } from '../../services/sessions.ts'
import { buildMonthGrid, currentMonth, groupByDate, monthLabel, parseMonth, shiftMonth } from '../../utils/calendar.ts'
import AgendaList from './AgendaList.tsx'
import MonthGrid from './MonthGrid.tsx'
import { toCalendarItems, type CalendarItem } from './calendarItems.ts'

export default function CalendarPage() {
  const tenantId = useTenantId()
  const isDesktop = useMediaQuery(useTheme().breakpoints.up('md'))
  const [params, setParams] = useSearchParams()
  const month = parseMonth(params.get('mes'))
  const [items, setItems] = useState<CalendarItem[]>()
  const [version, setVersion] = useState(0)
  const [editing, setEditing] = useState<CalendarItem | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const weeks = useMemo(() => buildMonthGrid(month), [month])
  const from = weeks[0]![0]!
  const to = weeks.at(-1)!.at(-1)!

  useEffect(() => {
    let active = true
    Promise.all([listPatients(tenantId), listSessionsBetween(tenantId, from, to)]).then(([patients, sessions]) => {
      if (active) setItems(toCalendarItems(sessions, patients))
    })
    return () => {
      active = false
    }
  }, [tenantId, from, to, version])

  const goTo = (next: string) => setParams({ mes: next }, { replace: true })

  async function saved() {
    setEditing(null)
    setVersion((v) => v + 1)
    setToast('Sessão salva.')
  }

  const label = monthLabel(month)
  const inMonth = (items ?? []).filter((item) => item.session.date.startsWith(month))
  const itemsByDate = new Map<string, CalendarItem[]>()
  for (const item of items ?? []) itemsByDate.set(item.session.date, [...(itemsByDate.get(item.session.date) ?? []), item])
  const days = groupByDate(inMonth.map((item) => ({ ...item, date: item.session.date }))).map(({ date, items: list }) => ({
    date,
    items: list.map(({ session, patientName }) => ({ session, patientName })),
  }))

  return (
    <Stack spacing={2}>
      <Typography variant="h1">Calendário</Typography>

      <Stack direction="row" alignItems="center" gap={1}>
        <IconButton aria-label="Mês anterior" onClick={() => goTo(shiftMonth(month, -1))}>
          <ChevronLeft />
        </IconButton>
        <Typography
          variant="h5"
          component="h2"
          aria-live="polite"
          sx={{ minWidth: { sm: 200 }, textAlign: 'center', '&::first-letter': { textTransform: 'uppercase' } }}
        >
          {label}
        </Typography>
        <IconButton aria-label="Próximo mês" onClick={() => goTo(shiftMonth(month, 1))}>
          <ChevronRight />
        </IconButton>
        <Button variant="outlined" size="small" onClick={() => goTo(currentMonth())} sx={{ ml: { sm: 1 } }}>
          Hoje
        </Button>
      </Stack>

      {items && inMonth.length === 0 && <Typography color="text.secondary">Nenhuma sessão em {label}.</Typography>}
      {items &&
        (isDesktop ? (
          <MonthGrid month={month} weeks={weeks} itemsByDate={itemsByDate} onOpen={setEditing} />
        ) : (
          <AgendaList days={days} onOpen={setEditing} />
        ))}

      {editing && (
        <SessionDialog
          patientId={editing.session.patientId}
          patientName={editing.patientName}
          session={editing.session}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}
      <Toast message={toast} onClose={() => setToast(null)} />
    </Stack>
  )
}
