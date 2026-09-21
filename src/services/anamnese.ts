import type { Anamnese } from '../types/domain.ts'
import { selectRows, upsertRow } from './db.ts'
import { newId } from '../utils/id.ts'

export async function getAnamnese(tenantId: string, patientId: string): Promise<Anamnese | undefined> {
  return selectRows('anamneses', tenantId).find((a) => a.patientId === patientId)
}

// Uma anamnese por paciente: reaproveita o registro existente.
export async function saveAnamnese(
  tenantId: string,
  input: Pick<Anamnese, 'patientId' | 'answers' | 'voiceApplicable'>,
): Promise<Anamnese> {
  const existing = await getAnamnese(tenantId, input.patientId)
  const anamnese: Anamnese = {
    ...input,
    id: existing?.id ?? newId(),
    tenantId,
    updatedAt: new Date().toISOString(),
  }
  upsertRow('anamneses', tenantId, anamnese)
  return anamnese
}
