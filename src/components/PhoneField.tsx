import type { ChangeEvent } from 'react'
import TextField from '@mui/material/TextField'
import { editPhone, formatPhone } from '../utils/phone.ts'

type Props = {
  label: string
  name: string
  value: string // já formatado
  onChange: (formatted: string) => void
  fullWidth?: boolean
}

// Aplica a máscara enquanto digita (celular "(11) 9 1111-1111" ou fixo "(11) 3333-4444"), sem deixar a máscara travar o backspace nem jogar o cursor para o fim.
export default function PhoneField({ value, onChange, ...rest }: Props) {
  const shown = formatPhone(value)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const edit = editPhone(shown, input.value, input.selectionStart ?? input.value.length)
    onChange(edit.value)
    // depois de o React regravar o valor formatado o cursor iria para o fim
    requestAnimationFrame(() => {
      if (document.activeElement === input) input.setSelectionRange(edit.caret, edit.caret)
    })
  }

  return (
    <TextField
      {...rest}
      type="tel"
      value={shown}
      onChange={handleChange}
      slotProps={{ htmlInput: { inputMode: 'tel', autoComplete: 'off', placeholder: '(11) 9 9999-9999' } }}
    />
  )
}
