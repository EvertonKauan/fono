import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Add from '@mui/icons-material/Add'
import Edit from '@mui/icons-material/Edit'
import { useTenantId } from '../../../auth/useSession.ts'
import SessionDialog from '../../../components/SessionDialog.tsx'
import SessionStatusLabel from '../../../components/SessionStatusLabel.tsx'
import Toast from '../../../components/Toast.tsx'
import { suggestedValue } from '../../../services/billing.ts'
import { listPayments } from '../../../services/payments.ts'
import { listSessions } from '../../../services/sessions.ts'
import type { Patient, Payment, Session } from '../../../types/domain.ts'
import { billingLabel, formatCurrency, formatDate } from '../../../utils/format.ts'

type DialogState = { session?: Session } | null

type Props = { patient: Patient; onPaymentsChange: (payments: Payment[]) => void }

export default function SessoesTab({ patient, onPaymentsChange }: Props) {
  const tenantId = useTenantId()
  const [sessions, setSessions] = useState<Session[]>()
  const [dialog, setDialog] = useState<DialogState>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    listSessions(tenantId, patient.id).then((list) => {
      if (active) setSessions(list)
    })
    return () => {
      active = false
    }
  }, [tenantId, patient.id])

  async function saved() {
    setSessions(await listSessions(tenantId, patient.id))
    onPaymentsChange(await listPayments(tenantId, patient.id)) // a sessão Realizada pode ter criado ou ajustado um lançamento
    setDialog(null)
    setToast('Sessão salva.')
  }

  if (!sessions) return null

  return (
    <Box component="section" sx={{ maxWidth: 840, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
        <Typography variant="h5" component="h2">
          Sessões
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialog({})}>
          Nova sessão
        </Button>
      </Stack>

      {sessions.length === 0 ? (
        <Typography color="text.secondary">Nenhuma sessão registrada. Use “Nova sessão” para criar a primeira.</Typography>
      ) : (
        <Paper component="ul" role="list" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {sessions.map((session, index) => (
            <Box
              component="li"
              key={session.id}
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
                <Stack direction="row" alignItems="baseline" columnGap={1.5} flexWrap="wrap">
                  <Typography variant="h6" component="h3">
                    {formatDate(session.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {session.time ?? 'Sem horário'}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" columnGap={1.5} rowGap={0.5} flexWrap="wrap" sx={{ my: 0.5 }}>
                  <SessionStatusLabel status={session.status} />
                  <Typography variant="body2">{billingLabel(session)}</Typography>
                  <Typography variant="body2">{formatCurrency(session.value)}</Typography>
                </Stack>
                {session.evolution && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ overflowWrap: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {session.evolution}
                  </Typography>
                )}
              </Box>
              <Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Edit />}
                  aria-label={`Editar sessão de ${formatDate(session.date)}`}
                  onClick={() => setDialog({ session })}
                >
                  Editar
                </Button>
              </Box>
            </Box>
          ))}
        </Paper>
      )}

      {dialog && (
        <SessionDialog
          patientId={patient.id}
          patientName={patient.fullName}
          session={dialog.session}
          initialValue={suggestedValue(sessions)}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      )}
      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  )
}
