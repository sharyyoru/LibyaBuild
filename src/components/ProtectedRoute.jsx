import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import Loader from './Loader'

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const { isLanguageSelected } = useLanguage()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-accent-500 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to onboarding if language not selected, otherwise to login
    const redirectPath = isLanguageSelected ? '/login' : '/onboarding'
    return <Navigate to={redirectPath} state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
