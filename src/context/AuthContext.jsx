import { createContext, useContext, useState, useEffect } from 'react'
import { loginVisitor, getAuthToken, setAuthToken, clearAuthToken } from '../services/eventxApi'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = () => {
      try {
        const token = getAuthToken()
        const storedUser = localStorage.getItem('eventx_user')
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (err) {
        console.error('Auth init error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    setError(null)
    setLoading(true)
    try {
      const result = await loginVisitor(email, password)
      
      if (result.token || result.access_token) {
        const token = result.token || result.access_token
        setAuthToken(token)
        
        const userData = {
          email: email,
          token: token,
          ...result.user,
          ...result.visitor,
          is_staff: result.is_staff || result.user?.is_staff || result.visitor?.is_staff || false,
          user_level: result.user_level || result.user?.user_level || result.visitor?.user_level || 'visitor'
        }
        
        localStorage.setItem('eventx_user', JSON.stringify(userData))
        setUser(userData)
        
        return { success: true, user: userData }
      } else {
        const errorMsg = result.message || 'Login failed'
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      clearAuthToken()
      localStorage.removeItem('eventx_user')
      setUser(null)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isStaff: user?.is_staff || false,
    userLevel: user?.user_level || 'visitor'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
