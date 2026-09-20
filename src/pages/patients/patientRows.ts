import type { Patient, PatientKind } from '../../types/domain.ts'
import { ageOf } from '../../utils/age.ts'
import { formatWeekdays, kindLabel, normalizeText } from '../../utils/format.ts'

export type PatientRow = {
  id: string
  fullName: string
  kind: string
  age: number
  days: string
  fee: number
  pending: boolean
  phone: string
}

export type PatientFilters = { query: string; kind: PatientKind | 'todos'; onlyPending: boolean }

export function filterPatients(
  patients: Patient[],
  pendingIds: Set<string>,
  { query, kind, onlyPending }: PatientFilters,
) {
  const term = normalizeText(query.trim())
  return patients.filter(
    (p) =>
      normalizeText(p.fullName).includes(term) &&
      (kind === 'todos' || p.kind === kind) &&
      (!onlyPending || pendingIds.has(p.id)),
  )
}

export function toRow(patient: Patient, pendingIds: Set<string>): PatientRow {
  return {
    id: patient.id,
    fullName: patient.fullName,
    kind: kindLabel[patient.kind],
    age: ageOf(patient.birthDate),
    days: formatWeekdays(patient.visit.weekdays),
    fee: patient.visit.fee,
    pending: pendingIds.has(patient.id),
    phone: patient.phone ?? '',
  }
}
