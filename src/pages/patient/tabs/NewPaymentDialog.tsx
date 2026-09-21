import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useTenantId } from '../../../auth/useSession.ts'
import MoneyField from '../../../components/MoneyField.tsx'
import { useSave } from '../../../components/useSave.ts'
import { createPayment } from '../../../services/payments.ts'
import type { Patient, Payment } from '../../../types/domain.ts'

type Props = { patient: Patient; onClose: () => void; onCreated: (payment: Payment) => Promise<void> }

// Montado só enquanto o Dialog está aberto, então o estado é descartado ao fechar.
export default function NewPaymentDialog({ patient, onClose, onCreated }: Props) {
  const tenantId = useTenantId()
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'))
  const [period, setPeriod] = useState<Dayjs | null>(() => dayjs().startOf('month'))
  const [sessionsText, setSessionsText] = useState(String(Math.max(patient.visit.weekdays.length, 1) * 4))
  const [manualAmount, setManualAmount] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const { saving, error, run } = useSave()

  const sessions = Number(sessionsText)
  const sessionsValid = Number.isInteger(sessions) && sessions >= 1
  const amount = manualAmount ?? (sessionsValid ? sessions * patient.visit.fee : 0)
  const periodValid = period !== null && period.isValid()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!period || !periodValid || !sessionsValid || amount <= 0) return
    await run(async () => {
      const payment = await createPayment(tenantId, {
        patientId: patient.id,
        period: period.format('YYYY-MM'),
        sessions,
        amount,
        status: 'pendente',
      })
      await onCreated(payment)
    })
  }

  return (
    <Dialog open onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="xs" aria-labelledby="lancamento-titulo">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
        <DialogTitle id="lancamento-titulo">Novo lançamento</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <DatePicker
              label="Competência"
              value={period}
              onChange={setPeriod}
              views={['year', 'month']}
              openTo="month"
              format="MM/YYYY"
              slotProps={{
                textField: {
                  name: 'period',
                  required: true,
                  fullWidth: true,
                  error: submitted && !periodValid,
                  helperText: submitted && !periodValid ? 'Informe a competência.' : undefined,
                },
              }}
            />
            <TextField
              label="Número de sessões"
              name="sessions"
              type="number"
              value={sessionsText}
              onChange={(event) => setSessionsText(event.target.value)}
              required
              fullWidth
              error={submitted && !sessionsValid}
              helperText={submitted && !sessionsValid ? 'Informe um número inteiro de sessões.' : undefined}
              slotProps={{ htmlInput: { min: 1, step: 1, inputMode: 'numeric' } }}
            />
            <MoneyField
              label="Valor"
              name="amount"
              value={amount}
              onChange={setManualAmount}
              required
              error={submitted && amount <= 0}
              helperText={
                submitted && amount <= 0
                  ? 'Informe o valor.'
                  : manualAmount === null
                    ? 'Sugerido: sessões × valor da consulta. Você pode alterar.'
                    : undefined
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            Salvar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
