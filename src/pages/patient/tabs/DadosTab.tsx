import { useState, type FormEvent, type ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useTenantId } from '../../../auth/useSession.ts'
import { useSave } from '../../../components/useSave.ts'
import CpfField from '../../../components/CpfField.tsx'
import PhoneField from '../../../components/PhoneField.tsx'
import Toast from '../../../components/Toast.tsx'
import { savePatient } from '../../../services/patients.ts'
import type { Patient, PatientKind } from '../../../types/domain.ts'
import { ageOf, isMinor } from '../../../utils/age.ts'
import { isValidCpf } from '../../../utils/cpf.ts'
import { formatAge, kindLabel } from '../../../utils/format.ts'

type Props = { patient: Patient; onSaved: (patient: Patient) => void }
type Guardian = Patient['guardians'][number]

const GENDERS = ['Feminino', 'Masculino', 'Outro']
const REFERRALS = ['Pediatra', 'Escola', 'Neurologista', 'Outro']
const ISO = 'YYYY-MM-DD'
const twoColumns = { display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }

const blankToUndefined = (text?: string) => text?.trim() || undefined

export default function DadosTab({ patient, onSaved }: Props) {
  const tenantId = useTenantId()
  const [draft, setDraft] = useState<Patient>(patient)
  const [birth, setBirth] = useState<Dayjs | null>(() => dayjs(patient.birthDate))
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const { saving, error: saveError, run } = useSave()
  const [toast, setToast] = useState<string | null>(null)

  const birthValid = birth !== null && birth.isValid() && !birth.isAfter(dayjs())
  const minor = isMinor(birthValid ? birth.format(ISO) : patient.birthDate)
  const financial = draft.financialGuardian ?? { name: '', cpf: '' }

  const errors: Record<string, string> = {}
  if (!draft.fullName.trim()) errors.fullName = 'Informe o nome completo.'
  if (!birthValid) errors.birthDate = birth ? 'Data inválida.' : 'Informe a data de nascimento.'
  if (draft.cpf && !isValidCpf(draft.cpf)) errors.cpf = 'CPF inválido.'
  if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) errors.email = 'E-mail inválido.'
  if (draft.kind === 'crianca') {
    draft.guardians.forEach((guardian, index) => {
      if (!guardian.name.trim()) errors[`guardian-${index}`] = 'Informe o nome do responsável.'
    })
  }
  if (minor) {
    if (!financial.name.trim()) errors.financialName = 'Informe o nome do responsável financeiro.'
    if (!isValidCpf(financial.cpf)) errors.financialCpf = financial.cpf ? 'CPF inválido.' : 'Informe o CPF do responsável financeiro.'
  }

  const set = <K extends keyof Patient>(key: K, value: Patient[K]) => setDraft({ ...draft, [key]: value })
  const touch = (key: string) => () => setTouched(new Set(touched).add(key))
  const show = (key: string) => (submitted || touched.has(key)) && key in errors
  const field = (key: string) => ({
    error: show(key),
    helperText: show(key) ? errors[key] : undefined,
    onBlur: touch(key),
  })

  const setGuardian = (index: number, patch: Partial<Guardian>) =>
    set('guardians', draft.guardians.map((g, i) => (i === index ? { ...g, ...patch } : g)))

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0 || !birth) return
    await run(async () => {
      const saved = await savePatient(tenantId, {
        ...draft,
        archivedAt: patient.archivedAt,
        fullName: draft.fullName.trim(),
        birthDate: birth.format(ISO),
        gender: blankToUndefined(draft.gender),
        city: blankToUndefined(draft.city),
        address: blankToUndefined(draft.address),
        phone: blankToUndefined(draft.phone),
        email: blankToUndefined(draft.email),
        referredBy: blankToUndefined(draft.referredBy),
        schooling: blankToUndefined(draft.schooling),
        school: blankToUndefined(draft.school),
        occupation: blankToUndefined(draft.occupation),
        cpf: draft.cpf || undefined,
        financialGuardian: draft.financialGuardian && (draft.financialGuardian.name || draft.financialGuardian.cpf) ? draft.financialGuardian : undefined,
      })
      onSaved(saved)
      setToast('Dados salvos.')
    })
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {submitted && Object.keys(errors).length > 0 && (
          <Alert severity="error">Corrija os campos destacados antes de salvar.</Alert>
        )}
        {saveError && <Alert severity="error">{saveError}</Alert>}

        <Section title="Identificação">
          <Box sx={twoColumns}>
            <TextField
              label="Nome completo"
              name="fullName"
              value={draft.fullName}
              onChange={(event) => set('fullName', event.target.value)}
              required
              slotProps={{ htmlInput: { autoComplete: 'off' } }}
              {...field('fullName')}
            />
            <DatePicker
              label="Data de nascimento"
              value={birth}
              onChange={setBirth}
              disableFuture
              openTo="year"
              views={['year', 'month', 'day']}
              slotProps={{
                textField: {
                  name: 'birthDate',
                  required: true,
                  error: show('birthDate'),
                  helperText: show('birthDate') ? errors.birthDate : birthValid ? formatAge(ageOf(birth.format(ISO))) : undefined,
                  onBlur: touch('birthDate'),
                },
              }}
            />
            <TextField
              select
              label="Tipo"
              name="kind"
              value={draft.kind}
              onChange={(event) => set('kind', event.target.value as PatientKind)}
            >
              {(Object.keys(kindLabel) as PatientKind[]).map((kind) => (
                <MenuItem key={kind} value={kind}>
                  {kindLabel[kind]}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Sexo/gênero" name="gender" value={draft.gender ?? ''} onChange={(event) => set('gender', event.target.value)}>
              {GENDERS.map((gender) => (
                <MenuItem key={gender} value={gender}>
                  {gender}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Cidade" name="city" value={draft.city ?? ''} onChange={(event) => set('city', event.target.value)} />
            <TextField label="Endereço" name="address" value={draft.address ?? ''} onChange={(event) => set('address', event.target.value)} />
            <PhoneField label="Telefone" name="phone" value={draft.phone ?? ''} onChange={(phone) => set('phone', phone)} />
            <TextField
              label="E-mail"
              name="email"
              type="email"
              value={draft.email ?? ''}
              onChange={(event) => set('email', event.target.value)}
              slotProps={{ htmlInput: { autoComplete: 'off' } }}
              {...field('email')}
            />
            <TextField select label="Quem encaminhou" name="referredBy" value={draft.referredBy ?? ''} onChange={(event) => set('referredBy', event.target.value)}>
              {REFERRALS.map((referral) => (
                <MenuItem key={referral} value={referral}>
                  {referral}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Section>

        {draft.kind === 'crianca' ? (
          <>
            <Section title="Escola">
              <Box sx={twoColumns}>
                <TextField label="Escolaridade (série)" name="schooling" value={draft.schooling ?? ''} onChange={(event) => set('schooling', event.target.value)} />
                <TextField label="Escola" name="school" value={draft.school ?? ''} onChange={(event) => set('school', event.target.value)} />
              </Box>
            </Section>
            <Section title="Responsáveis">
              <Stack spacing={2} alignItems="flex-start">
                {draft.guardians.length === 0 && <Typography color="text.secondary">Nenhum responsável cadastrado.</Typography>}
                {draft.guardians.map((guardian, index) => (
                  <Paper key={index} sx={{ p: 2, width: '100%' }}>
                    <Stack direction="row" alignItems="flex-start" gap={1}>
                      <Box sx={{ ...twoColumns, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, flexGrow: 1 }}>
                        <TextField
                          label="Nome do responsável"
                          name={`guardianName${index}`}
                          value={guardian.name}
                          onChange={(event) => setGuardian(index, { name: event.target.value })}
                          required
                          {...field(`guardian-${index}`)}
                        />
                        <TextField label="Parentesco" name={`guardianRelationship${index}`} value={guardian.relationship} onChange={(event) => setGuardian(index, { relationship: event.target.value })} />
                        <PhoneField
                          label="Telefone do responsável"
                          name={`guardianPhone${index}`}
                          value={guardian.phone ?? ''}
                          onChange={(phone) => setGuardian(index, { phone })}
                        />
                      </Box>
                      <IconButton aria-label={`Remover responsável ${index + 1}`} onClick={() => set('guardians', draft.guardians.filter((_, i) => i !== index))}>
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
                <Button startIcon={<Add />} onClick={() => set('guardians', [...draft.guardians, { name: '', relationship: '' }])}>
                  Adicionar responsável
                </Button>
              </Stack>
            </Section>
          </>
        ) : (
          <Section title="Escolaridade e ocupação">
            <Box sx={twoColumns}>
              <TextField label="Escolaridade" name="schooling" value={draft.schooling ?? ''} onChange={(event) => set('schooling', event.target.value)} />
              <TextField label="Profissão/ocupação" name="occupation" value={draft.occupation ?? ''} onChange={(event) => set('occupation', event.target.value)} />
            </Box>
          </Section>
        )}

        <Section title="Dados fiscais (recibos)">
          <Box sx={twoColumns}>
            <CpfField
              label="CPF do paciente"
              name="cpf"
              value={draft.cpf ?? ''}
              onChange={(cpf) => set('cpf', cpf)}
              {...field('cpf')}
            />
          </Box>
          {minor && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Paciente menor de 18 anos: o responsável financeiro é obrigatório para os recibos.
              </Typography>
              <Box sx={twoColumns}>
                <TextField
                  label="Nome do responsável financeiro"
                  name="financialName"
                  value={financial.name}
                  onChange={(event) => set('financialGuardian', { ...financial, name: event.target.value })}
                  required
                  slotProps={{ htmlInput: { autoComplete: 'off' } }}
                  {...field('financialName')}
                />
                <CpfField
                  label="CPF do responsável financeiro"
                  name="financialCpf"
                  value={financial.cpf}
                  onChange={(cpf) => set('financialGuardian', { ...financial, cpf })}
                  required
                  {...field('financialCpf')}
                />
              </Box>
            </Stack>
          )}
        </Section>

        <Box>
          <Button type="submit" variant="contained" disabled={saving}>
            Salvar
          </Button>
        </Box>
      </Stack>
      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section">
      <Typography variant="h5" component="h2" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  )
}
