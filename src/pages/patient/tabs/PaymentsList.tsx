import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import PaymentChip from '../../../components/PaymentChip.tsx'
import type { Payment } from '../../../types/domain.ts'
import { formatCurrency, formatDate, formatPeriod, methodLabel } from '../../../utils/format.ts'

type Props = {
  year: number
  payments: Payment[]
  onEdit: (payment: Payment) => void
  onMarkPaid: (payment: Payment) => void
  onUndo: (payment: Payment) => void
}

const paidOn = (payment: Payment) => (payment.paidAt ? formatDate(payment.paidAt) : '—')
const methodOf = (payment: Payment) => (payment.method ? methodLabel[payment.method] : '—')

function Actions({ payment, onEdit, onMarkPaid, onUndo }: { payment: Payment } & Pick<Props, 'onEdit' | 'onMarkPaid' | 'onUndo'>) {
  const period = formatPeriod(payment.period)
  return (
    <Stack direction="row" gap={0.5} flexWrap="wrap">
      <Button size="small" onClick={() => onEdit(payment)} aria-label={`Editar valor do lançamento de ${period}`}>
        Editar valor
      </Button>
      {payment.status === 'pendente' ? (
        <Button size="small" variant="outlined" onClick={() => onMarkPaid(payment)} aria-label={`Marcar como pago o lançamento de ${period}`}>
          Marcar como pago
        </Button>
      ) : (
        <Button size="small" onClick={() => onUndo(payment)} aria-label={`Desfazer pagamento de ${period}`}>
          Desfazer
        </Button>
      )}
    </Stack>
  )
}

export default function PaymentsList({ year, payments, onEdit, onMarkPaid, onUndo }: Props) {
  const isDesktop = useMediaQuery(useTheme().breakpoints.up('md'))

  if (payments.length === 0) {
    return (
      <Typography color="text.secondary">
        Nenhum lançamento em {year}. Eles são criados quando uma sessão é marcada como Realizada.
      </Typography>
    )
  }

  if (isDesktop) {
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Competência', 'Sessões', 'Valor', 'Status', 'Data do pagamento', 'Forma', 'Ações'].map((label) => (
                <TableCell key={label} scope="col" sx={{ fontWeight: 600 }}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{formatPeriod(payment.period)}</TableCell>
                <TableCell>{payment.sessions}</TableCell>
                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                <TableCell>
                  <PaymentChip pending={payment.status === 'pendente'} paidLabel="Pago" />
                </TableCell>
                <TableCell>{paidOn(payment)}</TableCell>
                <TableCell>{methodOf(payment)}</TableCell>
                <TableCell>
                  <Actions payment={payment} onEdit={onEdit} onMarkPaid={onMarkPaid} onUndo={onUndo} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <Stack component="ul" role="list" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {payments.map((payment) => (
        <li key={payment.id}>
          <Card sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
              <Typography variant="h6" component="h3">
                {formatPeriod(payment.period)}
              </Typography>
              <PaymentChip pending={payment.status === 'pendente'} paidLabel="Pago" />
            </Stack>
            <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.25, m: 0, my: 1 }}>
              {[
                ['Sessões', String(payment.sessions)],
                ['Valor', formatCurrency(payment.amount)],
                ['Data do pagamento', paidOn(payment)],
                ['Forma', methodOf(payment)],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: 'contents' }}>
                  <Typography component="dt" variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Actions payment={payment} onEdit={onEdit} onMarkPaid={onMarkPaid} onUndo={onUndo} />
          </Card>
        </li>
      ))}
    </Stack>
  )
}
