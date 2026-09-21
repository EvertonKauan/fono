import { describe, expect, it } from 'vitest'
import { createSeed } from './seed.ts'

const seed = createSeed()

describe('seed do financeiro automático', () => {
  it('toda sessão tem valor maior que zero', () => {
    expect(seed.sessions.every((s) => s.value > 0)).toBe(true)
  })

  it('lançamentos de setembro/2026 batem com as sessões Realizadas contadas neles', () => {
    const september = seed.payments.filter((p) => p.period === '2026-09')
    expect(september.length).toBeGreaterThan(0)
    for (const payment of september) {
      const counted = seed.sessions.filter((s) => s.counted?.paymentId === payment.id)
      expect(counted.length).toBe(payment.sessions)
      expect(counted.every((s) => s.status === 'realizada' && s.patientId === payment.patientId && s.date.startsWith('2026-09'))).toBe(true)
      expect(Math.round(counted.reduce((sum, s) => sum + s.value, 0) * 100) / 100).toBe(payment.amount)
    }
  })

  it('toda sessão Realizada de setembro com lançamento está contada; só Realizada tem vínculo', () => {
    const paymentIds = new Set(seed.payments.map((p) => p.id))
    for (const s of seed.sessions) {
      if (!s.counted) continue
      expect(paymentIds.has(s.counted.paymentId)).toBe(true)
      expect(s.status).toBe('realizada')
    }
    expect(seed.sessions.filter((s) => s.status === 'realizada' && s.date.startsWith('2026-09') && !s.counted)).toEqual([])
  })

  it('continua com pelo menos 3 pacientes com lançamento pendente e um pago em setembro', () => {
    const clau = seed.payments.filter((p) => p.tenantId === 'claudionaria')
    expect(new Set(clau.filter((p) => p.status === 'pendente').map((p) => p.patientId)).size).toBeGreaterThanOrEqual(3)
    expect(clau.some((p) => p.period === '2026-09' && p.status === 'pago')).toBe(true)
  })

  it('a sessão mais recente do Miguel tem valor diferente das outras (exercita a sugestão)', () => {
    const miguel = seed.sessions.filter((s) => s.patientId === 'p-001')
    expect(new Set(miguel.map((s) => s.value)).size).toBe(2)
    expect(miguel.find((s) => s.date === '2026-09-29')!.value).toBe(170)
  })
})
