import type { Session } from '../types/domain.ts'
import { newId } from '../utils/id.ts'
import { applySessionBilling, byMostRecent } from './billing.ts'
import { selectRows, updateDb } from './db.ts'

export type NewSession = Omit<Session, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'counted'>

const byDateTime = (a: Session, b: Session) =>
  `${a.date} ${a.time ?? '99:99'}`.localeCompare(`${b.date} ${b.time ?? '99:99'}`)

// mais recente primeiro (mesma ordem que a sugestão de valor usa)
export async function listSessions(tenantId: string, patientId: string): Promise<Session[]> {
  return selectRows('sessions', tenantId)
    .filter((s) => s.patientId === patientId)
    .sort(byMostRecent)
}

// todos os pacientes do tenant; from e to inclusivos (yyyy-mm-dd), do mais antigo para o mais novo
export async function listSessionsBetween(tenantId: string, from: string, to: string): Promise<Session[]> {
  return selectRows('sessions', tenantId)
    .filter((s) => s.date >= from && s.date <= to)
    .sort(byDateTime)
}

// Grava a sessão e os lançamentos que a regra do RF-08 alterou numa única escrita do banco.
function persist(tenantId: string, session: Session): Session {
  if (session.tenantId !== tenantId) throw new Error('Registro pertence a outro tenant.')
  let saved = session
  updateDb((db) => {
    const index = db.sessions.findIndex((s) => s.id === session.id && s.tenantId === tenantId)
    const mine = db.payments.filter((p) => p.tenantId === tenantId && p.patientId === session.patientId)
    const result = applySessionBilling(index >= 0 ? db.sessions[index] : undefined, session, mine)
    saved = result.session
    // mantém a posição dos lançamentos que já existiam; os novos vão para o fim e os removidos saem
    const updated = new Map(result.payments.map((p) => [p.id, p]))
    const existing = new Set(db.payments.map((p) => p.id))
    db.payments = [
      ...db.payments.flatMap((p) => (mine.includes(p) ? (updated.has(p.id) ? [updated.get(p.id)!] : []) : [p])),
      ...result.payments.filter((p) => !existing.has(p.id)),
    ]
    if (index >= 0) db.sessions[index] = saved
    else db.sessions.push(saved)
  })
  return saved
}

export async function createSession(tenantId: string, input: NewSession, id: string = newId()): Promise<Session> {
  const now = new Date().toISOString()
  return persist(tenantId, { ...input, id, tenantId, createdAt: now, updatedAt: now })
}

export async function saveSession(tenantId: string, session: Session): Promise<Session> {
  return persist(tenantId, { ...session, updatedAt: new Date().toISOString() })
}
