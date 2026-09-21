import { describe, expect, it } from 'vitest'
import type { Patient } from '../../types/domain.ts'
import { filterPatients, initialsOf, summarizePatients, type PatientFilters } from './patientRows.ts'

const make = (id: string, fullName: string, kind: Patient['kind'], archivedAt?: string): Patient => ({
  id,
  tenantId: 't',
  kind,
  fullName,
  birthDate: '2000-01-01',
  guardians: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  archivedAt,
})

const patients = [
  make('1', 'Lívia Cardoso', 'crianca'),
  make('2', 'Carlos Menezes', 'adulto'),
  make('3', 'Sandra Pacheco', 'adulto'),
  make('4', 'Otávio Ramos', 'adulto', '2026-08-30T15:00:00.000Z'),
]
const pending = new Set(['2', '4'])
const all: PatientFilters = { query: '', kind: 'todos', onlyPending: false, status: 'todos' }
const ids = (filters: Partial<PatientFilters>) => filterPatients(patients, pending, { ...all, ...filters }).map((p) => p.id)

describe('filterPatients', () => {
  it('busca sem diferenciar maiúsculas nem acentos', () => {
    expect(ids({ query: 'LIVIA' })).toEqual(['1'])
    expect(ids({ query: 'menezes ' })).toEqual(['2'])
    expect(ids({ query: 'otavio' })).toEqual(['4'])
  })

  it('filtra por tipo', () => {
    expect(ids({ kind: 'adulto' })).toEqual(['2', '3', '4'])
  })

  it('mostra só pacientes com lançamento pendente', () => {
    expect(ids({ onlyPending: true })).toEqual(['2', '4'])
  })

  it('situação: ativos (padrão), arquivados ou todos', () => {
    expect(ids({ status: 'ativos' })).toEqual(['1', '2', '3'])
    expect(ids({ status: 'arquivados' })).toEqual(['4'])
    expect(ids({ status: 'todos' })).toEqual(['1', '2', '3', '4'])
  })

  it('a situação combina com os demais filtros', () => {
    expect(ids({ status: 'ativos', onlyPending: true })).toEqual(['2'])
    expect(ids({ status: 'arquivados', kind: 'crianca' })).toEqual([])
  })
})

describe('initialsOf', () => {
  it('usa a primeira letra do primeiro e do último nome, em maiúscula', () => {
    expect(initialsOf('Miguel Andrade Lopes')).toBe('ML')
    expect(initialsOf('lívia cardoso prado')).toBe('LP')
    expect(initialsOf('Ana Silva')).toBe('AS')
  })

  it('nome único, espaços sobrando e vazio', () => {
    expect(initialsOf('Cher')).toBe('C')
    expect(initialsOf('  Maria   de   Souza  ')).toBe('MS')
    expect(initialsOf('   ')).toBe('')
  })
})

describe('summarizePatients', () => {
  it('conta ativos, total e pendentes só entre os ativos', () => {
    expect(summarizePatients(patients, pending)).toEqual({ active: 3, total: 4, pending: 1 })
  })

  it('sem pacientes, tudo zero', () => {
    expect(summarizePatients([], new Set())).toEqual({ active: 0, total: 0, pending: 0 })
  })
})
