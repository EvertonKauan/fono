import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import type { Question } from '../../../mocks/anamnese-schema.ts'
import type { AnamneseAnswer } from '../../../types/domain.ts'

type Props = {
  question: Question
  answer: AnamneseAnswer | undefined
  onChange: (answer: AnamneseAnswer | undefined) => void
}

// O enunciado fica visível acima do campo (e não como rótulo flutuante), pois as perguntas são longas.
export default function QuestionField({ question, answer, onChange }: Props) {
  const inputId = `q-${question.id}`
  const labelId = `${inputId}-label`
  const text = typeof answer === 'string' ? answer : ''
  const yesNo = typeof answer === 'object' ? answer : undefined

  return (
    <Stack spacing={0.75}>
      <Typography
        id={labelId}
        component={question.type === 'texto' ? 'label' : 'span'}
        htmlFor={question.type === 'texto' ? inputId : undefined}
        variant="body2"
        sx={{ fontWeight: 600 }}
      >
        {question.label}
      </Typography>

      {question.type === 'texto' && (
        <TextField
          id={inputId}
          name={question.id}
          value={text}
          onChange={(event) => onChange(event.target.value || undefined)}
          multiline
          fullWidth
        />
      )}

      {question.type === 'escolha' && (
        <TextField
          select
          id={inputId}
          name={question.id}
          value={text}
          onChange={(event) => onChange(event.target.value || undefined)}
          fullWidth
          slotProps={{ select: { labelId, displayEmpty: true } }}
        >
          <MenuItem value="">Não informado</MenuItem>
          {question.options?.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      )}

      {question.type === 'simNao' && (
        <>
          <Box>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              aria-labelledby={labelId}
              value={yesNo ? yesNo.yes : null}
              onChange={(_, yes: boolean | null) => onChange(yes === null ? undefined : { yes, detail: yes ? yesNo?.detail : undefined })}
            >
              <ToggleButton value={true} sx={{ px: 3 }}>
                Sim
              </ToggleButton>
              <ToggleButton value={false} sx={{ px: 3 }}>
                Não
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {yesNo?.yes && (
            <TextField
              name={`${question.id}_detalhe`}
              label="Detalhes"
              value={yesNo.detail ?? ''}
              onChange={(event) => onChange({ yes: true, detail: event.target.value || undefined })}
              multiline
              fullWidth
              slotProps={{ htmlInput: { 'aria-label': `Detalhes: ${question.label}` } }}
            />
          )}
        </>
      )}
    </Stack>
  )
}
