import { describe, expect, it } from 'vitest'
import type { Payment } from '../../../types/domain.ts'
import { availableYears, defaultYear, hasPending, summarize } from './financeiro.ts'

const pay = (period: string, amount: number, status: Payment['status']): Payment => ({
  id: period + amount,
  tenantId: 't',
  patientId: 'p',
  period,
  sessions: 4,
  amount,
  status,
})

const payments = [
  pay('2026-07', 600.1, 'pago'),
  pay('2026-08', 0.2, 'pago'),
  pay('2026-09', 600, 'pendente'),
  pay('2025-12', 500, 'pago'),
]

describe('financeiro', () => {
  it('soma pago e pendente só do ano selecionado, sem erro de ponto flutuante', () => {
    expect(summarize(payments, 2026)).toEqual({ pending: 600, paid: 600.3 })
    expect(summarize(payments, 2025)).toEqual({ pending: 0, paid: 500 })
  })

  it('o paciente fica pendente se existir ao menos um lançamento pendente', () => {
    expect(hasPending(payments)).toBe(true)
    expect(hasPending(payments.filter((p) => p.status === 'pago'))).toBe(false)
  })

  it('lista anos e escolhe o ano inicial', () => {
    expect(availableYears(payments, 2026)).toEqual([2026, 2025])
    expect(availableYears([], 2026)).toEqual([2026])
    expect(defaultYear(payments, 2027)).toBe(2026)
    expect(defaultYear([pay('2025-12', 1, 'pago')], 2026)).toBe(2026)
  })
})
