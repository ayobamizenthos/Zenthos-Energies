import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/stores/auth'
import { PageSpinner } from '@/components/ui/PageSpinner'

export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageSpinner />
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <Outlet />
}

export function RequireAdmin() {
  const { loading, isAdmin, session } = useAuth()
  if (loading) return <PageSpinner />
  if (!session) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
