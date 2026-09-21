import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Archive from '@mui/icons-material/Archive'
import Unarchive from '@mui/icons-material/Unarchive'
import PaymentChip from '../../components/PaymentChip.tsx'
import type { Patient } from '../../types/domain.ts'
import { ageOf } from '../../utils/age.ts'
import { maskCpf } from '../../utils/cpf.ts'
import { formatAge, kindLabel } from '../../utils/format.ts'

type Props = { patient: Patient; pending: boolean; onToggleArchive: () => void }

export default function PatientHeader({ patient, pending, onToggleArchive }: Props) {
  const archived = Boolean(patient.archivedAt)
  const archiveLabel = archived ? 'Desarquivar paciente' : 'Arquivar paciente'
  const details = [
    `${kindLabel[patient.kind]} · ${formatAge(ageOf(patient.birthDate))}`,
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
        <Button
          color="inherit"
          onClick={onToggleArchive}
          aria-label={archiveLabel}
          title={archiveLabel}
          startIcon={archived ? <Unarchive /> : <Archive />}
          sx={{ minWidth: 0, '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: { xs: 0, sm: -0.5 } } }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {archiveLabel}
          </Box>
        </Button>
      </Stack>
      <Stack direction="row" flexWrap="wrap" alignItems="center" columnGap={2} sx={{ pl: { xs: 0, sm: 5 } }}>
        {archived && <Chip label="Arquivado" variant="outlined" />}
        {details.map((item) => (
          <Typography key={item} variant="body2" color="text.secondary">
            {item}
          </Typography>
        ))}
      </Stack>
    </Stack>
  )
}
