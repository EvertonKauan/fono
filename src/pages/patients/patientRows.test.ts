import { describe, expect, it } from 'vitest'
import type { Patient } from '../../types/domain.ts'
import { filterPatients } from './patientRows.ts'

const make = (id: string, fullName: string, kind: Patient['kind']): Patient => ({
  id,
  tenantId: 't',
  kind,
  fullName,
  birthDate: '2000-01-01',
  guardians: [],
  visit: { fee: 100, weekdays: [] },
  createdAt: '2026-01-01T00:00:00.000Z',
})

const patients = [
  make('1', 'Lívia Cardoso', 'crianca'),
  make('2', 'Carlos Menezes', 'adulto'),
  make('3', 'Sandra Pacheco', 'adulto'),
]
const pending = new Set(['2'])
const all = { query: '', kind: 'todos', onlyPending: false } as const

describe('filterPatients', () => {
  it('busca sem diferenciar maiúsculas nem acentos', () => {
    expect(filterPatients(patients, pending, { ...all, query: 'LIVIA' }).map((p) => p.id)).toEqual(['1'])
    expect(filterPatients(patients, pending, { ...all, query: 'menezes ' }).map((p) => p.id)).toEqual(['2'])
  })

  it('filtra por tipo', () => {
    expect(filterPatients(patients, pending, { ...all, kind: 'adulto' })).toHaveLength(2)
  })

  it('mostra só pacientes com lançamento pendente', () => {
    expect(filterPatients(patients, pending, { ...all, onlyPending: true }).map((p) => p.id)).toEqual(['2'])
  })
})
