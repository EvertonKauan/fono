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
