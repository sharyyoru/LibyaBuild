import { useState, useEffect } from 'react'
import { Heart, Loader2, MapPin, ExternalLink, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getExhibitorFavorites, toggleFavorite } from '../services/eventxApi'

const Favorites = () => {
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    setIsLoading(true)
    try {
      const data = await getExhibitorFavorites()
      setFavorites(data.data || data.favorites || [])
    } catch (err) {
      setError('Failed to load favorites')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFavorite = async (exhibitorId, eventId) => {
    try {
      await toggleFavorite(exhibitorId, eventId)
      setFavorites(prev => prev.filter(f => f.exhibitor_id !== exhibitorId))
    } catch (err) {
      console.error('Failed to remove favorite:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <p className="text-white/80 mt-1">
          {favorites.length} saved exhibitor{favorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-4">Start exploring exhibitors and save your favorites!</p>
            <Link
              to="/exhibitors"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition-all"
            >
              <Building2 className="w-4 h-4" />
              Browse Exhibitors
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {favorites.map((favorite) => {
              const exhibitor = favorite.exhibitor || favorite
              return (
                <div key={favorite.id || exhibitor.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {exhibitor.logo_url ? (
                          <img 
                            src={exhibitor.logo_url} 
                            alt={exhibitor.company_name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {exhibitor.company_name || exhibitor.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {exhibitor.sector || exhibitor.category}
                        </p>
                        {exhibitor.booth_number && (
                          <div className="flex items-center gap-1 text-sm text-primary-600 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            Booth {exhibitor.booth_number}
                            {exhibitor.hall && ` • Hall ${exhibitor.hall}`}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite(exhibitor.id, favorite.event_id || 11)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Link
                        to={`/exhibitors/${exhibitor.id}`}
                        className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-lg text-sm font-medium text-center hover:bg-primary-700 transition-all"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/meetings?exhibitor=${exhibitor.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium text-center hover:bg-gray-200 transition-all"
                      >
                        Schedule Meeting
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites
