import type { Patient } from '../types/domain.ts'
import { normalizeText } from '../utils/format.ts'

// Opções do campo "Paciente" ao criar sessão: só pacientes ativos do tenant, por nome sem acento nem maiúsculas.
export function patientOptions(patients: Patient[], tenantId: string, query = ''): Patient[] {
  const term = normalizeText(query.trim())
  return patients
    .filter((p) => p.tenantId === tenantId && !p.archivedAt && normalizeText(p.fullName).includes(term))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'pt-BR'))
}
