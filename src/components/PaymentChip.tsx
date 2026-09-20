import Chip from '@mui/material/Chip'

export default function PaymentChip({ pending }: { pending: boolean }) {
  return pending ? (
    <Chip label="Pendente" color="error" />
  ) : (
    <Chip label="Em dia" color="primary" variant="outlined" />
  )
}
