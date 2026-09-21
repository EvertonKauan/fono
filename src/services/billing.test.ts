import { describe, expect, it } from 'vitest'
import type { Payment, Session } from '../types/domain.ts'
import { applySessionBilling, suggestedValue } from './billing.ts'

const T = 'claudionaria'
const P = 'p-001'

const session = (over: Partial<Session> = {}): Session => ({
  id: 'ses-1',
  tenantId: T,
  patientId: P,
  date: '2026-09-10',
  time: '15:00',
  status: 'agendada',
  billing: 'particular',
  value: 150,
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
  ...over,
})

const payment = (over: Partial<Payment> = {}): Payment => ({
  id: 'pay-1',
  tenantId: T,
  patientId: P,
  period: '2026-09',
  sessions: 1,
  amount: 150,
  status: 'pendente',
  ...over,
})

const done = (over: Partial<Session> = {}) => session({ status: 'realizada', ...over })

describe('applySessionBilling: entra em Realizada', () => {
  it('sem lançamento, cria um Pendente da competência com 1 sessão e o valor da sessão', () => {
    const { session: saved, payments } = applySessionBilling(undefined, done(), [])
    expect(payments).toHaveLength(1)
    expect(payments[0]).toMatchObject({ tenantId: T, patientId: P, period: '2026-09', sessions: 1, amount: 150, status: 'pendente' })
    expect(payments[0]!.paidAt).toBeUndefined()
    expect(saved.counted).toEqual({ paymentId: payments[0]!.id, amount: 150 })
  })

  it('a competência é o mês da data da sessão', () => {
    const { payments } = applySessionBilling(undefined, done({ date: '2026-10-01' }), [payment()])
    expect(payments.map((p) => p.period)).toEqual(['2026-09', '2026-10'])
  })

  it('já existindo um Pendente da competência, soma sessão e valor nele, sem criar outro', () => {
    const { session: saved, payments } = applySessionBilling(session(), done({ value: 160 }), [payment()])
    expect(payments).toEqual([payment({ sessions: 2, amount: 310 })])
    expect(saved.counted).toEqual({ paymentId: 'pay-1', amount: 160 })
  })

  it('se o único da competência está Pago, cria um Pendente separado e não toca no Pago', () => {
    const paid = payment({ status: 'pago', paidAt: '2026-09-05', method: 'pix' })
    const { session: saved, payments } = applySessionBilling(undefined, done(), [paid])
    expect(payments).toHaveLength(2)
    expect(payments[0]).toEqual(paid)
    expect(payments[1]).toMatchObject({ period: '2026-09', sessions: 1, amount: 150, status: 'pendente' })
    expect(saved.counted!.paymentId).toBe(payments[1]!.id)
  })

  it('com um Pago e um Pendente na competência, soma no Pendente', () => {
    const paid = payment({ id: 'pay-paid', status: 'pago', paidAt: '2026-09-05', method: 'pix' })
    const pending = payment({ id: 'pay-pend' })
    const { payments } = applySessionBilling(undefined, done(), [paid, pending])
    expect(payments[0]).toEqual(paid)
    expect(payments[1]).toMatchObject({ id: 'pay-pend', sessions: 2, amount: 300 })
  })

  it('com dois Pendentes na competência, soma no último da lista', () => {
    const { payments } = applySessionBilling(undefined, done(), [payment({ id: 'a' }), payment({ id: 'b' })])
    expect(payments.find((p) => p.id === 'a')).toMatchObject({ sessions: 1, amount: 150 })
    expect(payments.find((p) => p.id === 'b')).toMatchObject({ sessions: 2, amount: 300 })
  })

  it('não usa lançamento de outro paciente, mesmo Pendente e da mesma competência', () => {
    const other = payment({ id: 'outro', patientId: 'p-002' })
    const { payments } = applySessionBilling(undefined, done(), [other])
    expect(payments[0]).toEqual(other)
    expect(payments).toHaveLength(2)
    expect(payments[1]!.patientId).toBe(P)
  })

  it('soma em centavos, sem erro de ponto flutuante', () => {
    const { payments } = applySessionBilling(undefined, done({ value: 20.2 }), [payment({ sessions: 1, amount: 10.1 })])
    expect(payments[0]!.amount).toBe(30.3)
  })

  it('Realizada, depois de sair, volta a contar do zero se o lançamento estava Pendente', () => {
    const counted = { paymentId: 'pay-1', amount: 150 }
    const left = applySessionBilling(done({ counted }), session({ counted }), [payment({ sessions: 1, amount: 150 })])
    expect(left.payments).toEqual([])
    const back = applySessionBilling(session(), done(), left.payments)
    expect(back.payments).toHaveLength(1)
    expect(back.payments[0]).toMatchObject({ sessions: 1, amount: 150, status: 'pendente' })
  })
})

describe('applySessionBilling: sessões que não geram lançamento', () => {
  it('criar, editar ou cancelar sessão que não é Realizada não muda nada', () => {
    const list = [payment()]
    for (const status of ['agendada', 'cancelada'] as const) {
      const created = applySessionBilling(undefined, session({ status }), list)
      expect(created.payments).toBe(list)
      expect(created.session.counted).toBeUndefined()
    }
    expect(applySessionBilling(session(), session({ status: 'cancelada', value: 999 }), list).payments).toBe(list)
    expect(applySessionBilling(session({ status: 'cancelada' }), session({ status: 'agendada' }), list).payments).toBe(list)
  })

  it('Realizada antiga, sem vínculo, não gera lançamento ao ser editada (valor, evolução, data)', () => {
    const list = [payment()]
    const old = done()
    for (const edited of [done({ value: 300 }), done({ evolution: 'texto' }), done({ date: '2026-10-05' })]) {
      const result = applySessionBilling(old, edited, list)
      expect(result.payments).toBe(list)
      expect(result.session.counted).toBeUndefined()
    }
  })

  it('Realizada antiga, sem vínculo, cancelada não mexe no lançamento digitado à mão', () => {
    const list = [payment({ sessions: 8, amount: 1200 })]
    expect(applySessionBilling(done(), session({ status: 'cancelada' }), list).payments).toBe(list)
  })

  it('o vínculo da tela não vale: só o que estava gravado (previous) define o que já foi contado', () => {
    const forged = done({ counted: { paymentId: 'pay-1', amount: 150 } })
    const result = applySessionBilling(undefined, forged, [])
    expect(result.payments).toHaveLength(1)
    expect(result.session.counted!.paymentId).toBe(result.payments[0]!.id)
    expect(applySessionBilling(session(), session({ counted: { paymentId: 'x', amount: 1 } }), []).session.counted).toBeUndefined()
  })
})

describe('applySessionBilling: ajuste de Realizada já contada', () => {
  const counted = { paymentId: 'pay-1', amount: 150 }
  const before = done({ counted })

  it('cancelar tira 1 sessão e o valor dela do Pendente e solta o vínculo', () => {
    const { session: saved, payments } = applySessionBilling(before, session({ status: 'cancelada' }), [payment({ sessions: 3, amount: 450 })])
    expect(payments).toEqual([payment({ sessions: 2, amount: 300 })])
    expect(saved.counted).toBeUndefined()
  })

  it('voltar para Agendada faz o mesmo', () => {
    const { payments } = applySessionBilling(before, session({ status: 'agendada' }), [payment({ sessions: 2, amount: 300 })])
    expect(payments).toEqual([payment({ sessions: 1, amount: 150 })])
  })

  it('o lançamento que fica sem sessões é removido', () => {
    const other = payment({ id: 'pay-other', period: '2026-08', status: 'pago', paidAt: '2026-09-01', method: 'pix' })
    const { payments } = applySessionBilling(before, session({ status: 'cancelada' }), [other, payment()])
    expect(payments).toEqual([other])
  })

  it('o valor editado à mão no lançamento é preservado; o desconto não passa de zero', () => {
    const { payments } = applySessionBilling(before, session({ status: 'cancelada' }), [payment({ sessions: 2, amount: 100 })])
    expect(payments[0]!.amount).toBe(0)
  })

  it('editar o valor ajusta a diferença no Pendente e atualiza o valor contado', () => {
    const up = applySessionBilling(before, done({ value: 200, counted }), [payment({ sessions: 2, amount: 300 })])
    expect(up.payments).toEqual([payment({ sessions: 2, amount: 350 })])
    expect(up.session.counted).toEqual({ paymentId: 'pay-1', amount: 200 })
    const down = applySessionBilling(done({ value: 200, counted: { paymentId: 'pay-1', amount: 200 } }), done({ value: 120 }), up.payments)
    expect(down.payments[0]!.amount).toBe(270)
    expect(down.session.counted!.amount).toBe(120)
  })

  it('editar sem mudar o valor não altera nada', () => {
    const list = [payment()]
    const result = applySessionBilling(before, done({ evolution: 'ok' }), list)
    expect(result.payments).toBe(list)
    expect(result.session.counted).toEqual(counted)
  })

  it('trocar a data para outro mês não move a sessão de lançamento', () => {
    const list = [payment()]
    const result = applySessionBilling(before, done({ date: '2026-10-05' }), list)
    expect(result.payments).toBe(list)
    expect(result.session.counted).toEqual(counted)
  })

  it('vínculo apontando para lançamento que não existe mais é solto ao sair de Realizada', () => {
    const result = applySessionBilling(before, session({ status: 'cancelada' }), [])
    expect(result.payments).toEqual([])
    expect(result.session.counted).toBeUndefined()
  })
})

describe('applySessionBilling: lançamento Pago nunca é alterado', () => {
  const counted = { paymentId: 'pay-1', amount: 150 }
  const paid = payment({ status: 'pago', paidAt: '2026-09-12', method: 'dinheiro', sessions: 2, amount: 300 })

  it('cancelar, voltar a Agendada ou editar o valor não mexe no Pago e mantém o vínculo', () => {
    for (const next of [session({ status: 'cancelada' }), session({ status: 'agendada' }), done({ value: 999 })]) {
      const result = applySessionBilling(done({ counted }), next, [paid])
      expect(result.payments).toEqual([paid])
      expect(result.session.counted).toEqual(counted)
    }
  })

  it('voltar a Realizada depois disso não conta de novo', () => {
    const cancelled = session({ status: 'cancelada', counted })
    const result = applySessionBilling(cancelled, done({ counted }), [paid])
    expect(result.payments).toEqual([paid])
    expect(result.session.counted).toEqual(counted)
  })

  it('se o Pago for desfeito (Pendente) antes de voltar a Realizada, só a diferença de valor entra', () => {
    const reopened = payment({ sessions: 2, amount: 300 })
    const cancelled = session({ status: 'cancelada', counted })
    const result = applySessionBilling(cancelled, done({ value: 170, counted }), [reopened])
    expect(result.payments).toEqual([payment({ sessions: 2, amount: 320 })])
    expect(result.session.counted).toEqual({ paymentId: 'pay-1', amount: 170 })
  })
})

describe('suggestedValue', () => {
  it('sem histórico não sugere nada', () => {
    expect(suggestedValue([])).toBeUndefined()
  })

  it('usa a sessão mais recente por data, de qualquer status', () => {
    const list = [
      session({ id: 'a', date: '2026-09-01', value: 100, status: 'realizada' }),
      session({ id: 'b', date: '2026-09-20', value: 180, status: 'cancelada' }),
      session({ id: 'c', date: '2026-09-10', value: 120, status: 'agendada' }),
    ]
    expect(suggestedValue(list)).toBe(180)
  })

  it('inclui sessão futura, como a primeira da lista da aba Sessões', () => {
    const list = [session({ id: 'a', date: '2026-09-01', value: 100 }), session({ id: 'b', date: '2026-12-01', value: 170 })]
    expect(suggestedValue(list)).toBe(170)
  })

  it('no mesmo dia vale o horário; sem horário conta como o fim do dia; depois, a criação', () => {
    const day = { date: '2026-09-10' }
    expect(suggestedValue([session({ id: 'a', ...day, time: '09:00', value: 1 }), session({ id: 'b', ...day, time: '15:00', value: 2 })])).toBe(2)
    expect(suggestedValue([session({ id: 'a', ...day, time: '15:00', value: 1 }), session({ id: 'b', ...day, time: undefined, value: 2 })])).toBe(2)
    expect(
      suggestedValue([
        session({ id: 'a', ...day, value: 1, createdAt: '2026-09-01T10:00:00.000Z' }),
        session({ id: 'b', ...day, value: 2, createdAt: '2026-09-02T10:00:00.000Z' }),
      ]),
    ).toBe(2)
  })

  it('a ordem da lista recebida não importa', () => {
    const list = [session({ id: 'a', date: '2026-09-01', value: 1 }), session({ id: 'b', date: '2026-09-02', value: 2 })]
    expect(suggestedValue(list)).toBe(suggestedValue([...list].reverse()))
  })

  it('se a mais recente não tem valor utilizável (migrada com 0), não sugere', () => {
    expect(suggestedValue([session({ id: 'a', date: '2026-09-01', value: 150 }), session({ id: 'b', date: '2026-09-02', value: 0 })])).toBeUndefined()
  })
})
