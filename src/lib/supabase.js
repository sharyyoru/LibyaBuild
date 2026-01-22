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

// Profile photo functions
export const uploadProfilePhoto = async (userId, file) => {
  // Convert userId to string to support numeric IDs from external auth
  const userIdStr = String(userId)
  const fileExt = file.name.split('.').pop()
  const fileName = `${userIdStr}-${Date.now()}.${fileExt}`
  const filePath = `${userIdStr}/${fileName}`

  // Upload file to storage
  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    console.error('Storage upload error:', error)
    return { data: null, error }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath)

  return { data: { path: filePath, url: publicUrl }, error: null }
}

export const deleteProfilePhoto = async (filePath) => {
  const { error } = await supabase.storage
    .from('profile-photos')
    .remove([filePath])
  return { error }
}

export const getProfilePhotoUrl = (filePath) => {
  if (!filePath) return null
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath)
  return publicUrl
}

// User profile functions (for extended profile data)
// Note: userId is converted to string for external auth compatibility
export const saveUserProfile = async (userId, profileData) => {
  const userIdStr = String(userId)
  
  // Filter out undefined values and convert empty strings to null
  const cleanedData = {}
  for (const [key, value] of Object.entries(profileData)) {
    if (value !== undefined) {
      cleanedData[key] = value === '' ? null : value
    }
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userIdStr,
      ...cleanedData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
  return { data: data?.[0], error }
}

export const getUserProfile = async (userId) => {
  const userIdStr = String(userId)
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userIdStr)
    .single()
  return { data, error }
}

// Get public profile info for business cards (respects privacy settings)
export const getPublicUserProfile = async (userId) => {
  const userIdStr = String(userId)
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, profile_photo_url, email, email_public, mobile, mobile_public')
    .eq('user_id', userIdStr)
    .single()
  
  if (error || !data) return { data: null, error }
  
  // Filter based on privacy settings
  return {
    data: {
      user_id: data.user_id,
      profile_photo_url: data.profile_photo_url,
      email: data.email_public ? data.email : null,
      mobile: data.mobile_public ? data.mobile : null,
      email_public: data.email_public,
      mobile_public: data.mobile_public
    },
    error: null
  }
}

// Save scanned business card to database
export const saveScannedCard = async (userId, cardData) => {
  const userIdStr = String(userId)
  const { data, error } = await supabase
    .from('scanned_cards')
    .insert({
      user_id: userIdStr,
      scanned_user_id: cardData.scannedUserId ? String(cardData.scannedUserId) : null,
      name: cardData.name,
      company: cardData.company,
      role: cardData.role,
      email: cardData.email,
      phone: cardData.phone,
      source: cardData.source, // 'qr' or 'ocr'
      raw_data: cardData.rawData,
      created_at: new Date().toISOString()
    })
    .select()
  return { data: data?.[0], error }
}

// Get user's scanned cards
export const getScannedCards = async (userId) => {
  const userIdStr = String(userId)
  const { data, error } = await supabase
    .from('scanned_cards')
    .select('*')
    .eq('user_id', userIdStr)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

// Delete a scanned card
export const deleteScannedCard = async (cardId) => {
  const { error } = await supabase
    .from('scanned_cards')
    .delete()
    .eq('id', cardId)
  return { error }
}

// User interests functions
export const saveUserInterests = async (userId, industryIds) => {
  const userIdStr = String(userId)
  
  // First, delete existing interests
  await supabase
    .from('user_interests')
    .delete()
    .eq('user_id', userIdStr)
  
  // Then insert new interests
  if (industryIds && industryIds.length > 0) {
    const interests = industryIds.map(industryId => ({
      user_id: userIdStr,
      industry_id: industryId,
      created_at: new Date().toISOString()
    }))
    
    const { data, error } = await supabase
      .from('user_interests')
      .insert(interests)
      .select()
    return { data, error }
  }
  
  return { data: [], error: null }
}

export const getUserInterests = async (userId) => {
  const userIdStr = String(userId)
  const { data, error } = await supabase
    .from('user_interests')
    .select('industry_id')
    .eq('user_id', userIdStr)
  return { data: data || [], error }
}

// Get chat contacts from scanned business cards
export const getChatContacts = async (userId) => {
  const userIdStr = String(userId)
  const { data, error } = await supabase
    .from('scanned_cards')
    .select('scanned_user_id, name, company, role, created_at')
    .eq('user_id', userIdStr)
    .not('scanned_user_id', 'is', null)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

// Get last message with a contact
export const getLastMessageWith = async (userId, contactId) => {
  const userIdStr = String(userId)
  const contactIdStr = String(contactId)
  
  const { data, error } = await supabase
    .from('chat_messages')
    .select('message, created_at, sender_id')
    .or(`and(sender_id.eq.${userIdStr},receiver_id.eq.${contactIdStr}),and(sender_id.eq.${contactIdStr},receiver_id.eq.${userIdStr})`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  return { data, error }
}
