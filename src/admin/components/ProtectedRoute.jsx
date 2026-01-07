import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../../components/Loader'

const ProtectedRoute = ({ children, requiredRoles = [], requiredPermissions = [], locale = null }) => {
  const { user, profile, loading, hasRole, hasPermission, canAccessLocale } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role))
    if (!hasRequiredRole) {
      return <Navigate to="/admin/unauthorized" replace />
    }
  }

  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(perm => hasPermission(perm))
    if (!hasRequiredPermission) {
      return <Navigate to="/admin/unauthorized" replace />
    }
  }

  if (locale && !canAccessLocale(locale)) {
    return <Navigate to="/admin/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
