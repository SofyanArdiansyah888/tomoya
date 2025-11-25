import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSessionTimeout } from '../hooks/useSessionTimeout'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth()
  
  // Check session timeout for authenticated users
  useSessionTimeout()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
