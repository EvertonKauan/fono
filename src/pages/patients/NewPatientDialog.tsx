import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type { Dayjs } from 'dayjs'
import { useTenantId } from '../../auth/useSession.ts'
import PhoneField from '../../components/PhoneField.tsx'
import { useSave } from '../../components/useSave.ts'
import { createPatient } from '../../services/patients.ts'
import type { PatientKind } from '../../types/domain.ts'
import { isMinor } from '../../utils/age.ts'

type Props = { open: boolean; onClose: () => void }

export default function NewPatientDialog({ open, onClose }: Props) {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'))

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => reason !== 'backdropClick' && onClose()}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="novo-paciente-titulo"
    >
      <NewPatientForm onClose={onClose} />
    </Dialog>
  )
}

// Montado só enquanto o Dialog está aberto, então o estado é descartado ao fechar.
function NewPatientForm({ onClose }: { onClose: () => void }) {
  const tenantId = useTenantId()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState<Dayjs | null>(null)
  const [kind, setKind] = useState<PatientKind>('adulto')
  const [kindChanged, setKindChanged] = useState(false)
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { saving, error, run } = useSave()

  const birthValid = birthDate !== null && birthDate.isValid()
  const nameError = submitted && fullName.trim() === ''
  const birthError = submitted && !birthValid

  function handleBirthChange(value: Dayjs | null) {
    setBirthDate(value)
    if (!kindChanged && value?.isValid()) setKind(isMinor(value.format('YYYY-MM-DD')) ? 'crianca' : 'adulto')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (fullName.trim() === '' || !birthDate || !birthValid) return
    await run(async () => {
      const patient = await createPatient(tenantId, {
        fullName: fullName.trim(),
        birthDate: birthDate.format('YYYY-MM-DD'),
        kind,
        phone: phone.trim() || undefined,
      })
      navigate(`/pacientes/${patient.id}?aba=dados`)
    })
  }

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}
    >
      <DialogTitle id="novo-paciente-titulo">Novo paciente</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Nome completo"
            name="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            fullWidth
            error={nameError}
            helperText={nameError ? 'Informe o nome completo.' : undefined}
            slotProps={{ htmlInput: { autoComplete: 'off' } }}
          />
          <DatePicker
            label="Data de nascimento"
            value={birthDate}
            onChange={handleBirthChange}
            disableFuture
            openTo="year"
            views={['year', 'month', 'day']}
            slotProps={{
              textField: {
                name: 'birthDate',
                required: true,
                fullWidth: true,
                error: birthError,
                helperText: birthError ? (birthDate ? 'Data inválida.' : 'Informe a data de nascimento.') : undefined,
              },
            }}
          />
          <TextField
            select
            label="Tipo"
            name="kind"
            value={kind}
            onChange={(event) => {
              setKind(event.target.value as PatientKind)
              setKindChanged(true)
            }}
            fullWidth
            helperText={birthValid && !kindChanged ? 'Sugerido pela idade; você pode alterar.' : undefined}
          >
            <MenuItem value="crianca">Criança</MenuItem>
            <MenuItem value="adulto">Adulto</MenuItem>
          </TextField>
          <PhoneField label="Telefone" name="phone" value={phone} onChange={setPhone} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={saving}>
          Salvar
        </Button>
      </DialogActions>
    </Box>
  )
}
