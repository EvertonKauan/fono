import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { useTenantId } from '../../../auth/useSession.ts'
import Toast from '../../../components/Toast.tsx'
import { useSave } from '../../../components/useSave.ts'
import { listPayments, savePayment } from '../../../services/payments.ts'
import type { Patient, Payment, PaymentMethod } from '../../../types/domain.ts'
import { formatCurrency } from '../../../utils/format.ts'
import EditPaymentDialog from './EditPaymentDialog.tsx'
import MarkPaidDialog from './MarkPaidDialog.tsx'
import PaymentsList from './PaymentsList.tsx'
import { availableYears, byPeriodDesc, defaultYear, summarize, yearOf } from './financeiro.ts'

type Props = {
  patient: Patient
  payments: Payment[]
  onPaymentsChange: (payments: Payment[]) => void
}

// Os lançamentos nascem das sessões Realizadas (RF-08); aqui só se edita o valor, marca como pago e desfaz.
export default function FinanceiroTab({ patient, payments, onPaymentsChange }: Props) {
  const tenantId = useTenantId()
  const currentYear = dayjs().year()
  const [year, setYear] = useState(() => defaultYear(payments, currentYear))
  const [paying, setPaying] = useState<Payment | null>(null)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const undoSave = useSave()

  const yearPayments = payments.filter((p) => yearOf(p.period) === year).sort(byPeriodDesc)
  const summary = summarize(payments, year)

  const refreshPayments = async () => onPaymentsChange(await listPayments(tenantId, patient.id))

  async function markPaid(payment: Payment, paidAt: string, method: PaymentMethod) {
    await savePayment(tenantId, { ...payment, status: 'pago', paidAt, method })
    await refreshPayments()
    setPaying(null)
    setToast('Pagamento registrado.')
  }

  async function undo(payment: Payment) {
    await undoSave.run(async () => {
      await savePayment(tenantId, { ...payment, status: 'pendente', paidAt: undefined, method: undefined })
      await refreshPayments()
      setToast('Pagamento desfeito.')
    })
  }

  async function editAmount(payment: Payment, amount: number) {
    await savePayment(tenantId, { ...payment, amount })
    await refreshPayments()
    setEditing(null)
    setToast('Valor atualizado.')
  }

  return (
    <Stack spacing={4}>
      <Box component="section">
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
          <Typography variant="h5" component="h2">
            Lançamentos
          </Typography>
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
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2, mb: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Pendente em {year}
            </Typography>
            <Typography variant="h4" component="p" color={summary.pending > 0 ? 'error' : 'text.primary'} sx={{ overflowWrap: 'anywhere' }}>
              {formatCurrency(summary.pending)}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Pago em {year}
            </Typography>
            <Typography variant="h4" component="p" sx={{ overflowWrap: 'anywhere' }}>
              {formatCurrency(summary.paid)}
            </Typography>
          </Paper>
        </Box>

        {undoSave.error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {undoSave.error}
          </Alert>
        )}
        <PaymentsList year={year} payments={yearPayments} onEdit={setEditing} onMarkPaid={setPaying} onUndo={undo} />
      </Box>

      {editing && <EditPaymentDialog payment={editing} onClose={() => setEditing(null)} onConfirm={(amount) => editAmount(editing, amount)} />}
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
