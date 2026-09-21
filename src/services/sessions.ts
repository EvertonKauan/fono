import type { Session } from '../types/domain.ts'
import { newId } from '../utils/id.ts'
import { selectRows, upsertRow } from './db.ts'

export type NewSession = Omit<Session, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>

const byDateTime = (a: Session, b: Session) =>
  `${a.date} ${a.time ?? '99:99'}`.localeCompare(`${b.date} ${b.time ?? '99:99'}`)

// mais recente primeiro
export async function listSessions(tenantId: string, patientId: string): Promise<Session[]> {
  return selectRows('sessions', tenantId)
    .filter((s) => s.patientId === patientId)
    .sort((a, b) => byDateTime(b, a))
}

// todos os pacientes do tenant; from e to inclusivos (yyyy-mm-dd), do mais antigo para o mais novo
export async function listSessionsBetween(tenantId: string, from: string, to: string): Promise<Session[]> {
  return selectRows('sessions', tenantId)
    .filter((s) => s.date >= from && s.date <= to)
    .sort(byDateTime)
}

export async function createSession(tenantId: string, input: NewSession): Promise<Session> {
  const now = new Date().toISOString()
  const session: Session = { ...input, id: newId(), tenantId, createdAt: now, updatedAt: now }
  upsertRow('sessions', tenantId, session)
  return session
}

export async function saveSession(tenantId: string, session: Session): Promise<Session> {
  const saved = { ...session, updatedAt: new Date().toISOString() }
  upsertRow('sessions', tenantId, saved)
  return saved
}
