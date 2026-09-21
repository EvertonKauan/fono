import { onlyDigits } from './cpf.ts'

const MOBILE_DIGITS = 11
const LANDLINE_DIGITS = 10

// Celular começa em 9 depois do DDD; o resto é fixo. Só dá para saber a partir do 3º dígito.
const isMobile = (digits: string) => digits[2] === '9'

// Colar "+55 (11) 9 1234-5678" (13 dígitos) ou "+55 11 3333-4444" (12) traz o código do país: descarta o 55.
// Com 12 dígitos só descarta se não for celular, para não confundir com o DDD 55 ganhando um dígito a mais.
const nationalDigits = (input: string) => {
  const digits = onlyDigits(input)
  const withCountry = digits.startsWith('55') && (digits.length >= MOBILE_DIGITS + 2 || (digits.length === LANDLINE_DIGITS + 2 && digits[4] !== '9'))
  return withCountry ? digits.slice(2) : digits
}

// Máscara progressiva: celular "(11) 9 1111-1111" (11 dígitos) ou fixo "(11) 3333-4444" (10 dígitos).
// Aceita texto solto e devolve só o que já foi digitado.
export function formatPhone(input: string): string {
  const all = nationalDigits(input)
  const d = all.slice(0, isMobile(all) ? MOBILE_DIGITS : LANDLINE_DIGITS)
  if (d.length === 0) return ''
  let out = `(${d.slice(0, 2)}`
  if (d.length <= 2) return out
  if (isMobile(d)) {
    out += `) ${d.slice(2, 3)}`
    if (d.length > 3) out += ` ${d.slice(3, 7)}`
    if (d.length > 7) out += `-${d.slice(7)}`
  } else {
    out += `) ${d.slice(2, 6)}`
    if (d.length > 6) out += `-${d.slice(6)}`
  }
  return out
}

// Posição do cursor logo depois do n-ésimo dígito do texto formatado.
export function caretAfterDigits(formatted: string, count: number): number {
  if (count <= 0) return formatted ? 1 : 0
  let seen = 0
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]!) && ++seen === count) return i + 1
  }
  return formatted.length
}

// Aplica uma edição do campo: reformata e diz onde deixar o cursor.
// Apagar só um caractere da máscara (espaço, parêntese, hífen) apaga o dígito anterior, senão a máscara "desfaria" a edição.
export function editPhone(previous: string, raw: string, caret: number): { value: string; caret: number } {
  let digits = nationalDigits(raw)
  let before = onlyDigits(raw.slice(0, caret)).length
  if (raw.length < previous.length && digits.length === onlyDigits(previous).length && before > 0) {
    digits = digits.slice(0, before - 1) + digits.slice(before)
    before -= 1
  }
  const value = formatPhone(digits)
  return { value, caret: caretAfterDigits(value, Math.min(before, onlyDigits(value).length)) }
}
