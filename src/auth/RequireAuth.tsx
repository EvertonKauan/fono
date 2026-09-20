import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from './useSession.ts'

export default function RequireAuth() {
  const { session } = useSession()
  return session ? <Outlet /> : <Navigate to="/login" replace />
}
