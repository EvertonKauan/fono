import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import EventNote from '@mui/icons-material/EventNote'
import Payments from '@mui/icons-material/Payments'
import People from '@mui/icons-material/People'
import type { PatientsSummary as Summary } from './patientRows.ts'

type Tone = 'primary' | 'error'

type StatProps = {
  icon: ReactNode
  label: string
  value: number
  note: string
  tone?: Tone
  pressed?: boolean // só nos indicadores que filtram a lista
  onClick?: () => void
}

function Stat({ icon, label, value, note, tone = 'primary', pressed, onClick }: StatProps) {
  const body = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, minWidth: 0 }}>
      <Box
        aria-hidden
        sx={(theme) => ({
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          width: 48,
          height: 48,
          borderRadius: 1,
          color: `${tone}.main`,
          backgroundColor: alpha(theme.palette[tone].main, 0.12),
        })}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h1" component="p" color={tone === 'error' ? 'error' : 'text.primary'} sx={{ lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {note}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Paper sx={{ borderLeftWidth: 4, borderLeftColor: `${tone}.main`, overflow: 'hidden' }}>
      {onClick ? (
        <ButtonBase
          onClick={onClick}
          aria-pressed={pressed}
          sx={(theme) => ({
            display: 'block',
            width: '100%',
            textAlign: 'left',
            backgroundColor: pressed ? alpha(theme.palette[tone].main, 0.08) : 'transparent',
            '&:hover, &:focus-visible': { backgroundColor: alpha(theme.palette[tone].main, 0.08) },
          })}
        >
          {body}
        </ButtonBase>
      ) : (
        body
      )}
    </Paper>
  )
}

type Props = {
  summary: Summary
  weekSessions: number
  onlyPending: boolean
  onTogglePending: () => void
}

// Faixa de indicadores da lista (a partir de md). O de pendências também filtra a lista.
export default function PatientsSummary({ summary, weekSessions, onlyPending, onTogglePending }: Props) {
  return (
    <Box
      component="section"
      aria-label="Resumo"
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 2 }}
    >
      <Stat icon={<People />} label="Pacientes ativos" value={summary.active} note={`de ${summary.total} cadastrados`} />
      <Stat
        icon={<Payments />}
        label="Pagamento pendente"
        value={summary.pending}
        note={onlyPending ? 'Mostrando só esses; clique para ver todos' : 'Clique para ver só esses'}
        tone="error"
        pressed={onlyPending}
        onClick={onTogglePending}
      />
      <Stat icon={<EventNote />} label="Sessões nesta semana" value={weekSessions} note="agendadas e realizadas" />
    </Box>
  )
}
