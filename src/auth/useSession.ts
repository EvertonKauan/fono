import { createContext, useContext } from 'react'
import type { Session } from '../types/domain.ts'

export type SessionValue = {
  session: Session | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const SessionContext = createContext<SessionValue | null>(null)

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession deve ser usado dentro de SessionProvider.')
  return value
}

// para telas protegidas por RequireAuth, onde a sessão sempre existe
export function useTenantId() {
  const { session } = useSession()
  if (!session) throw new Error('Sessão ausente em tela protegida.')
  return session.tenantId
}
