import { useEffect, useState } from 'react'
import Accordion from '@mui/material/Accordion'
import Alert from '@mui/material/Alert'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useTenantId } from '../../../auth/useSession.ts'
import AttachmentsField from '../../../components/AttachmentsField.tsx'
import Toast from '../../../components/Toast.tsx'
import { useAttachmentDraft } from '../../../components/useAttachmentDraft.ts'
import { visibleSections } from '../../../mocks/anamnese-schema.ts'
import { getAnamnese, saveAnamnese } from '../../../services/anamnese.ts'
import type { Anamnese, AnamneseAnswer, Patient } from '../../../types/domain.ts'
import { formatDateTime, kindLabel } from '../../../utils/format.ts'
import { SAVE_ERROR } from '../../../utils/messages.ts'
import QuestionField from './QuestionField.tsx'

export default function AnamneseTab({ patient }: { patient: Patient }) {
  const tenantId = useTenantId()
  // undefined = carregando; null = paciente ainda sem anamnese
  const [saved, setSaved] = useState<Anamnese | null>()

  useEffect(() => {
    let active = true
    getAnamnese(tenantId, patient.id).then((anamnese) => {
      if (active) setSaved(anamnese ?? null)
    })
    return () => {
      active = false
    }
  }, [tenantId, patient.id])

  if (saved === undefined) return null
  return <AnamneseForm patient={patient} initial={saved} />
}

function AnamneseForm({ patient, initial }: { patient: Patient; initial: Anamnese | null }) {
  const tenantId = useTenantId()
  const [answers, setAnswers] = useState<Record<string, AnamneseAnswer>>(initial?.answers ?? {})
  // Voz: ligada para adulto e desligada para criança, até haver uma escolha salva.
  const [voiceApplicable, setVoiceApplicable] = useState(initial?.voiceApplicable ?? patient.kind === 'adulto')
  const [updatedAt, setUpdatedAt] = useState(initial?.updatedAt ?? null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const attachments = useAttachmentDraft({ type: 'anamnese', id: patient.id })

  const setAnswer = (id: string, answer: AnamneseAnswer | undefined) => {
    const next = { ...answers }
    if (answer === undefined) delete next[id]
    else next[id] = answer
    setAnswers(next)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      // Respostas de perguntas ocultas pelo tipo atual são mantidas, para não se perderem se o tipo voltar.
      const saved = await saveAnamnese(tenantId, { patientId: patient.id, answers, voiceApplicable })
      setUpdatedAt(saved.updatedAt)
      try {
        await attachments.apply()
      } catch {
        setError('A anamnese foi salva, mas não foi possível gravar os anexos. Tente salvar de novo.')
        return
      }
      setToast('Anamnese salva.')
    } catch {
      setError(SAVE_ERROR)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 840 }}>
      <Typography variant="body2" color="text.secondary">
        Perguntas para {kindLabel[patient.kind]}. Trocar o tipo na aba Dados não apaga respostas já salvas.
      </Typography>

      <Box>
        {visibleSections(patient.kind).map(({ section, questions }, index) => {
          const off = section.optional && !voiceApplicable
          const answered = questions.filter((question) => answers[question.id] !== undefined).length
          return (
            <Accordion key={section.id} defaultExpanded={index === 0} slotProps={{ heading: { component: 'h2' } }}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`anamnese-${section.id}-content`}
                id={`anamnese-${section.id}-header`}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} sx={{ width: '100%', pr: 1 }}>
                  <Typography variant="h6" component="span">
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="span">
                    {off ? 'Não aplicável' : `${answered}/${questions.length}`}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails id={`anamnese-${section.id}-content`}>
                <Stack spacing={2.5}>
                  {section.optional && (
                    <FormControlLabel
                      label="Aplicável"
                      control={<Switch checked={voiceApplicable} onChange={(event) => setVoiceApplicable(event.target.checked)} />}
                    />
                  )}
                  {off ? (
                    <Typography color="text.secondary">Seção marcada como não aplicável a este paciente.</Typography>
                  ) : (
                    questions.map((question) => (
                      <QuestionField
                        key={question.id}
                        question={question}
                        answer={answers[question.id]}
                        onChange={(answer) => setAnswer(question.id, answer)}
                      />
                    ))
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Box>

      <AttachmentsField title="Anexos da anamnese" attachments={attachments} saveNote="ao salvar a anamnese" />

      {error && <Alert severity="error">{error}</Alert>}

      <Stack
        direction="row"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar - 1,
          py: 1.5,
          bgcolor: 'background.default',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          Salvar anamnese
        </Button>
        <Typography variant="body2" color="text.secondary">
          {updatedAt ? `Última atualização: ${formatDateTime(updatedAt)}` : 'Ainda não salva.'}
        </Typography>
      </Stack>
      <Toast message={toast} onClose={() => setToast(null)} />
    </Stack>
  )
}
