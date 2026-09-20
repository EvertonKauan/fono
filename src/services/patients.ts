import type { Patient, PatientKind } from '../types/domain.ts'
import { selectRows, upsertRow } from './db.ts'

export type NewPatient = { fullName: string; birthDate: string; kind: PatientKind; phone?: string }

export async function listPatients(tenantId: string): Promise<Patient[]> {
  return selectRows('patients', tenantId)
}

export async function createPatient(tenantId: string, input: NewPatient): Promise<Patient> {
  const patient: Patient = {
    ...input,
    id: crypto.randomUUID(),
    tenantId,
    guardians: [],
    visit: { fee: 0, weekdays: [] },
    createdAt: new Date().toISOString(),
  }
  upsertRow('patients', tenantId, patient)
  return patient
}

export async function savePatient(tenantId: string, patient: Patient): Promise<Patient> {
  upsertRow('patients', tenantId, patient)
  return patient
}
