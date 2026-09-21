import { useRef, useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
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
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useTenantId } from '../auth/useSession.ts'
import AttachmentsField from './AttachmentsField.tsx'
import MoneyField from './MoneyField.tsx'
import { useAttachmentDraft } from './useAttachmentDraft.ts'
import { suggestedValue } from '../services/billing.ts'
import { createSession, listSessions, saveSession, type NewSession } from '../services/sessions.ts'
import type { BillingType, Patient, Session, SessionStatus } from '../types/domain.ts'
import { sessionStatusLabel } from '../utils/format.ts'
import { newId } from '../utils/id.ts'
import { SAVE_ERROR } from '../utils/messages.ts'
import { patientOptions } from './patientOptions.ts'

// Paciente fixo (aba Sessões e edição) ou, ao criar pelo calendário, escolhido num campo de busca entre os `patients` recebidos.
type Props = (
  | { patientId: string; patientName: string }
  | { patients: Patient[] }
) & {
  session?: Session // ausente = nova sessão
  initialDate?: string // yyyy-mm-dd; padrão: hoje
  initialTime?: string // HH:mm
  initialValue?: number // valor sugerido para sessão nova com paciente fixo; com paciente escolhido no campo, o dialog sugere sozinho
  onClose: () => void
  onSaved: () => Promise<void>
}

// Compartilhado entre a aba Sessões e o calendário. Montado só enquanto aberto: o estado é descartado ao fechar.
export default function SessionDialog(props: Props) {
  const { session, initialDate, initialTime, initialValue, onClose, onSaved } = props
  const tenantId = useTenantId()
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'))
  const choices = 'patients' in props ? patientOptions(props.patients, tenantId) : null
  const [chosen, setChosen] = useState<Patient | null>(null)
  const patientInput = useRef<HTMLInputElement>(null)
  // a sugestão de valor só vale enquanto o usuário não digitou um valor
  const valueTouched = useRef(false)
  const chosenId = useRef<string>(undefined)
  const patientId = 'patients' in props ? chosen?.id : props.patientId
  const [date, setDate] = useState<Dayjs | null>(() => dayjs(session?.date ?? initialDate))
  const [time, setTime] = useState(session ? (session.time ?? '') : (initialTime ?? ''))
  const [value, setValue] = useState<number | null>(() => (session ? session.value : initialValue) || null)
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
  const valueMissing = value === null

  function choosePatient(patient: Patient | null) {
    setChosen(patient)
    chosenId.current = patient?.id
    if (!patient || valueTouched.current) return
    listSessions(tenantId, patient.id).then((history) => {
      if (chosenId.current === patient.id && !valueTouched.current) setValue(suggestedValue(history) ?? null)
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!patientId || !date || !dateValid || insurerMissing || value === null) return
    setSaving(true)
    setError(null)
    try {
      const data: NewSession = {
        patientId,
        date: date.format('YYYY-MM-DD'),
        time: time || undefined,
        status,
        value,
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
    <Dialog
      open
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="sessao-titulo"
      // o conteúdo fica invisível durante o fade e não aceita foco antes do fim dele (autoFocus não pega)
      slotProps={{ transition: { onEntered: () => patientInput.current?.focus() } }}
    >
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
        <DialogTitle id="sessao-titulo">{session ? 'Editar sessão' : 'Nova sessão'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {choices ? (
              <Autocomplete
                autoHighlight
                options={choices}
                value={chosen}
                onChange={(_, patient) => choosePatient(patient)}
                getOptionLabel={(patient) => patient.fullName}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                filterOptions={(all, { inputValue }) => patientOptions(all, tenantId, inputValue)}
                noOptionsText={choices.length === 0 ? 'Nenhum paciente ativo.' : 'Nenhum paciente encontrado.'}
                clearText="Limpar"
                openText="Abrir"
                closeText="Fechar"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Paciente"
                    name="patient"
                    required
                    inputRef={patientInput}
                    error={submitted && !chosen}
                    helperText={submitted && !chosen ? 'Escolha o paciente.' : undefined}
                  />
                )}
              />
            ) : (
              <TextField
                label="Paciente"
                name="patient"
                value={'patientName' in props ? props.patientName : ''}
                slotProps={{ input: { readOnly: true } }}
              />
            )}
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

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
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
              <MoneyField
                label="Valor da sessão"
                name="value"
                value={value}
                onChange={(next) => {
                  valueTouched.current = true
                  setValue(next > 0 ? next : null)
                }}
                required
                error={submitted && valueMissing}
                helperText={submitted && valueMissing ? 'Informe o valor da sessão.' : undefined}
              />
            </Box>

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
