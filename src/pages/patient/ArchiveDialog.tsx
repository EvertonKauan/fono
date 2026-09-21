import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useSave } from '../../components/useSave.ts'

type Props = { patientName: string; onClose: () => void; onConfirm: () => Promise<void> }

// Montado só enquanto a confirmação está aberta, então o estado é descartado ao fechar.
export default function ArchiveDialog({ patientName, onClose, onConfirm }: Props) {
  const { saving, error, run } = useSave()

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="arquivar-titulo">
      <DialogTitle id="arquivar-titulo">Arquivar paciente?</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>
            {patientName} sai da lista de pacientes e do calendário, mas nada é apagado. Dá para desarquivar quando quiser.
          </DialogContentText>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={() => run(onConfirm)} disabled={saving}>
          Arquivar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
