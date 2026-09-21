import type { Patient, PatientKind } from '../types/domain.ts'
import { selectRows, upsertRow } from './db.ts'
import { newId } from '../utils/id.ts'

export type NewPatient = { fullName: string; birthDate: string; kind: PatientKind; phone?: string }

export async function listPatients(tenantId: string): Promise<Patient[]> {
  return selectRows('patients', tenantId)
}

export async function getPatient(tenantId: string, id: string): Promise<Patient | undefined> {
  return selectRows('patients', tenantId).find((patient) => patient.id === id)
}

export async function createPatient(tenantId: string, input: NewPatient): Promise<Patient> {
  const patient: Patient = {
    ...input,
    id: newId(),
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

async function setArchived(tenantId: string, id: string, archivedAt: string | undefined): Promise<Patient> {
  const patient = await getPatient(tenantId, id)
  if (!patient) throw new Error('Paciente não encontrado.')
  return savePatient(tenantId, { ...patient, archivedAt })
}

// Arquivar não apaga nada: só marca o paciente.
export const archivePatient = (tenantId: string, id: string) => setArchived(tenantId, id, new Date().toISOString())
export const unarchivePatient = (tenantId: string, id: string) => setArchived(tenantId, id, undefined)
