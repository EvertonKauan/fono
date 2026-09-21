import type { Prescription } from '../types/domain.ts'
import { selectRows, upsertRow } from './db.ts'
import { newId } from '../utils/id.ts'

// mais recente primeiro
export async function listPrescriptions(tenantId: string, patientId: string): Promise<Prescription[]> {
  return selectRows('prescriptions', tenantId)
    .filter((p) => p.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function createPrescription(
  tenantId: string,
  input: Omit<Prescription, 'id' | 'tenantId'>,
): Promise<Prescription> {
  const prescription: Prescription = { ...input, id: newId(), tenantId }
  upsertRow('prescriptions', tenantId, prescription)
  return prescription
}

export async function savePrescription(tenantId: string, prescription: Prescription): Promise<Prescription> {
  upsertRow('prescriptions', tenantId, prescription)
  return prescription
}
