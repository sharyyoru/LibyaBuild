import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, Heart, Loader2, Star, Filter, ChevronRight, Sparkles, Grid, List } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import { getSchedules, getFeaturedSchedules } from '../services/eventxApi'
import { useApp } from '../context/AppContext'
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { clsx } from 'clsx'

// Event dates for Libya Build 2026
const EVENT_DAYS = [
  { date: '2026-04-20', label: 'Day 1', shortLabel: 'Apr 20' },
  { date: '2026-04-21', label: 'Day 2', shortLabel: 'Apr 21' },
  { date: '2026-04-22', label: 'Day 3', shortLabel: 'Apr 22' },
  { date: '2026-04-23', label: 'Day 4', shortLabel: 'Apr 23' },
]

const FeaturedEventCard = ({ event, isFavorite, toggleFavorite, getters }) => {
  const { getTitle, getCategory, getTime, getDuration, getLocation, getDescription, getSpeaker, getImage } = getters
  
  return (
    <div className="min-w-[300px] max-w-[300px] snap-start">
      <Card className="h-full overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 text-white">
        {getImage(event) && (
          <div className="h-32 overflow-hidden">
            <img 
              src={getImage(event)} 
              alt="" 
              className="w-full h-full object-cover opacity-80"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="warning" size="sm" className="bg-white/20 text-white border-0">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
            <button
              onClick={() => toggleFavorite('sessions', event.id)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <Heart className={clsx('w-5 h-5', isFavorite('sessions', event.id) ? 'fill-red-400 text-red-400' : 'text-white/80')} />
            </button>
          </div>
          
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{getTitle(event)}</h3>
          
          {getDescription(event) && (
            <p className="text-white/80 text-sm mb-3 line-clamp-2">{getDescription(event)}</p>
          )}
          
          {getSpeaker(event) && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-white/10 rounded-lg">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <p className="font-semibold">{getSpeaker(event).name || getSpeaker(event)}</p>
                {getSpeaker(event).company && <p className="text-white/70 text-xs">{getSpeaker(event).company}</p>}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getTime(event)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {getLocation(event)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}

const RegularEventCard = ({ event, isFavorite, toggleFavorite, getters, compact = false }) => {
  const { getTitle, getCategory, getTime, getDuration, getLocation, getDescription, getSpeaker } = getters
  const category = getCategory(event)
  
  const categoryStyles = {
    'Keynote': { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'primary', icon: '🎤' },
    'Workshop': { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'warning', icon: '🛠️' },
    'Panel': { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'info', icon: '👥' },
    'Networking': { bg: 'bg-green-50', border: 'border-green-200', badge: 'success', icon: '🤝' },
    'Exhibition': { bg: 'bg-cyan-50', border: 'border-cyan-200', badge: 'accent', icon: '🏛️' },
    'default': { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'default', icon: '📅' },
  }
  
  const style = categoryStyles[category] || categoryStyles.default
  
  if (compact) {
    return (
      <Card className={`p-3 ${style.bg} ${style.border} border`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">{style.icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">{getTitle(event)}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{getTime(event)}</span>
              <span>•</span>
              <span>{getLocation(event)}</span>
            </div>
          </div>
          <button
            onClick={() => toggleFavorite('sessions', event.id)}
            className="p-1.5 hover:bg-white rounded-full transition-colors"
          >
            <Heart className={clsx('w-4 h-4', isFavorite('sessions', event.id) ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
          </button>
        </div>
      </Card>
    )
  }
  
  return (
    <Card className={`p-4 ${style.bg} ${style.border} border`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{style.icon}</div>
          <div>
            <h4 className="font-bold text-gray-900">{getTitle(event)}</h4>
            <Badge variant={style.badge} size="sm" className="mt-1">{category}</Badge>
          </div>
        </div>
        <button
          onClick={() => toggleFavorite('sessions', event.id)}
          className="p-1.5 hover:bg-white rounded-full transition-colors flex-shrink-0"
        >
          <Heart className={clsx('w-5 h-5', isFavorite('sessions', event.id) ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
        </button>
      </div>
      
      {getDescription(event) && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{getDescription(event)}</p>
      )}
      
      {getSpeaker(event) && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-white rounded-lg">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {typeof getSpeaker(event) === 'string' ? getSpeaker(event) : getSpeaker(event).name}
            </p>
            {getSpeaker(event).company && (
              <p className="text-xs text-gray-500">{getSpeaker(event).company}</p>
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-primary-600" />
          {getTime(event)} • {getDuration(event)}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary-600" />
          {getLocation(event)}
        </span>
      </div>
      
      {(event.capacity || event.registered) && (
        <div className="mt-3 pt-3 border-t border-white">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Users className="w-4 h-4" />
              {event.registered || 0} / {event.capacity || '∞'} spots
            </span>
            {event.price && (
              <span className="font-bold text-primary-600">{event.price} LYD</span>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

const Schedule = () => {
  const [sessions, setSessions] = useState([])
  const [featuredSessions, setFeaturedSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeDay, setActiveDay] = useState('all')
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'compact'
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const { isFavorite, toggleFavorite } = useApp()

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    setIsLoading(true)
    try {
      const [schedulesData, featuredData] = await Promise.all([
        getSchedules(),
        getFeaturedSchedules()
      ])
      
      const scheduleList = schedulesData.data || schedulesData.schedules || schedulesData || []
      const featuredList = featuredData.data || featuredData.schedules || featuredData || []
      
      // Mark featured sessions
      const featuredIds = new Set(featuredList.map(f => f.id))
      const allSessions = scheduleList.map(s => ({
        ...s,
        featured: featuredIds.has(s.id)
      }))
      
      // Add any featured items not in main list
      featuredList.forEach(f => {
        if (!allSessions.find(s => s.id === f.id)) {
          allSessions.push({ ...f, featured: true })
        }
      })
      
      setSessions(Array.isArray(allSessions) ? allSessions : [])
      setFeaturedSessions(featuredList)
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

  // Filter sessions
  const filteredSessions = sessions.filter(s => {
    if (showFeaturedOnly && !s.featured) return false
    if (activeDay !== 'all' && getters.getDate(s) !== activeDay) return false
    if (activeCategory !== 'all' && getters.getCategory(s) !== activeCategory) return false
    return true
  })

  // Group by date
  const groupedByDate = filteredSessions.reduce((acc, session) => {
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
    <>
      <Header title="Event Schedule" showBack={false} />
      <div className="pb-4">
        {/* Featured Events Carousel */}
        {featuredSessions.length > 0 && !showFeaturedOnly && (
          <div className="mb-6">
            <div className="px-4 mb-3 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Featured Events
              </h2>
              <button 
                onClick={() => setShowFeaturedOnly(true)}
                className="text-sm text-primary-600 font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
              {featuredSessions.slice(0, 5).map(event => (
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

        {/* Day Filter Tabs */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => { setActiveDay('all'); setShowFeaturedOnly(false) }}
              className={clsx(
                'px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all',
                activeDay === 'all' && !showFeaturedOnly
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              All Days
            </button>
            {EVENT_DAYS.map(day => (
              <button
                key={day.date}
                onClick={() => { setActiveDay(day.date); setShowFeaturedOnly(false) }}
                className={clsx(
                  'px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all',
                  activeDay === day.date
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {day.label}
              </button>
            ))}
            <button
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className={clsx(
                'px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all flex items-center gap-1.5',
                showFeaturedOnly
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <Star className="w-4 h-4" />
              Featured
            </button>
          </div>
        </div>

        {/* Category Filter & View Toggle */}
        <div className="px-4 mb-4 flex items-center justify-between gap-3">
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                    activeCategory === cat
                      ? 'bg-accent-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {cat === 'all' ? 'All Types' : cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-1.5 rounded-md transition-all',
                viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-gray-500'
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={clsx(
                'p-1.5 rounded-md transition-all',
                viewMode === 'compact' ? 'bg-white shadow text-primary-600' : 'text-gray-500'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="px-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : Object.keys(groupedByDate).length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-1">No events found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, dateSessions]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <h3 className="font-bold text-gray-900">{formatDateLabel(date)}</h3>
                    <span className="text-sm text-gray-500">({dateSessions.length} events)</span>
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
    </>
  )
}

export default Schedule
