import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, Heart, Loader2, Star, ChevronRight, Sparkles, LayoutGrid, LayoutList, CalendarDays, Mic2, Wrench, UsersRound, Users2, Building, Tag } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import { getSchedules, getFeaturedSchedules } from '../services/eventxApi'
import { useApp } from '../context/AppContext'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'
import { clsx } from 'clsx'

// Event dates for Libya Build 2026
const EVENT_DAYS = [
  { date: '2026-04-20', label: 'Day 1', day: '20', month: 'Apr' },
  { date: '2026-04-21', label: 'Day 2', day: '21', month: 'Apr' },
  { date: '2026-04-22', label: 'Day 3', day: '22', month: 'Apr' },
  { date: '2026-04-23', label: 'Day 4', day: '23', month: 'Apr' },
]

// Category configurations with icons
const CATEGORY_CONFIG = {
  'Keynote': { icon: Mic2, color: 'from-purple-500 to-indigo-600', bg: 'bg-purple-500', light: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Workshop': { icon: Wrench, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-500', light: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Panel': { icon: UsersRound, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-500', light: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Networking': { icon: Users2, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'Exhibition': { icon: Building, color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-500', light: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  'default': { icon: Tag, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-500', light: 'bg-gray-50 text-gray-700 border-gray-200' },
}

const FeaturedEventCard = ({ event, isFavorite, toggleFavorite, getters }) => {
  const { getTitle, getCategory, getTime, getLocation, getDescription, getSpeaker, getImage } = getters
  const category = getCategory(event)
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default
  const CategoryIcon = config.icon
  
  return (
    <div className="min-w-[280px] max-w-[280px] snap-start">
      <div className={`h-full rounded-2xl overflow-hidden bg-gradient-to-br ${config.color} text-white shadow-lg shadow-primary-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
        {getImage(event) && (
          <div className="h-28 overflow-hidden relative">
            <img 
              src={getImage(event)} 
              alt="" 
              className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CategoryIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-white/90 uppercase tracking-wide">{category}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite('sessions', event.id) }}
              className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-90"
            >
              <Heart className={clsx('w-5 h-5 transition-all', isFavorite('sessions', event.id) ? 'fill-red-400 text-red-400 scale-110' : 'text-white/80')} />
            </button>
          </div>
          
          <h3 className="font-bold text-base mb-2 line-clamp-2 leading-tight">{getTitle(event)}</h3>
          
          {getDescription(event) && (
            <p className="text-white/70 text-xs mb-3 line-clamp-2">{getDescription(event)}</p>
          )}
          
          {getSpeaker(event) && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                {(getSpeaker(event).name || getSpeaker(event)).charAt(0)}
              </div>
              <span className="text-sm font-medium truncate">{getSpeaker(event).name || getSpeaker(event)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-xs text-white/80">
            <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              {getTime(event)}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5" />
              {getLocation(event)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const RegularEventCard = ({ event, isFavorite, toggleFavorite, getters, compact = false }) => {
  const { getTitle, getCategory, getTime, getDuration, getLocation, getDescription, getSpeaker } = getters
  const category = getCategory(event)
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default
  const CategoryIcon = config.icon
  
  if (compact) {
    return (
      <div className={`p-3 rounded-xl border ${config.light} transition-all hover:shadow-md active:scale-[0.98]`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
            <CategoryIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">{getTitle(event)}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{getTime(event)}</span>
              <span className="text-gray-300">•</span>
              <MapPin className="w-3 h-3" />
              <span className="truncate">{getLocation(event)}</span>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite('sessions', event.id) }}
            className="p-2 hover:bg-white/50 rounded-full transition-all active:scale-90"
          >
            <Heart className={clsx('w-4 h-4 transition-all', isFavorite('sessions', event.id) ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md active:scale-[0.99]">
      {/* Colored top bar */}
      <div className={`h-1 bg-gradient-to-r ${config.color}`} />
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 shadow-lg shadow-${config.bg}/30`}>
              <CategoryIcon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-gray-900 leading-tight">{getTitle(event)}</h4>
              <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.light}`}>
                {category}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite('sessions', event.id) }}
            className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90 flex-shrink-0"
          >
            <Heart className={clsx('w-5 h-5 transition-all', isFavorite('sessions', event.id) ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400')} />
          </button>
        </div>
        
        {getDescription(event) && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{getDescription(event)}</p>
        )}
        
        {getSpeaker(event) && (
          <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {(typeof getSpeaker(event) === 'string' ? getSpeaker(event) : getSpeaker(event).name).charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm">
                {typeof getSpeaker(event) === 'string' ? getSpeaker(event) : getSpeaker(event).name}
              </p>
              {getSpeaker(event).company && (
                <p className="text-xs text-gray-500 truncate">{getSpeaker(event).company}</p>
              )}
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
            <Clock className="w-3.5 h-3.5 text-primary-600" />
            {getTime(event)} • {getDuration(event)}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
            <MapPin className="w-3.5 h-3.5 text-primary-600" />
            {getLocation(event)}
          </span>
        </div>
        
        {(event.capacity || event.registered) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full w-24 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${config.color} rounded-full`}
                    style={{ width: `${Math.min(100, ((event.registered || 0) / (event.capacity || 100)) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{event.registered || 0}/{event.capacity || '∞'}</span>
              </div>
              {event.price && (
                <span className="font-bold text-primary-600">{event.price} LYD</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const Schedule = () => {
  const [sessions, setSessions] = useState([])
  const [featuredSessions, setFeaturedSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeDay, setActiveDay] = useState('all')
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'compact'
  // Removed eventFilter state since we're separating featured and scheduled events
  const { isFavorite, toggleFavorite } = useApp()

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    setIsLoading(true)
    try {
      // Use single API endpoint that returns all events with type property
      const response = await getFeaturedSchedules()
      const allEvents = response.data || response.schedules || response || []
      
      // Filter events by type property
      const featuredEvents = allEvents.filter(event => event.type === 'featured')
      const scheduleEvents = allEvents.filter(event => event.type === 'schedule')
      
      setSessions(Array.isArray(scheduleEvents) ? scheduleEvents : [])
      setFeaturedSessions(Array.isArray(featuredEvents) ? featuredEvents : [])
    } catch (err) {
      console.error('Failed to load schedules:', err)
      setSessions([])
      setFeaturedSessions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Getter functions for flexible data access
  const getters = {
    getTitle: (s) => s.title || s.name || s.event_name || 'Event',
    getCategory: (s) => s.category || s.type || s.event_type || 'General',
    getDate: (s) => s.date || s.event_date || s.start_date || EVENT_DAYS[0].date,
    getTime: (s) => {
      const time = s.time || s.start_time || s.event_time
      if (!time) return 'TBA'
      // Format time if needed
      if (time.includes(':')) {
        const [h, m] = time.split(':')
        const hour = parseInt(h)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
        return `${displayHour}:${m} ${ampm}`
      }
      return time
    },
    getDuration: (s) => s.duration || s.event_duration || '60 min',
    getLocation: (s) => s.location || s.venue || s.hall || s.room || 'Main Hall',
    getDescription: (s) => s.description || s.about || s.summary || '',
    getSpeaker: (s) => s.speaker || s.speakers?.[0] || s.presenter || s.host || null,
    getImage: (s) => s.image || s.banner || s.cover_image || s.thumbnail || null,
  }

  // Get unique categories
  const categories = ['all', ...new Set(sessions.map(s => getters.getCategory(s)).filter(Boolean))]

  // Filter sessions for scheduled events (already filtered by type='schedule' from API)
  const scheduledSessions = sessions.filter(s => {
    // Filter by day
    if (activeDay !== 'all' && getters.getDate(s) !== activeDay) return false
    
    // Filter by category
    if (activeCategory !== 'all' && getters.getCategory(s) !== activeCategory) return false
    
    return true
  })

  // Group scheduled sessions by date
  const groupedByDate = scheduledSessions.reduce((acc, session) => {
    const date = getters.getDate(session)
    if (!acc[date]) acc[date] = []
    acc[date].push(session)
    return acc
  }, {})

  // Sort sessions within each date by time
  Object.keys(groupedByDate).forEach(date => {
    groupedByDate[date].sort((a, b) => {
      const timeA = getters.getTime(a)
      const timeB = getters.getTime(b)
      return timeA.localeCompare(timeB)
    })
  })

  const formatDateLabel = (dateStr) => {
    try {
      const date = parseISO(dateStr)
      if (isToday(date)) return 'Today'
      if (isTomorrow(date)) return 'Tomorrow'
      return format(date, 'EEEE, MMMM d')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white">
        <div className="px-4 pt-12 pb-6 safe-top">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Event Schedule</h1>
              <p className="text-white/70 text-sm mt-1">Libya Build 2026 • April 20-23</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-2.5 rounded-xl transition-all',
                  viewMode === 'list' ? 'bg-white text-primary-600' : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <LayoutList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={clsx(
                  'p-2.5 rounded-xl transition-all',
                  viewMode === 'compact' ? 'bg-white text-primary-600' : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Day Selector - Calendar Style */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => setActiveDay('all')}
              className={clsx(
                'flex flex-col items-center justify-center min-w-[70px] py-3 px-4 rounded-2xl font-medium transition-all',
                activeDay === 'all'
                  ? 'bg-white text-primary-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              <CalendarDays className="w-5 h-5 mb-1" />
              <span className="text-xs">All Days</span>
            </button>
            {EVENT_DAYS.map(day => (
              <button
                key={day.date}
                onClick={() => setActiveDay(day.date)}
                className={clsx(
                  'flex flex-col items-center justify-center min-w-[60px] py-3 px-4 rounded-2xl transition-all',
                  activeDay === day.date
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                )}
              >
                <span className="text-xl font-bold">{day.day}</span>
                <span className="text-xs opacity-80">{day.month}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="-mt-4 relative z-10">
        <div className="bg-gray-50 rounded-t-3xl pt-4 pb-6">
          {/* Category Pills */}
          <div className="px-4 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {categories.map(cat => {
                const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.default
                const CategoryIcon = config.icon
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={clsx(
                      'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
                      activeCategory === cat
                        ? `${config.light} shadow-sm`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {cat !== 'all' && <CategoryIcon className="w-4 h-4" />}
                    {cat === 'all' ? 'All Types' : cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Featured Events Carousel */}
          {featuredSessions.length > 0 && (
            <div className="mb-6">
              <div className="px-4 mb-3">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Featured Events
                </h2>
                <p className="text-sm text-gray-500 mt-1">Don't miss these highlighted events</p>
              </div>
              <div className="flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
                {featuredSessions.map(event => (
                  <FeaturedEventCard 
                    key={event.id} 
                    event={event} 
                    isFavorite={isFavorite} 
                    toggleFavorite={toggleFavorite}
                    getters={getters}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Schedule Events Section */}
          <div className="px-4">
            <div className="mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Schedule Events
              </h2>
              <p className="text-sm text-gray-500 mt-1">Complete event schedule</p>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-4 animate-pulse">
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
                <p className="text-gray-500 font-medium">Loading events...</p>
              </div>
            ) : Object.keys(groupedByDate).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-800 font-semibold text-lg mb-1">No events found</p>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                  Try selecting a different day or category to find events
                </p>
                <button
                  onClick={() => { setActiveDay('all'); setActiveCategory('all') }}
                  className="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedByDate)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, dateSessions]) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{formatDateLabel(date)}</h3>
                        <p className="text-xs text-gray-500">{dateSessions.length} event{dateSessions.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {dateSessions.map(session => (
                        <RegularEventCard
                          key={session.id}
                          event={session}
                          isFavorite={isFavorite}
                          toggleFavorite={toggleFavorite}
                          getters={getters}
                          compact={viewMode === 'compact'}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Schedule
