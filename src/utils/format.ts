import dayjs from 'dayjs'
import type { PatientKind, PaymentMethod, Session, SessionStatus } from '../types/domain.ts'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// yyyy-mm-dd → dd/mm/aaaa
export const formatDate = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')

// instante ISO → dd/mm/aaaa às HH:mm, no fuso local
export const formatDateTime = (iso: string) => dayjs(iso).format('DD/MM/YYYY [às] HH:mm')

export const formatCurrency = (value: number) => brl.format(value)

// competência yyyy-mm → mm/aaaa
export const formatPeriod = (period: string) => period.slice(0, 7).split('-').reverse().join('/')

export const kindLabel: Record<PatientKind, string> = { crianca: 'Criança', adulto: 'Adulto' }

export const formatAge = (age: number) => (age === 1 ? '1 ano' : `${age} anos`)

export const weekdayShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const weekdayLong = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

// 0=dom … 6=sáb → "Ter, Qui"
export const formatWeekdays = (days: number[]) =>
  days.length ? [...days].sort((a, b) => a - b).map((day) => weekdayShort[day]).join(', ') : '—'

// minúsculas e sem acentos, para busca
export const normalizeText = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export const methodLabel: Record<PaymentMethod, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  outro: 'Outro',
}

const decimal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// 1234.5 → "1.234,50" (sem o símbolo da moeda, para campos de entrada)
export const formatDecimal = (value: number) => decimal.format(value)

// "1.234,50", "150,5" ou "150.50" → número; até 2 dígitos após o último separador são centavos
export function parseMoney(text: string) {
  const clean = text.replace(/[^\d.,]/g, '')
  const separator = Math.max(clean.lastIndexOf(','), clean.lastIndexOf('.'))
  const cents = separator >= 0 ? clean.slice(separator + 1) : ''
  const whole = (cents.length > 0 && cents.length <= 2 ? clean.slice(0, separator) : clean).replace(/\D/g, '')
  const value = Number(`${whole || '0'}.${cents.length <= 2 ? cents || '0' : '0'}`)
  return Number.isFinite(value) ? value : 0
}

export const sessionStatusLabel: Record<SessionStatus, string> = {
  agendada: 'Agendada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
}

// "Particular" ou "Convênio: <nome>"
export const billingLabel = (session: Pick<Session, 'billing' | 'insurer'>) =>
  session.billing === 'convenio' ? `Convênio: ${session.insurer ?? ''}`.trim() : 'Particular'

