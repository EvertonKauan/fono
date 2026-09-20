import { useState } from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { formatDecimal, parseMoney } from '../utils/format.ts'

type Props = {
  label: string
  name: string
  value: number
  onChange: (value: number) => void
  required?: boolean
  error?: boolean
  helperText?: string
}

// Guarda o texto digitado só durante a edição; fora dela mostra o valor formatado.
export default function MoneyField({ value, onChange, ...rest }: Props) {
  const [text, setText] = useState<string | null>(null)

  return (
    <TextField
      {...rest}
      value={text ?? formatDecimal(value)}
      onFocus={(event) => {
        setText(formatDecimal(value))
        event.target.select()
      }}
      onChange={(event) => {
        setText(event.target.value)
        onChange(parseMoney(event.target.value))
      }}
      onBlur={() => setText(null)}
      fullWidth
      slotProps={{
        htmlInput: { inputMode: 'decimal', autoComplete: 'off' },
        input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> },
      }}
    />
  )
}
