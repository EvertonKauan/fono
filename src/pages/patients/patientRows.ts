import type { Patient, PatientKind } from '../../types/domain.ts'
import { ageOf } from '../../utils/age.ts'
import { kindLabel, normalizeText } from '../../utils/format.ts'

export type PatientRow = {
  id: string
  fullName: string
  initials: string
  kind: string
  age: number
  pending: boolean
  archived: boolean
  phone: string
}

export type PatientStatus = 'ativos' | 'arquivados' | 'todos'

export type PatientFilters = {
  query: string
  kind: PatientKind | 'todos'
  onlyPending: boolean
  status: PatientStatus
}

export function filterPatients(
  patients: Patient[],
  pendingIds: Set<string>,
  { query, kind, onlyPending, status }: PatientFilters,
) {
  const term = normalizeText(query.trim())
  return patients.filter(
    (p) =>
      normalizeText(p.fullName).includes(term) &&
      (kind === 'todos' || p.kind === kind) &&
      (!onlyPending || pendingIds.has(p.id)) &&
      (status === 'todos' || (status === 'arquivados') === Boolean(p.archivedAt)),
  )
}

export function toRow(patient: Patient, pendingIds: Set<string>): PatientRow {
  return {
    id: patient.id,
    fullName: patient.fullName,
    initials: initialsOf(patient.fullName),
    kind: kindLabel[patient.kind],
    age: ageOf(patient.birthDate),
    pending: pendingIds.has(patient.id),
    archived: Boolean(patient.archivedAt),
    phone: patient.phone ?? '',
  }
}

// Primeira letra do primeiro e do último nome ("Miguel Andrade Lopes" → "ML"); um nome só dá uma letra.
export function initialsOf(fullName: string) {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words
  return letters.map((word) => word!.charAt(0).toLocaleUpperCase('pt-BR')).join('')
}

export type PatientsSummary = { active: number; total: number; pending: number }

// Indicadores da lista: só pacientes ativos entram em "ativos" e em "pendentes"; "total" inclui os arquivados.
export function summarizePatients(patients: Patient[], pendingIds: Set<string>): PatientsSummary {
  const active = patients.filter((p) => !p.archivedAt)
  return { active: active.length, total: patients.length, pending: active.filter((p) => pendingIds.has(p.id)).length }
}
