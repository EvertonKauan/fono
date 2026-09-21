import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useTenantId } from '../auth/useSession.ts'
import AttachmentsField from './AttachmentsField.tsx'
import { useAttachmentDraft } from './useAttachmentDraft.ts'
import { createSession, saveSession, type NewSession } from '../services/sessions.ts'
import type { BillingType, Session, SessionStatus } from '../types/domain.ts'
import { sessionStatusLabel } from '../utils/format.ts'
import { newId } from '../utils/id.ts'
import { SAVE_ERROR } from '../utils/messages.ts'

type Props = {
  patientId: string
  patientName: string
  session?: Session // ausente = nova sessão
  defaultTime?: string // sugestão para nova sessão (horário de atendimento do paciente)
  onClose: () => void
  onSaved: () => Promise<void>
}

// Compartilhado entre a aba Sessões e o calendário. Montado só enquanto aberto: o estado é descartado ao fechar.
export default function SessionDialog({ patientId, patientName, session, defaultTime, onClose, onSaved }: Props) {
  const tenantId = useTenantId()
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'))
  const [date, setDate] = useState<Dayjs | null>(() => dayjs(session?.date))
  const [time, setTime] = useState(session ? (session.time ?? '') : (defaultTime ?? ''))
  const [status, setStatus] = useState<SessionStatus>(session?.status ?? 'agendada')
  const [billing, setBilling] = useState<BillingType>(session?.billing ?? 'particular')
  const [insurer, setInsurer] = useState(session?.insurer ?? '')
  const [evolution, setEvolution] = useState(session?.evolution ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // id definido já na abertura, para os anexos de uma sessão nova terem dono antes de ela ser gravada
  const [newSessionId] = useState(newId)
  // sessão já gravada neste diálogo: se os anexos falharem, tentar de novo edita em vez de duplicar
  const [persisted, setPersisted] = useState<Session | undefined>(session)
  const attachments = useAttachmentDraft({ type: 'sessao', id: session?.id ?? newSessionId })

  const dateValid = date !== null && date.isValid()
  const insurerMissing = billing === 'convenio' && insurer.trim() === ''

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!date || !dateValid || insurerMissing) return
    setSaving(true)
    setError(null)
    try {
      const data: NewSession = {
        patientId,
        date: date.format('YYYY-MM-DD'),
        time: time || undefined,
        status,
        billing,
        insurer: billing === 'convenio' ? insurer.trim() : undefined,
        evolution: evolution.trim() || undefined,
      }
      const saved = persisted ? await saveSession(tenantId, { ...persisted, ...data }) : await createSession(tenantId, data, newSessionId)
      setPersisted(saved)
      try {
        await attachments.apply()
      } catch {
        setError('A sessão foi salva, mas não foi possível gravar os anexos. Tente salvar de novo.')
        setSaving(false)
        return
      }
      await onSaved()
    } catch {
      setError(SAVE_ERROR)
      setSaving(false)
    }
  }

  return (
    <Dialog open onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="sessao-titulo">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
        <DialogTitle id="sessao-titulo">{session ? 'Editar sessão' : 'Nova sessão'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <Typography color="text.secondary">Paciente: {patientName}</Typography>
            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
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
                  },
                }}
              />
              <TextField
                label="Horário (opcional)"
                name="time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            <TextField
              select
              label="Status"
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as SessionStatus)}
            >
              {(Object.keys(sessionStatusLabel) as SessionStatus[]).map((key) => (
                <MenuItem key={key} value={key}>
                  {sessionStatusLabel[key]}
                </MenuItem>
              ))}
            </TextField>

            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Cobrança
              </FormLabel>
              <RadioGroup row name="billing" value={billing} onChange={(event) => setBilling(event.target.value as BillingType)}>
                <FormControlLabel value="particular" control={<Radio />} label="Particular" />
                <FormControlLabel value="convenio" control={<Radio />} label="Convênio" />
              </RadioGroup>
            </FormControl>
            {billing === 'convenio' && (
              <TextField
                label="Nome do convênio"
                name="insurer"
                value={insurer}
                onChange={(event) => setInsurer(event.target.value)}
                required
                error={submitted && insurerMissing}
                helperText={submitted && insurerMissing ? 'Informe o nome do convênio.' : undefined}
                slotProps={{ htmlInput: { autoComplete: 'off' } }}
              />
            )}

            <TextField
              label="Evolução"
              name="evolution"
              value={evolution}
              onChange={(event) => setEvolution(event.target.value)}
              multiline
              minRows={4}
              helperText="O que aconteceu na sessão."
            />

            <AttachmentsField title="Anexos da evolução" attachments={attachments} saveNote="ao salvar a sessão" />
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
