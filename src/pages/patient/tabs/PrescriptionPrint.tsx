import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Prescription, Tenant } from '../../../types/domain.ts'
import { formatDate } from '../../../utils/format.ts'

type Props = { patientName: string; prescription: Prescription; professional: Tenant['professional'] }

// Formato do RF-07 (mais a data): título, paciente, data, exercícios numerados, frequência e assinatura do tenant.
export default function PrescriptionPrint({ patientName, prescription, professional }: Props) {
  const frequency = prescription.frequency.trim()

  return (
    <Box sx={{ color: 'text.primary', fontSize: '12pt', lineHeight: 1.5, overflowWrap: 'break-word' }}>
      <Typography variant="h1" sx={{ fontSize: '16pt', mb: 1 }}>
        PRESCRIÇÃO FONOTERAPÊUTICA
      </Typography>
      <Typography sx={{ fontSize: 'inherit' }}>Paciente: {patientName}</Typography>
      <Typography sx={{ fontSize: 'inherit', mb: 3 }}>Data: {formatDate(prescription.date)}</Typography>

      <Typography variant="h2" sx={{ fontSize: '13pt', mb: 1, breakAfter: 'avoid' }}>
        Exercícios
      </Typography>
      <Box component="ol" sx={{ m: 0, pl: 3, mb: 3 }}>
        {prescription.exercises.map((exercise, index) => (
          <Box component="li" key={index} sx={{ mb: 1.5, breakInside: 'avoid' }}>
            <Box sx={{ fontWeight: 600 }}>{exercise.title}</Box>
            {exercise.description && <Box sx={{ whiteSpace: 'pre-wrap' }}>{exercise.description}</Box>}
          </Box>
        ))}
      </Box>

      <Box sx={{ breakInside: 'avoid' }}>
        {frequency && (
          <>
            <Typography variant="h2" sx={{ fontSize: '13pt', mb: 1 }}>
              Frequência
            </Typography>
            <Typography sx={{ fontSize: 'inherit', whiteSpace: 'pre-wrap' }}>{frequency}</Typography>
          </>
        )}
        <Box sx={{ mt: 8 }}>
          <Box sx={{ fontWeight: 600 }}>{professional.name}</Box>
          <Box>Fonoaudióloga | CRFa {professional.registry}</Box>
        </Box>
      </Box>
    </Box>
  )
}
