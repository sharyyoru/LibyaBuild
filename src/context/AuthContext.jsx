import { createContext, useContext, useState, useEffect } from 'react'
import { loginVisitor, getAuthToken, setAuthToken, clearAuthToken, deleteUserAccount, getProfile } from '../services/eventxApi'

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
        
        // Create basic user data first to set state immediately
        const basicUserData = {
          email: email,
          token: token,
          // Use data from login response first
          ...result.user,
          ...result.visitor,
          id: result.user?.id || result.visitor?.id || result.id,
          is_staff: result.is_staff || result.user?.is_staff || result.visitor?.is_staff || false,
          user_level: result.user_level || result.user?.user_level || result.visitor?.user_level || 'visitor',
          is_exhibitor: result.is_exhibitor || false
        }
        
        // Set user state immediately for quick redirect
        setUser(basicUserData)
        localStorage.setItem('eventx_user', JSON.stringify(basicUserData))
        
        // Fetch profile in background to enhance user data
        try {
          const profileResponse = await getProfile()
          const profileData = profileResponse.data || profileResponse
          
          if (profileData) {
            const enhancedUserData = {
              ...basicUserData,
              // Profile data contains the user_id and all user details
              first_name: profileData.first_name || basicUserData.first_name,
              last_name: profileData.last_name || basicUserData.last_name,
              company: profileData.company_text || profileData.company?.en_name || basicUserData.company,
              job_title: profileData.job_title || basicUserData.job_title,
              phone: profileData.phone || basicUserData.phone,
              mobile: profileData.mobile || basicUserData.mobile,
              country: profileData.country || basicUserData.country,
              city: profileData.city || basicUserData.city,
              ref_code: profileData.ref_code || basicUserData.ref_code,
              vip: profileData.vip || basicUserData.vip,
              company_sectors: profileData.company_sectors || basicUserData.company_sectors,
              // Ensure id is set from profile (most reliable source)
              id: profileData.id || basicUserData.id,
              is_exhibitor: profileData.company?.is_exhibitor || basicUserData.is_exhibitor
            }
            
            setUser(enhancedUserData)
            localStorage.setItem('eventx_user', JSON.stringify(enhancedUserData))
          }
        } catch (profileErr) {
          console.warn('Could not fetch profile, using basic user data:', profileErr)
          // User is already set with basic data, so this is not a failure
        }
        
        setLoading(false)
        return { success: true, user: basicUserData }
      } else {
        const errorMsg = result.message || 'Login failed'
        setError(errorMsg)
        setLoading(false)
        return { success: false, error: errorMsg }
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed'
      setError(errorMsg)
      setLoading(false)
      return { success: false, error: errorMsg }
    }
  }

  const logout = async () => {
    try {
      clearAuthToken()
      localStorage.removeItem('eventx_user')
      setUser(null)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const deleteAccount = async () => {
    try {
      // Get user ID from current user data
      const userId = user?.id || user?.user_id || user?.visitor_id
      
      if (!userId) {
        return { success: false, error: 'User ID not found' }
      }

      // Call API to delete account
      await deleteUserAccount(userId)
      
      // Clear local session
      clearAuthToken()
      localStorage.removeItem('eventx_user')
      setUser(null)
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    deleteAccount,
    isAuthenticated: !!user && !!getAuthToken(),
    isStaff: user?.is_staff || false,
    userLevel: user?.user_level || 'visitor'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
