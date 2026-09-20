import type { Payment } from '../../../types/domain.ts'

export const hasPending = (payments: Payment[]) => payments.some((p) => p.status === 'pendente')

export const yearOf = (period: string) => Number(period.slice(0, 4))

// competência mais recente primeiro
export const byPeriodDesc = (a: Payment, b: Payment) => b.period.localeCompare(a.period)

export function summarize(payments: Payment[], year: number) {
  const total = (status: Payment['status']) =>
    payments
      .filter((p) => yearOf(p.period) === year && p.status === status)
      .reduce((sum, p) => sum + Math.round(p.amount * 100), 0) / 100
  return { pending: total('pendente'), paid: total('pago') }
}

// anos com lançamentos, mais o atual; do mais recente para o mais antigo
export function availableYears(payments: Payment[], currentYear: number) {
  const years = new Set([currentYear, ...payments.map((p) => yearOf(p.period))])
  return [...years].sort((a, b) => b - a)
}

// abre no ano do lançamento pendente mais recente, para o alerta do cabeçalho ter correspondência na lista
export function defaultYear(payments: Payment[], currentYear: number) {
  const pending = payments.filter((p) => p.status === 'pendente').map((p) => yearOf(p.period))
  return pending.length ? Math.max(...pending) : currentYear
}
