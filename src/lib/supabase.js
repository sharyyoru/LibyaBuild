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

// Attendance tracking functions
export const fetchCurrentScanDay = async () => {
  const { data, error } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'current_scan_day')
    .single()
  return { data: data?.value || 'day1', error }
}

export const setCurrentScanDay = async (day) => {
  const { data, error } = await supabase
    .from('system_config')
    .upsert({ key: 'current_scan_day', value: day }, { onConflict: 'key' })
  return { data, error }
}

export const fetchUserAttendance = async (qrCode) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('qr_code', qrCode)
    .single()
  return { data, error }
}

export const recordUserAttendance = async (qrCode, day, scanType, scannedBy) => {
  // First check if user has attendance record
  const { data: existing } = await supabase
    .from('attendance')
    .select('*')
    .eq('qr_code', qrCode)
    .single()

  if (existing) {
    // Update existing record - increment scan count for the day
    const dayScans = existing[`${day}_scans`] || 0
    const updateData = {
      [day]: true,
      [`${day}_scans`]: dayScans + 1,
      [`${day}_last_scan`]: new Date().toISOString(),
      [`${day}_scan_type`]: scanType,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('attendance')
      .update(updateData)
      .eq('qr_code', qrCode)
      .select()
    return { data, error, isNew: false }
  } else {
    // Create new attendance record
    const newRecord = {
      qr_code: qrCode,
      [day]: true,
      [`${day}_scans`]: 1,
      [`${day}_last_scan`]: new Date().toISOString(),
      [`${day}_scan_type`]: scanType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('attendance')
      .insert(newRecord)
      .select()
    return { data, error, isNew: true }
  }
}

export const fetchAllAttendanceStats = async () => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
  return { data, error }
}

// Meeting functions removed - now using API endpoints only
// All meeting functionality moved to /services/eventxApi.js

// Matchmaking functions
export const saveUserPreferences = async (userId, preferences) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
  return { data: data?.[0], error }
}

export const getUserPreferences = async (userId) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const saveMatch = async (matchData) => {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      ...matchData,
      created_at: new Date().toISOString()
    })
    .select()
  return { data: data?.[0], error }
}

export const getUserMatches = async (userId) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', userId)
    .order('match_score', { ascending: false })
  return { data: data || [], error }
}

export const updateMatchStatus = async (matchId, status) => {
  const { data, error } = await supabase
    .from('matches')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', matchId)
    .select()
  return { data: data?.[0], error }
}
