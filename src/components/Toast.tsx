import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

export default function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  return (
    <Snackbar open={message !== null} autoHideDuration={4000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert severity="success" onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  )
}
