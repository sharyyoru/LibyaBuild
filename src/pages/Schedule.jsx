import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, Heart } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { sessions, speakers } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'
import { clsx } from 'clsx'

const Schedule = () => {
  const [filter, setFilter] = useState('all')
  const { isFavorite, toggleFavorite } = useApp()

  const categories = ['all', ...new Set(sessions.map(s => s.category))]

  const filtered = filter === 'favorites'
    ? sessions.filter(s => isFavorite('sessions', s.id))
    : sessions.filter(s => filter === 'all' || s.category === filter)

  const groupedByDate = filtered.reduce((acc, session) => {
    const date = session.date
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

        {Object.entries(groupedByDate).map(([date, dateSessions]) => (
          <div key={date}>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              {format(new Date(date), 'EEEE, MMMM d')}
            </h3>
            <div className="space-y-3">
              {dateSessions.map(session => {
                const speaker = speakers.find(s => s.id === session.speaker)
                return (
                  <Card key={session.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h4 className="font-bold text-gray-900 flex-1">{session.title}</h4>
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
                      variant={session.category === 'Workshop' ? 'warning' : session.category === 'Keynote' ? 'primary' : 'default'}
                      size="sm"
                      className="mb-3"
                    >
                      {session.category}
                    </Badge>

                    {speaker && (
                      <Link to={`/speakers/${speaker.id}`} className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
                        <img src={speaker.photo} alt={speaker.name} className="w-8 h-8 rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{speaker.name}</p>
                          <p className="text-xs text-gray-600 truncate">{speaker.company}</p>
                        </div>
                      </Link>
                    )}

                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-600" />
                        <span>{session.time} • {session.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary-600" />
                        <span>{session.registered} / {session.capacity} registered</span>
                      </div>
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
        ))}
      </div>
    </>
  )
}

export default Schedule
