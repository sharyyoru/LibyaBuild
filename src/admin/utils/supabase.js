import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getUserProfile = async (authUserId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, user_roles(*)')
    .eq('auth_user_id', authUserId)
    .single()
  
  return { data, error }
}

export const checkPermission = (userRole, requiredPermission) => {
  if (!userRole || !userRole.permissions) return false
  
  const permissions = userRole.permissions
  if (permissions.includes('all')) return true
  if (permissions.includes(requiredPermission)) return true
  
  return false
}
