import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, getCurrentUser, getUserProfile } from '../utils/supabase'

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
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        await loadUserProfile(currentUser.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (authUserId) => {
    try {
      const { data, error } = await getUserProfile(authUserId)
      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (!error && data.user) {
      setUser(data.user)
      await loadUserProfile(data.user.id)
    }
    
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  const hasPermission = (permission) => {
    if (!profile || !profile.user_roles) return false
    
    const permissions = profile.user_roles.permissions || []
    if (permissions.includes('all')) return true
    if (permissions.includes(permission)) return true
    
    return false
  }

  const hasRole = (roleName) => {
    if (!profile || !profile.user_roles) return false
    return profile.user_roles.name === roleName
  }

  const canAccessLocale = (locale) => {
    if (!profile) return false
    if (hasPermission('all')) return true
    return profile.locale === locale || profile.locale === 'all'
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    hasPermission,
    hasRole,
    canAccessLocale,
    isAuthenticated: !!user,
    roleName: profile?.user_roles?.name,
    roleDisplayName: profile?.user_roles?.display_name,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
