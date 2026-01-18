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

// Meeting functions
export const fetchMeetings = async (userId) => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .or(`visitor_id.eq.${userId},exhibitor_id.eq.${userId}`)
    .order('date', { ascending: true })
  return { data: data || [], error }
}

export const fetchAllMeetings = async () => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('date', { ascending: true })
  return { data: data || [], error }
}

export const createMeeting = async (meetingData) => {
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      ...meetingData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
  return { data: data?.[0], error }
}

export const updateMeetingStatus = async (meetingId, status) => {
  const { data, error } = await supabase
    .from('meetings')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', meetingId)
    .select()
  return { data: data?.[0], error }
}

export const deleteMeeting = async (meetingId) => {
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', meetingId)
  return { error }
}
