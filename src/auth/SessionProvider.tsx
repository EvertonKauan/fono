import { useState, type ReactNode } from 'react'
import * as auth from '../services/auth.ts'
import type { AuthSession } from '../types/domain.ts'
import { SessionContext, type SessionValue } from './useSession.ts'

export default function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(auth.currentSession)

  const value: SessionValue = {
    session,
    login: async (username, password) => {
      const next = await auth.login(username, password)
      setSession(next)
      return next !== null
    },
    logout: () => {
      auth.logout()
      setSession(null)
    },
  }

  return <SessionContext value={value}>{children}</SessionContext>
}
