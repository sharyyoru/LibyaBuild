import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, Heart, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import { getSchedules, getFeaturedSchedules } from '../services/eventxApi'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'
import { clsx } from 'clsx'

const Schedule = () => {
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
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
      
      // Combine and dedupe
      const combined = [...scheduleList]
      featuredList.forEach(f => {
        if (!combined.find(s => s.id === f.id)) {
          combined.push({ ...f, featured: true })
        }
      })
      
      setSessions(Array.isArray(combined) ? combined : [])
    } catch (err) {
      console.error('Failed to load schedules:', err)
      setSessions([])
    } finally {
      setIsLoading(false)
    }
  }

  const getSessionTitle = (s) => s.title || s.name || s.event_name || 'Session'
  const getSessionCategory = (s) => s.category || s.type || 'General'
  const getSessionDate = (s) => s.date || s.event_date || new Date().toISOString().split('T')[0]
  const getSessionTime = (s) => s.time || s.start_time || 'TBA'
  const getSessionDuration = (s) => s.duration || '60 min'
  const getSessionLocation = (s) => s.location || s.venue || s.hall || 'Main Hall'

  const categories = ['all', ...new Set(sessions.map(s => getSessionCategory(s)).filter(Boolean))]

  const filtered = filter === 'favorites'
    ? sessions.filter(s => isFavorite('sessions', s.id))
    : sessions.filter(s => filter === 'all' || getSessionCategory(s) === filter)

  const groupedByDate = filtered.reduce((acc, session) => {
    const date = getSessionDate(session)
    if (!acc[date]) acc[date] = []
    acc[date].push(session)
    return acc
  }, {})

  return (
    <>
      <Header title="My Schedule" showBack={false} />
      <div className="p-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <button
            onClick={() => setFilter('favorites')}
            className={clsx(
              'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2',
              filter === 'favorites'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 active:bg-gray-200'
            )}
          >
            <Heart className="w-4 h-4" />
            Favorites
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={clsx(
                'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors',
                filter === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              )}
            >
              {cat === 'all' ? 'All Sessions' : cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : Object.keys(groupedByDate).length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No sessions scheduled</p>
          </Card>
        ) : (
          Object.entries(groupedByDate).map(([date, dateSessions]) => (
            <div key={date}>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                {format(new Date(date), 'EEEE, MMMM d')}
              </h3>
              <div className="space-y-3">
                {dateSessions.map(session => {
                  const category = getSessionCategory(session)
                  return (
                    <Card key={session.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h4 className="font-bold text-gray-900 flex-1">{getSessionTitle(session)}</h4>
                        <button
                          onClick={() => toggleFavorite('sessions', session.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                        >
                          <Heart
                            className={clsx(
                              'w-5 h-5',
                              isFavorite('sessions', session.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-400'
                            )}
                          />
                        </button>
                      </div>
                      
                      <Badge
                        variant={category === 'Workshop' ? 'warning' : category === 'Keynote' ? 'primary' : 'default'}
                        size="sm"
                        className="mb-3"
                      >
                        {category}
                      </Badge>

                      {session.speaker && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {session.speaker.name || session.speaker_name || 'Speaker'}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {session.speaker.company || session.speaker_company || ''}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary-600" />
                          <span>{getSessionTime(session)} • {getSessionDuration(session)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary-600" />
                          <span>{getSessionLocation(session)}</span>
                        </div>
                        {(session.registered || session.capacity) && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary-600" />
                            <span>{session.registered || 0} / {session.capacity || '∞'} registered</span>
                          </div>
                        )}
                      </div>

                      {session.price && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-lg font-bold text-primary-600">{session.price} AED</span>
                          <Link to="/workshops">
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform">
                              Book Now
                            </button>
                          </Link>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default Schedule
