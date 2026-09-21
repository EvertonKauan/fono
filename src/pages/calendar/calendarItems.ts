import type { Patient, Session } from '../../types/domain.ts'

export type CalendarItem = { session: Session; patientName: string }

// Só sessões de pacientes ativos do mesmo tenant; sessão de arquivado (ou de paciente desconhecido) não aparece.
export function toCalendarItems(sessions: Session[], patients: Patient[]): CalendarItem[] {
  const active = new Map(patients.filter((p) => !p.archivedAt).map((p) => [p.id, p]))
  return sessions.flatMap((session) => {
    const patient = active.get(session.patientId)
    return patient && patient.tenantId === session.tenantId ? [{ session, patientName: patient.fullName }] : []
  })
}
