import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Add from '@mui/icons-material/Add'
import Edit from '@mui/icons-material/Edit'
import Print from '@mui/icons-material/Print'
import { useSession, useTenantId } from '../../../auth/useSession.ts'
import PrintSheet from '../../../components/PrintSheet.tsx'
import Toast from '../../../components/Toast.tsx'
import { listPrescriptions } from '../../../services/prescriptions.ts'
import type { Patient, Prescription } from '../../../types/domain.ts'
import { formatDate } from '../../../utils/format.ts'
import PrescriptionDialog from './PrescriptionDialog.tsx'
import PrescriptionPrint from './PrescriptionPrint.tsx'

type DialogState = { prescription?: Prescription } | null

const summary = (p: Prescription) =>
  `${p.exercises.length === 1 ? '1 exercício' : `${p.exercises.length} exercícios`}: ${p.exercises.map((e) => e.title).join(', ')}`

export default function PrescricoesTab({ patient }: { patient: Patient }) {
  const tenantId = useTenantId()
  const { session } = useSession()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>()
  const [dialog, setDialog] = useState<DialogState>(null)
  const [printing, setPrinting] = useState<Prescription | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    listPrescriptions(tenantId, patient.id).then((list) => {
      if (active) setPrescriptions(list)
    })
    return () => {
      active = false
    }
  }, [tenantId, patient.id])

  async function saved() {
    setPrescriptions(await listPrescriptions(tenantId, patient.id))
    setDialog(null)
    setToast('Prescrição salva.')
  }

  if (!prescriptions) return null

  return (
    <Box component="section" sx={{ maxWidth: 840 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
        <Typography variant="h5" component="h2">
          Prescrições
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialog({})}>
          Nova prescrição
        </Button>
      </Stack>

      {prescriptions.length === 0 ? (
        <Typography color="text.secondary">Nenhuma prescrição cadastrada.</Typography>
      ) : (
        <Paper component="ul" role="list" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {prescriptions.map((prescription, index) => (
            <Box
              component="li"
              key={prescription.id}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { sm: 'center' },
                gap: 1.5,
                borderTop: index > 0 ? 1 : 0,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="h6" component="h3">
                  {formatDate(prescription.date)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'break-word' }}>
                  {summary(prescription)}
                </Typography>
              </Box>
              <Stack direction="row" gap={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Edit />}
                  aria-label={`Editar prescrição de ${formatDate(prescription.date)}`}
                  onClick={() => setDialog({ prescription })}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Print />}
                  aria-label={`Imprimir prescrição de ${formatDate(prescription.date)}`}
                  onClick={() => setPrinting(prescription)}
                >
                  Imprimir
                </Button>
              </Stack>
            </Box>
          ))}
        </Paper>
      )}

      {dialog && (
        <PrescriptionDialog
          patientId={patient.id}
          prescription={dialog.prescription}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      )}
      {printing && session && (
        <PrintSheet onDone={() => setPrinting(null)}>
          <PrescriptionPrint patientName={patient.fullName} prescription={printing} professional={session.tenant.professional} />
        </PrintSheet>
      )}
      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  )
}
