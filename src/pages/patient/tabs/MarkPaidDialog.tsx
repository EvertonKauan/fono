import { useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import type { Payment, PaymentMethod } from '../../../types/domain.ts'
import { formatPeriod, methodLabel } from '../../../utils/format.ts'

type Props = {
  payment: Payment
  onClose: () => void
  onConfirm: (paidAt: string, method: PaymentMethod) => Promise<void>
}

// Montado só enquanto o lançamento está sendo pago, então o estado é descartado ao fechar.
export default function MarkPaidDialog({ payment, onClose, onConfirm }: Props) {
  const [date, setDate] = useState<Dayjs | null>(() => dayjs())
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const dateValid = date !== null && date.isValid() && !date.isAfter(dayjs())

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!date || !dateValid) return
    setSaving(true)
    await onConfirm(date.format('YYYY-MM-DD'), method)
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="pago-titulo">
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle id="pago-titulo">Marcar como pago — {formatPeriod(payment.period)}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <DatePicker
              label="Data do pagamento"
              value={date}
              onChange={setDate}
              disableFuture
              slotProps={{
                textField: {
                  name: 'paidAt',
                  required: true,
                  fullWidth: true,
                  error: submitted && !dateValid,
                  helperText: submitted && !dateValid ? (date ? 'Data inválida.' : 'Informe a data do pagamento.') : undefined,
                },
              }}
            />
            <TextField
              select
              label="Forma de pagamento"
              name="method"
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              fullWidth
            >
              {(Object.keys(methodLabel) as PaymentMethod[]).map((key) => (
                <MenuItem key={key} value={key}>
                  {methodLabel[key]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            Confirmar pagamento
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
