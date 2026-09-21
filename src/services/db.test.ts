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
