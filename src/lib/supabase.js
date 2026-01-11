import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// Database helpers
export const fetchExhibitors = async () => {
  const { data, error } = await supabase
    .from('exhibitors')
    .select('*')
    .eq('status', 'active')
    .order('company_name')
  return { data, error }
}

export const fetchSpeakers = async () => {
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .order('name')
  return { data, error }
}

export const fetchSessions = async () => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('date', { ascending: true })
  return { data, error }
}

export const fetchNews = async () => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('date', { ascending: false })
    .limit(10)
  return { data, error }
}

export const fetchBanners = async (type = 'hero') => {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('banner_type', type)
    .eq('status', 'active')
    .order('priority')
  return { data, error }
}

export const fetchSystemConfig = async () => {
  const { data, error } = await supabase
    .from('system_config')
    .select('*')
  return { data, error }
}
