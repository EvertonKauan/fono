import { useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import Add from '@mui/icons-material/Add'
import dayjs from 'dayjs'
import { useTenantId } from '../../../auth/useSession.ts'
import MoneyField from '../../../components/MoneyField.tsx'
import Toast from '../../../components/Toast.tsx'
import { savePatient } from '../../../services/patients.ts'
import { listPayments, savePayment } from '../../../services/payments.ts'
import type { Patient, Payment, PaymentMethod } from '../../../types/domain.ts'
import { formatCurrency, weekdayLong, weekdayShort } from '../../../utils/format.ts'
import MarkPaidDialog from './MarkPaidDialog.tsx'
import NewPaymentDialog from './NewPaymentDialog.tsx'
import PaymentsList from './PaymentsList.tsx'
import { availableYears, byPeriodDesc, defaultYear, summarize, yearOf } from './financeiro.ts'

type Props = {
  patient: Patient
  payments: Payment[]
  onPatientSaved: (patient: Patient) => void
  onPaymentsChange: (payments: Payment[]) => void
}

export default function FinanceiroTab({ patient, payments, onPatientSaved, onPaymentsChange }: Props) {
  const tenantId = useTenantId()
  const currentYear = dayjs().year()
  const [visit, setVisit] = useState(patient.visit)
  const [year, setYear] = useState(() => defaultYear(payments, currentYear))
  const [creating, setCreating] = useState(false)
  const [paying, setPaying] = useState<Payment | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const yearPayments = payments.filter((p) => yearOf(p.period) === year).sort(byPeriodDesc)
  const summary = summarize(payments, year)

  async function saveVisit(event: FormEvent) {
    event.preventDefault()
    onPatientSaved(await savePatient(tenantId, { ...patient, visit: { ...visit, time: visit.time || undefined } }))
    setToast('Atendimento salvo.')
  }

  const refreshPayments = async () => onPaymentsChange(await listPayments(tenantId, patient.id))

  async function markPaid(payment: Payment, paidAt: string, method: PaymentMethod) {
    await savePayment(tenantId, { ...payment, status: 'pago', paidAt, method })
    await refreshPayments()
    setPaying(null)
    setToast('Pagamento registrado.')
  }

  async function undo(payment: Payment) {
    await savePayment(tenantId, { ...payment, status: 'pendente', paidAt: undefined, method: undefined })
    await refreshPayments()
    setToast('Pagamento desfeito.')
  }

  async function created(payment: Payment) {
    await refreshPayments()
    setYear(yearOf(payment.period))
    setCreating(false)
    setToast('Lançamento criado.')
  }

  return (
    <Stack spacing={4}>
      <Box component="section">
        <Typography variant="h5" component="h2" sx={{ mb: 1.5 }}>
          Atendimento
        </Typography>
        <Paper component="form" noValidate onSubmit={saveVisit} sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
              <MoneyField
                label="Valor da consulta"
                name="fee"
                value={visit.fee}
                onChange={(fee) => setVisit({ ...visit, fee })}
              />
              <TextField
                label="Horário (opcional)"
                name="time"
                type="time"
                value={visit.time ?? ''}
                onChange={(event) => setVisit({ ...visit, time: event.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <Box>
              <Typography id="dias-label" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Dias de atendimento
              </Typography>
              <ToggleButtonGroup
                size="small"
                color="primary"
                value={visit.weekdays}
                onChange={(_, weekdays: number[]) => setVisit({ ...visit, weekdays })}
                aria-labelledby="dias-label"
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  '& .MuiToggleButton-root': { flex: { xs: 1, sm: 'none' }, px: { xs: 0.5, sm: 2 } },
                }}
              >
                {weekdayShort.map((label, day) => (
                  <ToggleButton key={day} value={day} aria-label={weekdayLong[day]}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <Box>
              <Button type="submit" variant="contained">
                Salvar atendimento
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>

      <Box component="section">
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
          <Typography variant="h5" component="h2">
            Lançamentos
          </Typography>
          <Stack direction="row" gap={1} alignItems="center">
            <TextField
              select
              label="Ano"
              name="year"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              sx={{ minWidth: 100 }}
            >
              {availableYears(payments, currentYear).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreating(true)}>
              Novo lançamento
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2, mb: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Pendente em {year}
            </Typography>
            <Typography variant="h4" component="p" color={summary.pending > 0 ? 'error' : 'text.primary'}>
              {formatCurrency(summary.pending)}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Pago em {year}
            </Typography>
            <Typography variant="h4" component="p">
              {formatCurrency(summary.paid)}
            </Typography>
          </Paper>
        </Box>

        <PaymentsList payments={yearPayments} onMarkPaid={setPaying} onUndo={undo} />
      </Box>

      {creating && <NewPaymentDialog patient={patient} onClose={() => setCreating(false)} onCreated={created} />}
      {paying && (
        <MarkPaidDialog
          payment={paying}
          onClose={() => setPaying(null)}
          onConfirm={(paidAt, method) => markPaid(paying, paidAt, method)}
        />
      )}
      <Toast message={toast} onClose={() => setToast(null)} />
    </Stack>
  )
}
