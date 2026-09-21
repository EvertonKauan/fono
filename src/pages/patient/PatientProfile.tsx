import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useTenantId } from '../../auth/useSession.ts'
import Toast from '../../components/Toast.tsx'
import { archivePatient, getPatient, unarchivePatient } from '../../services/patients.ts'
import { listPayments } from '../../services/payments.ts'
import type { Patient, Payment } from '../../types/domain.ts'
import ArchiveDialog from './ArchiveDialog.tsx'
import PatientHeader from './PatientHeader.tsx'
import AnamneseTab from './tabs/AnamneseTab.tsx'
import DadosTab from './tabs/DadosTab.tsx'
import FinanceiroTab from './tabs/FinanceiroTab.tsx'
import PrescricoesTab from './tabs/PrescricoesTab.tsx'
import RelatorioTab from './tabs/RelatorioTab.tsx'
import SessoesTab from './tabs/SessoesTab.tsx'
import { hasPending } from './tabs/financeiro.ts'

const TABS = [
  { key: 'dados', label: 'Dados' },
  { key: 'anamnese', label: 'Anamnese' },
  { key: 'sessoes', label: 'Sessões' },
  { key: 'prescricoes', label: 'Prescrições' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'relatorio', label: 'Relatório' },
] as const

type TabKey = (typeof TABS)[number]['key']

const isTab = (value: string | null): value is TabKey => TABS.some((tab) => tab.key === value)

// altura da barra superior (AppLayout), para o cabeçalho do perfil grudar logo abaixo dela
const APP_BAR_HEIGHT = 49

type State = { patient: Patient | null; payments: Payment[] }

export default function PatientProfile() {
  const { id = '' } = useParams()
  const tenantId = useTenantId()
  const [params, setParams] = useSearchParams()
  const [state, setState] = useState<State>()
  const [archiving, setArchiving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([getPatient(tenantId, id), listPayments(tenantId, id)]).then(([patient, payments]) => {
      if (active) setState({ patient: patient ?? null, payments })
    })
    return () => {
      active = false
    }
  }, [tenantId, id])

  if (!state) return null

  const { patient, payments } = state
  if (!patient) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h1">Paciente não encontrado</Typography>
        <Button component={RouterLink} to="/pacientes" variant="contained">
          Voltar para a lista
        </Button>
      </Stack>
    )
  }

  const aba = params.get('aba')
  const tab: TabKey = isTab(aba) ? aba : 'dados'
  const setPatient = (next: Patient) => setState({ patient: next, payments })
  const setPayments = (next: Payment[]) => setState({ patient, payments: next })

  async function archive() {
    setPatient(await archivePatient(tenantId, patient!.id))
    setArchiving(false)
    setToast('Paciente arquivado.')
  }

  async function unarchive() {
    setPatient(await unarchivePatient(tenantId, patient!.id))
    setToast('Paciente desarquivado.')
  }

  return (
    <Stack>
      <Box sx={{ position: 'sticky', top: APP_BAR_HEIGHT, zIndex: (theme) => theme.zIndex.appBar - 1, bgcolor: 'background.default' }}>
        <PatientHeader
          patient={patient}
          pending={hasPending(payments)}
          onToggleArchive={patient.archivedAt ? unarchive : () => setArchiving(true)}
        />
        <Tabs
          value={tab}
          onChange={(_, value: TabKey) => setParams({ aba: value }, { replace: true })}
          variant="scrollable"
          scrollButtons={false}
          aria-label="Seções do paciente"
        >
          {TABS.map(({ key, label }) => (
            <Tab key={key} value={key} label={label} id={`tab-${key}`} aria-controls={`panel-${key}`} />
          ))}
        </Tabs>
      </Box>
      <Box role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} sx={{ pt: 2 }}>
        {tab === 'dados' && <DadosTab patient={patient} onSaved={setPatient} />}
        {tab === 'anamnese' && <AnamneseTab patient={patient} />}
        {tab === 'sessoes' && <SessoesTab patient={patient} />}
        {tab === 'prescricoes' && <PrescricoesTab patient={patient} />}
        {tab === 'financeiro' && (
          <FinanceiroTab
            patient={patient}
            payments={payments}
            onPatientSaved={setPatient}
            onPaymentsChange={setPayments}
          />
        )}
        {tab === 'relatorio' && <RelatorioTab patient={patient} payments={payments} />}
      </Box>
      {archiving && <ArchiveDialog patientName={patient.fullName} onClose={() => setArchiving(false)} onConfirm={archive} />}
      <Toast message={toast} onClose={() => setToast(null)} />
    </Stack>
  )
}
