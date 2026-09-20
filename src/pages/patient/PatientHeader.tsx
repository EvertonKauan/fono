import { Link as RouterLink } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBack from '@mui/icons-material/ArrowBack'
import PaymentChip from '../../components/PaymentChip.tsx'
import type { Patient } from '../../types/domain.ts'
import { ageOf } from '../../utils/age.ts'
import { maskCpf } from '../../utils/cpf.ts'
import { formatAge, formatCurrency, formatWeekdays, kindLabel } from '../../utils/format.ts'

type Props = { patient: Patient; pending: boolean }

export default function PatientHeader({ patient, pending }: Props) {
  const details = [
    `${kindLabel[patient.kind]} · ${formatAge(ageOf(patient.birthDate))}`,
    `Consulta ${formatCurrency(patient.visit.fee)}`,
    `Dias: ${formatWeekdays(patient.visit.weekdays)}`,
    patient.cpf && maskCpf(patient.cpf) ? `CPF ${maskCpf(patient.cpf)}` : null,
  ].filter((item) => item !== null)

  return (
    <Stack spacing={0.5} sx={{ pb: 1 }}>
      <Stack direction="row" alignItems="center" gap={1}>
        <IconButton component={RouterLink} to="/pacientes" edge="start" aria-label="Voltar para a lista de pacientes">
          <ArrowBack />
        </IconButton>
        <Typography variant="h3" component="h1" sx={{ flexGrow: 1, minWidth: 0 }}>
          {patient.fullName}
        </Typography>
        <PaymentChip pending={pending} />
      </Stack>
      <Stack direction="row" flexWrap="wrap" columnGap={2} sx={{ pl: { xs: 0, sm: 5 } }}>
        {details.map((item) => (
          <Typography key={item} variant="body2" color="text.secondary">
            {item}
          </Typography>
        ))}
      </Stack>
    </Stack>
  )
}
