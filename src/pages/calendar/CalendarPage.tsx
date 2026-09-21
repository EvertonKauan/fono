import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Add from '@mui/icons-material/Add'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import { useTenantId } from '../../auth/useSession.ts'
import SessionDialog from '../../components/SessionDialog.tsx'
import Toast from '../../components/Toast.tsx'
import type { Patient } from '../../types/domain.ts'
import { listPatients } from '../../services/patients.ts'
import { listSessionsBetween } from '../../services/sessions.ts'
import {
  buildMonthGrid,
  groupByDate,
  parseDate,
  parseView,
  rangeLabel,
  shiftDate,
  todayIso,
  viewRange,
  weekOf,
  type CalendarView,
} from '../../utils/calendar.ts'
import { capitalize } from '../../utils/format.ts'
import AgendaList from './AgendaList.tsx'
import MonthGrid from './MonthGrid.tsx'
import SessionPreview from './SessionPreview.tsx'
import TimeGrid from './TimeGrid.tsx'
import { toCalendarItems, type CalendarItem } from './calendarItems.ts'

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: 'mes', label: 'Mês' },
  { value: 'semana', label: 'Semana' },
  { value: 'dia', label: 'Dia' },
]
const PREVIOUS = { mes: 'Mês anterior', semana: 'Semana anterior', dia: 'Dia anterior' } as const
const NEXT = { mes: 'Próximo mês', semana: 'Próxima semana', dia: 'Próximo dia' } as const
const EMPTY = {
  mes: (label: string) => `Nenhuma sessão em ${label}.`,
  semana: (label: string) => `Nenhuma sessão na semana de ${label}.`,
  dia: () => 'Nenhuma sessão neste dia.',
}

export default function CalendarPage() {
  const tenantId = useTenantId()
  const isDesktop = useMediaQuery(useTheme().breakpoints.up('md'))
  const [params, setParams] = useSearchParams()
  const view = parseView(params.get('visao'))
  const date = parseDate(params.get('data'))
  const [items, setItems] = useState<CalendarItem[]>()
  const [patients, setPatients] = useState<Patient[]>()
  const [version, setVersion] = useState(0)
  const [preview, setPreview] = useState<{ item: CalendarItem; anchor: HTMLElement } | null>(null)
  const [editing, setEditing] = useState<CalendarItem | null>(null)
  const [creating, setCreating] = useState<{ date: string; time?: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const { from, to } = useMemo(() => viewRange(date, view), [date, view])

  useEffect(() => {
    let active = true
    Promise.all([listPatients(tenantId), listSessionsBetween(tenantId, from, to)]).then(([all, sessions]) => {
      if (!active) return
      setPatients(all)
      setItems(toCalendarItems(sessions, all))
    })
    return () => {
      active = false
    }
  }, [tenantId, from, to, version])

  // Trocar de visão ou de dia é uma navegação (o Voltar do navegador desfaz); anterior/próximo/Hoje só substituem.
  const goTo = (nextView: CalendarView, nextDate: string, replace = false) => {
    setPreview(null)
    setParams({ visao: nextView, data: nextDate }, { replace })
  }

  async function saved() {
    setEditing(null)
    setCreating(null)
    setVersion((v) => v + 1)
    setToast('Sessão salva.')
  }

  const label = rangeLabel(date, view)
  const shown = view === 'mes' ? (items ?? []).filter((item) => item.session.date.startsWith(date.slice(0, 7))) : (items ?? [])
  const itemsByDate = new Map<string, CalendarItem[]>()
  for (const item of items ?? []) itemsByDate.set(item.session.date, [...(itemsByDate.get(item.session.date) ?? []), item])
  const days = groupByDate(shown.map((item) => ({ ...item, date: item.session.date }))).map(({ date: day, items: list }) => ({
    date: day,
    items: list.map(({ session, patientName }) => ({ session, patientName })),
  }))
  const openPreview = (item: CalendarItem, anchor: HTMLElement) => setPreview({ item, anchor })
  const openDay = (day: string) => goTo('dia', day)
  const createAt = (day: string, time?: string) => setCreating({ date: day, time })

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Typography variant="h1">Calendário</Typography>
        <Button variant="contained" startIcon={<Add />} disabled={!patients} onClick={() => setCreating({ date: todayIso() })}>
          Nova sessão
        </Button>
      </Stack>

      <Stack direction="row" alignItems="center" flexWrap="wrap" columnGap={1} rowGap={1.5}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <IconButton aria-label={PREVIOUS[view]} onClick={() => goTo(view, shiftDate(date, view, -1), true)}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h5" component="h2" aria-live="polite" sx={{ flex: '1 1 auto', minWidth: 0, textAlign: 'center' }}>
            {capitalize(label)}
          </Typography>
          <IconButton aria-label={NEXT[view]} onClick={() => goTo(view, shiftDate(date, view, 1), true)}>
            <ChevronRight />
          </IconButton>
          <Button variant="outlined" size="small" onClick={() => goTo(view, todayIso(), true)}>
            Hoje
          </Button>
        </Stack>
        <ToggleButtonGroup
          size="small"
          color="primary"
          exclusive
          value={view}
          onChange={(_, next: CalendarView | null) => next && goTo(next, date)}
          aria-label="Visão do calendário"
          sx={{ width: { xs: '100%', sm: 'auto' }, '& .MuiToggleButton-root': { flex: { xs: 1, sm: 'none' }, px: { sm: 2 } } }}
        >
          {VIEWS.map(({ value, label: text }) => (
            <ToggleButton key={value} value={value}>
              {text}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {items && shown.length === 0 && <Typography color="text.secondary">{EMPTY[view](label)}</Typography>}
      {items && (
        <Box>
          {view === 'dia' ? (
            <TimeGrid label={label} dates={[date]} items={items} onOpen={openPreview} onCreate={createAt} />
          ) : view === 'semana' && isDesktop ? (
            <TimeGrid label={`Semana de ${label}`} dates={weekOf(date)} items={items} onOpen={openPreview} onOpenDay={openDay} onCreate={createAt} />
          ) : view === 'mes' && isDesktop ? (
            <MonthGrid month={date.slice(0, 7)} weeks={buildMonthGrid(date.slice(0, 7))} itemsByDate={itemsByDate} onOpen={openPreview} onOpenDay={openDay} onCreate={createAt} />
          ) : (
            <AgendaList days={days} onOpen={openPreview} onOpenDay={openDay} />
          )}
        </Box>
      )}

      {preview && (
        <SessionPreview
          item={preview.item}
          anchorEl={preview.anchor}
          onClose={() => setPreview(null)}
          onEdit={() => {
            setEditing(preview.item)
            setPreview(null)
          }}
        />
      )}
      {creating && patients && (
        <SessionDialog
          patients={patients}
          initialDate={creating.date}
          initialTime={creating.time}
          onClose={() => setCreating(null)}
          onSaved={saved}
        />
      )}
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
