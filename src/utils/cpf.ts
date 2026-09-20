export const onlyDigits = (value: string) => value.replace(/\D/g, '')

function checkDigit(digits: string, length: number) {
  let sum = 0
  for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i)
  const rest = (sum * 10) % 11
  return rest === 10 ? 0 : rest
}

export function isValidCpf(value: string) {
  const digits = onlyDigits(value)
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false
  return checkDigit(digits, 9) === Number(digits[9]) && checkDigit(digits, 10) === Number(digits[10])
}

// 000.000.000-00, aceitando entrada parcial
export function formatCpf(value: string) {
  const d = onlyDigits(value).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

// ***.456.789-** — para listagens e cabeçalho (LGPD)
export function maskCpf(value: string) {
  const d = onlyDigits(value)
  if (d.length !== 11) return ''
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`
}
