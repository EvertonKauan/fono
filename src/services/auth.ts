import type { Session } from '../types/domain.ts'
import { loadDb } from './db.ts'
import { getTenant } from './tenants.ts'

// sessionStorage: a sessão sobrevive ao recarregar, mas termina ao fechar a aba
const SESSION_KEY = 'fono:session'

export function currentSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export async function login(username: string, password: string): Promise<Session | null> {
  const user = loadDb().users.find((u) => u.username === username && u.password === password)
  if (!user) return null
  const session: Session = {
    userId: user.id,
    tenantId: user.tenantId,
    username: user.username,
    tenant: await getTenant(user.tenantId),
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}
