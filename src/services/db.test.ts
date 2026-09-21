import { describe, expect, it } from 'vitest'
import { createSeed } from '../mocks/seed.ts'
import { migrateDb } from './db.ts'

const legacy = () => {
  const seed = createSeed()
  return {
    tenants: seed.tenants,
    users: seed.users,
    patients: seed.patients,
    anamneses: seed.anamneses,
    prescriptions: seed.prescriptions,
    payments: seed.payments,
  }
}

describe('migrateDb', () => {
  it('preenche a tabela sessions ausente a partir do seed, sem tocar nas existentes', () => {
    const old = legacy()
    old.patients = old.patients.map((p) => (p.id === 'p-001' ? { ...p, fullName: 'Nome editado pelo usuário' } : p))
    const result = migrateDb(old)!
    expect(result.changed).toBe(true)
    expect(result.db.sessions.length).toBeGreaterThan(0)
    expect(result.db.patients.find((p) => p.id === 'p-001')!.fullName).toBe('Nome editado pelo usuário')
    expect(result.db.payments).toBe(old.payments)
  })

  it('só traz sessões de pacientes que existem no banco antigo', () => {
    const old = legacy()
    old.patients = old.patients.filter((p) => p.id !== 'p-009')
    const ids = new Set(migrateDb(old)!.db.sessions.map((s) => s.patientId))
    expect(ids.has('p-009')).toBe(false)
    expect(ids.has('p-001')).toBe(true)
  })

  it('sessão antiga sem valor recebe o antigo valor da consulta do paciente, sem tocar em lançamentos', () => {
    const full = createSeed()
    const old = {
      ...full,
      patients: full.patients.map((p) => ({ ...p, visit: { fee: p.id === 'p-001' ? 175 : 100, weekdays: [2, 4] } })),
      sessions: full.sessions.map((s) => {
        const legacySession: Partial<typeof s> = { ...s }
        delete legacySession.value
        return legacySession as typeof s
      }),
    }
    const result = migrateDb(old)!
    expect(result.changed).toBe(true)
    const mine = result.db.sessions.filter((s) => s.patientId === 'p-001')
    expect(mine.length).toBeGreaterThan(0)
    expect(mine.every((s) => s.value === 175)).toBe(true)
    expect(result.db.sessions.every((s) => typeof s.value === 'number')).toBe(true)
    expect(result.db.payments).toBe(old.payments)
    expect(migrateDb(result.db)).toEqual({ db: result.db, changed: false })
  })

  it('remove o campo visit dos pacientes já salvos, uma vez só, sem tocar no resto', () => {
    const full = createSeed()
    const old = { ...full, patients: full.patients.map((p) => ({ ...p, visit: { fee: 150, weekdays: [1], time: '09:00' } })) }
    const result = migrateDb(old)!
    expect(result.changed).toBe(true)
    expect(result.db.patients.every((p) => !('visit' in p))).toBe(true)
    expect(result.db.patients.map((p) => p.fullName)).toEqual(full.patients.map((p) => p.fullName))
    expect(result.db.payments).toBe(old.payments)
    expect(migrateDb(result.db)).toEqual({ db: result.db, changed: false })
  })

  it('sessão que já tem valor não é alterada; paciente que não existe no banco vira valor 0', () => {
    const full = createSeed()
    const sessions = [full.sessions[0]!, { ...full.sessions[1]!, patientId: 'sumiu', value: undefined as unknown as number }]
    const result = migrateDb({ ...full, sessions })!
    expect(result.db.sessions[0]).toBe(sessions[0])
    expect(result.db.sessions[1]!.value).toBe(0)
  })

  it('banco já migrado fica igual', () => {
    const full = createSeed()
    expect(migrateDb(full)).toEqual({ db: full, changed: false })
  })

  it('objeto ilegível não é migrado (será recriado)', () => {
    expect(migrateDb(null)).toBeNull()
    expect(migrateDb({ patients: [] })).toBeNull()
    expect(migrateDb('lixo')).toBeNull()
  })
})
