import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MoneyField from "../../../components/MoneyField.tsx";
import { useSave } from "../../../components/useSave.ts";
import type { Payment } from "../../../types/domain.ts";
import { formatPeriod } from "../../../utils/format.ts";

type Props = {
  payment: Payment;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
};

// Montado só enquanto o Dialog está aberto, então o estado é descartado ao fechar.
export default function EditPaymentDialog({
  payment,
  onClose,
  onConfirm,
}: Props) {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down("sm"));
  const [amount, setAmount] = useState<number | null>(payment.amount);
  const [submitted, setSubmitted] = useState(false);
  const { saving, error, run } = useSave();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (amount === null) return;
    await run(() => onConfirm(amount));
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
      aria-labelledby="valor-titulo"
    >
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        <DialogTitle id="valor-titulo">
          Editar valor — {formatPeriod(payment.period)}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <MoneyField
              label="Valor"
              name="amount"
              value={amount}
              onChange={(next) => setAmount(next > 0 ? next : null)}
              required
              error={submitted && amount === null}
              helperText={"Informe o valor."}
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
  );
}
