import { useState } from 'react'
import TextField from '@mui/material/TextField'
import { formatCpf, isValidCpf, maskCpf, onlyDigits } from '../utils/cpf.ts'

type Props = {
  label: string
  name: string
  value: string // só dígitos
  onChange: (digits: string) => void
  onBlur?: () => void
  required?: boolean
  error?: boolean
  helperText?: string
}

// Em edição mostra 000.000.000-00; fora de foco, um CPF válido aparece mascarado (LGPD).
export default function CpfField({ value, onChange, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false)
  const shown = !focused && isValidCpf(value) ? maskCpf(value) : formatCpf(value)

  return (
    <TextField
      {...rest}
      value={shown}
      onChange={(event) => onChange(onlyDigits(event.target.value).slice(0, 11))}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false)
        onBlur?.()
      }}
      fullWidth
      slotProps={{ htmlInput: { inputMode: 'numeric', autoComplete: 'off' } }}
    />
  )
}
