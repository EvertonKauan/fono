import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Print from '@mui/icons-material/Print'
import dayjs from 'dayjs'
import { useSession, useTenantId } from '../../../auth/useSession.ts'
import PrintSheet from '../../../components/PrintSheet.tsx'
import { getAnamnese } from '../../../services/anamnese.ts'
import { listPrescriptions } from '../../../services/prescriptions.ts'
import type { Anamnese, Patient, Payment, Prescription } from '../../../types/domain.ts'
import { formatDate } from '../../../utils/format.ts'
import ReportDocument from './ReportDocument.tsx'
import { REPORT_SECTIONS, type ReportInclude } from './report.ts'

type Props = { patient: Patient; payments: Payment[] }
type Loaded = { anamnese: Anamnese | null; prescriptions: Prescription[] }

export default function RelatorioTab({ patient, payments }: Props) {
  const tenantId = useTenantId()
  const { session } = useSession()
  const [loaded, setLoaded] = useState<Loaded>()
  const [include, setInclude] = useState<ReportInclude>({ dados: true, anamnese: true, prescricoes: true, financeiro: true })
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([getAnamnese(tenantId, patient.id), listPrescriptions(tenantId, patient.id)]).then(([anamnese, prescriptions]) => {
      if (active) setLoaded({ anamnese: anamnese ?? null, prescriptions })
    })
    return () => {
      active = false
    }
  }, [tenantId, patient.id])

  if (!loaded || !session) return null

  const anySelected = REPORT_SECTIONS.some((section) => include[section.key])
  const report = (
    <ReportDocument
      patient={patient}
      tenant={session.tenant}
      payments={payments}
      anamnese={loaded.anamnese}
      prescriptions={loaded.prescriptions}
      include={include}
      issuedOn={formatDate(dayjs().format('YYYY-MM-DD'))}
    />
  )

  return (
    <Stack spacing={2} component="section" sx={{ maxWidth: '210mm', mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} gap={2}>
        <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
          <FormLabel component="legend" sx={{ color: 'text.primary', fontWeight: 600 }}>
            Incluir no relatório
          </FormLabel>
          <FormGroup row>
            {REPORT_SECTIONS.map(({ key, label }) => (
              <FormControlLabel
                key={key}
                label={label}
                control={
                  <Checkbox name={key} checked={include[key]} onChange={(event) => setInclude({ ...include, [key]: event.target.checked })} />
                }
              />
            ))}
          </FormGroup>
          {!anySelected && <FormHelperText id="relatorio-ajuda">Selecione ao menos uma seção para gerar o relatório.</FormHelperText>}
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<Print />}
            disabled={!anySelected}
            aria-describedby={anySelected ? undefined : 'relatorio-ajuda'}
            onClick={() => setPrinting(true)}
          >
            Imprimir
          </Button>
        </Box>
      </Stack>

      <Typography variant="h5" component="h2">
        Pré-visualização
      </Typography>
      {anySelected ? (
        <Paper sx={{ p: { xs: 2, sm: 4 } }}>{report}</Paper>
      ) : (
        <Typography color="text.secondary">Nenhuma seção selecionada.</Typography>
      )}

      {printing && <PrintSheet onDone={() => setPrinting(false)}>{report}</PrintSheet>}
    </Stack>
  )
}
