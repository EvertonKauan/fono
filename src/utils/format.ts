import type { PatientKind } from '../types/domain.ts'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// yyyy-mm-dd → dd/mm/aaaa
export const formatDate = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')

export const formatCurrency = (value: number) => brl.format(value)

// competência yyyy-mm → mm/aaaa
export const formatPeriod = (period: string) => period.slice(0, 7).split('-').reverse().join('/')

export const kindLabel: Record<PatientKind, string> = { crianca: 'Criança', adulto: 'Adulto' }

export const formatAge = (age: number) => (age === 1 ? '1 ano' : `${age} anos`)

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// 0=dom … 6=sáb → "Ter, Qui"
export const formatWeekdays = (days: number[]) =>
  days.length ? [...days].sort((a, b) => a - b).map((day) => WEEKDAYS[day]).join(', ') : '—'

// minúsculas e sem acentos, para busca
export const normalizeText = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
