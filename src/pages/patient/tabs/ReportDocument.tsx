import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Anamnese, Patient, Payment, Prescription, Tenant } from '../../../types/domain.ts'
import { formatCurrency, formatDate, formatPeriod, methodLabel } from '../../../utils/format.ts'
import { byPeriodDesc } from './financeiro.ts'
import { REPORT_SECTIONS, answeredSections, patientFields, type ReportInclude } from './report.ts'

type Props = {
  patient: Patient
  tenant: Tenant
  payments: Payment[]
  anamnese: Anamnese | null
  prescriptions: Prescription[]
  include: ReportInclude
  issuedOn: string // dd/mm/aaaa
}

const subtitle = { fontSize: '12pt', mt: 2, mb: 0.75, breakAfter: 'avoid' } as const
const empty = <Typography sx={{ fontSize: 'inherit' }}>Nenhum lançamento registrado.</Typography>

// Mesmo documento na pré-visualização e na impressão; cada seção depois da primeira começa em página nova.
export default function ReportDocument({ patient, tenant, payments, anamnese, prescriptions, include, issuedOn }: Props) {
  const chosen = REPORT_SECTIONS.filter((section) => include[section.key])

  const content: Record<(typeof REPORT_SECTIONS)[number]['key'], ReactNode> = {
    dados: <Fields fields={patientFields(patient)} />,
    anamnese: <AnamneseSection patient={patient} anamnese={anamnese} />,
    prescricoes: <PrescricoesSection prescriptions={prescriptions} />,
    financeiro: <FinanceiroSection payments={payments} />,
  }

  return (
    <Box sx={{ color: 'text.primary', fontSize: '11pt', lineHeight: 1.45, overflowWrap: 'break-word' }}>
      <Box component="header" sx={{ pb: 1.5, borderBottom: 2, borderColor: 'text.primary' }}>
        <Typography variant="h1" sx={{ fontSize: '16pt' }}>
          {tenant.name}
        </Typography>
        <Box>
          {tenant.professional.name} — Fonoaudióloga | CRFa {tenant.professional.registry}
        </Box>
        <Box sx={{ mt: 1, fontWeight: 600 }}>Relatório do paciente: {patient.fullName}</Box>
        <Box>Emitido em {issuedOn}</Box>
      </Box>

      {chosen.map((section, index) => (
        <Box
          component="section"
          key={section.key}
          className={index > 0 ? 'print-page-break' : undefined}
          sx={{ mt: 3, ...(index > 0 && { '@media screen': { pt: 3, borderTop: '1px dashed', borderColor: 'divider' } }) }}
        >
          <Typography variant="h2" sx={{ fontSize: '14pt', mb: 1.5, pb: 0.5, borderBottom: 1, borderColor: 'divider', breakAfter: 'avoid' }}>
            {section.label}
          </Typography>
          {content[section.key]}
        </Box>
      ))}
    </Box>
  )
}

function Fields({ fields }: { fields: { label: string; value: string }[] }) {
  return (
    <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '12rem minmax(0, 1fr)' }, columnGap: 2, rowGap: { xs: 0.25, sm: 0.5 }, m: 0 }}>
      {fields.map(({ label, value }) => (
        <Box key={label} sx={{ display: 'contents' }}>
          <Box component="dt" sx={{ fontWeight: 600, mt: { xs: 1, sm: 0 } }}>
            {label}
          </Box>
          <Box component="dd" sx={{ m: 0, whiteSpace: 'pre-line' }}>
            {value}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

function AnamneseSection({ patient, anamnese }: { patient: Patient; anamnese: Anamnese | null }) {
  const sections = answeredSections(patient, anamnese)
  if (sections.length === 0) return <Typography sx={{ fontSize: 'inherit' }}>Nenhuma resposta registrada.</Typography>
  return (
    <>
      {sections.map((section) => (
        <Box key={section.id}>
          <Typography variant="h3" sx={subtitle}>
            {section.title}
          </Typography>
          {section.lines.map((line) => (
            <Box key={line.label} sx={{ mb: 1, breakInside: 'avoid' }}>
              <Box sx={{ fontWeight: 600 }}>{line.label}</Box>
              <Box sx={{ whiteSpace: 'pre-wrap' }}>{line.text}</Box>
            </Box>
          ))}
        </Box>
      ))}
    </>
  )
}

function PrescricoesSection({ prescriptions }: { prescriptions: Prescription[] }) {
  if (prescriptions.length === 0) return <Typography sx={{ fontSize: 'inherit' }}>Nenhuma prescrição registrada.</Typography>
  return (
    <>
      {prescriptions.map((prescription) => (
        <Box key={prescription.id}>
          <Typography variant="h3" sx={subtitle}>
            Prescrição de {formatDate(prescription.date)}
          </Typography>
          <Box component="ol" sx={{ m: 0, pl: 3 }}>
            {prescription.exercises.map((exercise, index) => (
              <Box component="li" key={index} sx={{ mb: 0.75, breakInside: 'avoid' }}>
                <Box sx={{ fontWeight: 600 }}>{exercise.title}</Box>
                {exercise.description && <Box sx={{ whiteSpace: 'pre-wrap' }}>{exercise.description}</Box>}
              </Box>
            ))}
          </Box>
          {prescription.frequency.trim() && (
            <Box sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
              <Box component="span" sx={{ fontWeight: 600 }}>
                Frequência:{' '}
              </Box>
              {prescription.frequency.trim()}
            </Box>
          )}
        </Box>
      ))}
    </>
  )
}

function FinanceiroSection({ payments }: { payments: Payment[] }) {
  const sorted = [...payments].sort(byPeriodDesc)
  const total = (status: Payment['status']) =>
    payments.filter((p) => p.status === status).reduce((sum, p) => sum + Math.round(p.amount * 100), 0) / 100
  const cell = { textAlign: 'left', py: 0.5, pr: 1.5, borderBottom: 1, borderColor: 'divider', fontSize: 'inherit', verticalAlign: 'top' } as const

  return (
    <>
      <Typography variant="h3" sx={subtitle}>
        Lançamentos
      </Typography>
      {sorted.length === 0 ? (
        empty
      ) : (
        <>
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& th': { fontWeight: 600 } }}>
              <thead>
                <tr>
                  {['Competência', 'Sessões', 'Valor', 'Status', 'Data do pagamento', 'Forma'].map((label) => (
                    <Box component="th" scope="col" key={label} sx={cell}>
                      {label}
                    </Box>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((payment) => (
                  <Box component="tr" key={payment.id} sx={{ breakInside: 'avoid' }}>
                    <Box component="td" sx={cell}>{formatPeriod(payment.period)}</Box>
                    <Box component="td" sx={cell}>{payment.sessions}</Box>
                    <Box component="td" sx={cell}>{formatCurrency(payment.amount)}</Box>
                    <Box component="td" sx={{ ...cell, fontWeight: payment.status === 'pendente' ? 700 : 400 }}>
                      {payment.status === 'pago' ? 'Pago' : 'Pendente'}
                    </Box>
                    <Box component="td" sx={cell}>{payment.paidAt ? formatDate(payment.paidAt) : '—'}</Box>
                    <Box component="td" sx={cell}>{payment.method ? methodLabel[payment.method] : '—'}</Box>
                  </Box>
                ))}
              </tbody>
            </Box>
          </Box>
          <Box sx={{ mt: 1.5, breakInside: 'avoid' }}>
            <Box>
              <Box component="span" sx={{ fontWeight: 600 }}>Total pago: </Box>
              {formatCurrency(total('pago'))}
            </Box>
            <Box>
              <Box component="span" sx={{ fontWeight: 600 }}>Total pendente: </Box>
              {formatCurrency(total('pendente'))}
            </Box>
          </Box>
        </>
      )}
    </>
  )
}
