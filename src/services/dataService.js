import { supabase } from '../lib/supabase'
import { 
  exhibitors as mockExhibitors, 
  speakers as mockSpeakers, 
  sessions as mockSessions, 
  newsItems as mockNews,
  heroBanners as mockHeroBanners,
  promotionalBanners as mockPromotionalBanners,
  pointsOfInterest as mockPOI,
  transportSchedule as mockTransport,
  ticketUpgrades as mockTicketUpgrades,
  sectors as mockSectors,
  countries as mockCountries
} from '../data/mockData'

// Exhibitors
export const getExhibitors = async () => {
  try {
    const { data, error } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('status', 'active')
      .order('company_name')
    
    if (error) throw error
    if (data && data.length > 0) {
      return data.map(e => ({
        id: e.id,
        name: e.company_name,
        category: e.sector,
        sector: e.sector,
        country: e.country,
        booth: e.booth_number,
        hall: e.hall,
        description: e.description,
        contact: {
          email: e.contact_email,
          phone: e.contact_phone,
          website: e.website
        },
        logo: e.logo_url || `https://via.placeholder.com/150/2264dc/ffffff?text=${e.company_name?.charAt(0) || 'E'}`,
        tags: e.tags || [],
        coordinates: { x: 0, y: 0 },
        promotionTier: 'standard'
      }))
    }
    return mockExhibitors
  } catch (error) {
    console.error('Error fetching exhibitors:', error)
    return mockExhibitors
  }
}

// Speakers
export const getSpeakers = async () => {
  try {
    const { data, error } = await supabase
      .from('speakers')
      .select('*')
      .order('name')
    
    if (error) throw error
    if (data && data.length > 0) return data
    return mockSpeakers
  } catch (error) {
    console.error('Error fetching speakers:', error)
    return mockSpeakers
  }
}

// Sessions
export const getSessions = async () => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date')
    
    if (error) throw error
    if (data && data.length > 0) return data
    return mockSessions
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return mockSessions
  }
}

// News
export const getNews = async () => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })
      .limit(20)
    
    if (error) throw error
    if (data && data.length > 0) return data
    return mockNews
  } catch (error) {
    console.error('Error fetching news:', error)
    return mockNews
  }
}

// Banners
export const getHeroBanners = async () => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('banner_type', 'hero')
      .eq('status', 'active')
      .order('priority')
    
    if (error) throw error
    if (data && data.length > 0) {
      return data.map(b => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        image: b.image_url,
        link: b.link_url || '/',
        priority: b.priority
      }))
    }
    return mockHeroBanners
  } catch (error) {
    console.error('Error fetching hero banners:', error)
    return mockHeroBanners
  }
}

export const getPromotionalBanners = async () => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('banner_type', 'promotional')
      .eq('status', 'active')
      .order('priority')
    
    if (error) throw error
    if (data && data.length > 0) return data
    return mockPromotionalBanners
  } catch (error) {
    console.error('Error fetching promotional banners:', error)
    return mockPromotionalBanners
  }
}

// System Config
export const getSystemConfig = async () => {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
    
    if (error) throw error
    if (data && data.length > 0) {
      const config = {}
      data.forEach(item => {
        config[item.key] = item.value
      })
      return config
    }
    return {
      event_name: 'Libya Build 2026',
      event_start_date: '2026-04-20',
      event_end_date: '2026-04-23',
      venue_name: 'Tripoli International Fair Ground'
    }
  } catch (error) {
    console.error('Error fetching system config:', error)
    return {
      event_name: 'Libya Build 2026',
      event_start_date: '2026-04-20',
      event_end_date: '2026-04-23'
    }
  }
}

// Static data (always use mock)
export const getPointsOfInterest = () => mockPOI
export const getTransportSchedule = () => mockTransport
export const getTicketUpgrades = () => mockTicketUpgrades
export const getSectors = () => mockSectors
export const getCountries = () => mockCountries
