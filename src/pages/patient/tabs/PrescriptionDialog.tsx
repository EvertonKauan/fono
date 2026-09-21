import { useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Add from '@mui/icons-material/Add'
import ArrowDownward from '@mui/icons-material/ArrowDownward'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
import Delete from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useTenantId } from '../../../auth/useSession.ts'
import { createPrescription, savePrescription } from '../../../services/prescriptions.ts'
import { newId } from '../../../utils/id.ts'
import type { Prescription } from '../../../types/domain.ts'

type Props = {
  patientId: string
  prescription?: Prescription // ausente = nova prescrição
  onClose: () => void
  onSaved: () => Promise<void>
}

type Draft = { key: string; title: string; description: string }

const blank = (): Draft => ({ key: newId(), title: '', description: '' })

// Montado só enquanto o Dialog está aberto, então o estado é descartado ao fechar.
export default function PrescriptionDialog({ patientId, prescription, onClose, onSaved }: Props) {
  const tenantId = useTenantId()
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'))
  const [date, setDate] = useState<Dayjs | null>(() => dayjs(prescription?.date))
  const [exercises, setExercises] = useState<Draft[]>(() =>
    prescription ? prescription.exercises.map((e) => ({ ...e, key: newId() })) : [blank()],
  )
  const [frequency, setFrequency] = useState(prescription?.frequency ?? '')
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const dateValid = date !== null && date.isValid()
  const titlesValid = exercises.every((e) => e.title.trim() !== '')
  const valid = dateValid && exercises.length > 0 && titlesValid

  const update = (key: string, patch: Partial<Draft>) =>
    setExercises(exercises.map((e) => (e.key === key ? { ...e, ...patch } : e)))

  function move(index: number, offset: -1 | 1) {
    const next = [...exercises]
    const [item] = next.splice(index, 1)
    next.splice(index + offset, 0, item!)
    setExercises(next)
  }

  function add() {
    const item = blank()
    setExercises([...exercises, item])
    setFocusKey(item.key)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!valid || !date) return
    setSaving(true)
    const data = {
      patientId,
      date: date.format('YYYY-MM-DD'),
      exercises: exercises.map((e) => ({ title: e.title.trim(), description: e.description.trim() })),
      frequency: frequency.trim(),
    }
    if (prescription) await savePrescription(tenantId, { ...prescription, ...data })
    else await createPrescription(tenantId, data)
    await onSaved()
  }

  return (
    <Dialog open onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="md" aria-labelledby="prescricao-titulo">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
        <DialogTitle id="prescricao-titulo">{prescription ? 'Editar prescrição' : 'Nova prescrição'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <DatePicker
              label="Data"
              value={date}
              onChange={setDate}
              slotProps={{
                textField: {
                  name: 'date',
                  required: true,
                  error: submitted && !dateValid,
                  helperText: submitted && !dateValid ? 'Informe uma data válida.' : undefined,
                  sx: { maxWidth: { sm: 240 } },
                },
              }}
            />

            <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
              <Typography component="legend" variant="h5" sx={{ mb: 1.5 }}>
                Exercícios
              </Typography>
              <Stack spacing={2}>
                {exercises.map((exercise, index) => {
                  const n = index + 1
                  return (
                    <Paper key={exercise.key} sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Exercício {n}
                        </Typography>
                        <Stack direction="row">
                          <IconButton aria-label={`Mover exercício ${n} para cima`} disabled={index === 0} onClick={() => move(index, -1)}>
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                          <IconButton aria-label={`Mover exercício ${n} para baixo`} disabled={index === exercises.length - 1} onClick={() => move(index, 1)}>
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                          <IconButton aria-label={`Remover exercício ${n}`} onClick={() => setExercises(exercises.filter((e) => e.key !== exercise.key))}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                      <Stack spacing={2}>
                        <TextField
                          label="Título"
                          name={`title${n}`}
                          value={exercise.title}
                          onChange={(event) => update(exercise.key, { title: event.target.value })}
                          required
                          fullWidth
                          autoFocus={exercise.key === focusKey}
                          error={submitted && exercise.title.trim() === ''}
                          helperText={submitted && exercise.title.trim() === '' ? 'Informe o título do exercício.' : undefined}
                          slotProps={{ htmlInput: { autoComplete: 'off' } }}
                        />
                        <TextField
                          label="Descrição"
                          name={`description${n}`}
                          value={exercise.description}
                          onChange={(event) => update(exercise.key, { description: event.target.value })}
                          multiline
                          minRows={2}
                          fullWidth
                        />
                      </Stack>
                    </Paper>
                  )
                })}
                {submitted && exercises.length === 0 && <FormHelperText error>Adicione ao menos um exercício.</FormHelperText>}
                <Box>
                  <Button startIcon={<Add />} onClick={add}>
                    Adicionar exercício
                  </Button>
                </Box>
              </Stack>
            </Box>

            <TextField
              label="Frequência"
              name="frequency"
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
              multiline
              minRows={2}
              fullWidth
              helperText="Texto livre. Ex.: diariamente, por 10 minutos."
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
