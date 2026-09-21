import Chip from "@mui/material/Chip";

type Props = { pending: boolean; paidLabel?: string };

export default function PaymentChip({ pending, paidLabel = "Em dia" }: Props) {
  return pending ? (
    <Chip label="Pendente" color="error" />
  ) : (
    <Chip label={paidLabel} color="primary" variant="outlined" />
  );
}
