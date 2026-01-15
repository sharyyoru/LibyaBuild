import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Heart, Mail, Phone, Globe, Building2 } from 'lucide-react'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import { getExhibitors } from '../services/eventxApi'
import { useApp } from '../context/AppContext'
import { clsx } from 'clsx'

const DEFAULT_LOGO = '/media/default-company.svg'

const Exhibitors = () => {
  const [exhibitors, setExhibitors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [country, setCountry] = useState('all')
  const [sector, setSector] = useState('all')
  const { isFavorite, toggleFavorite } = useApp()

  useEffect(() => {
    loadExhibitors()
  }, [])

  const loadExhibitors = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getExhibitors()
      // Handle different API response structures
      const exhibitorList = data.data || data.exhibitors || data || []
      setExhibitors(Array.isArray(exhibitorList) ? exhibitorList : [])
    } catch (err) {
      console.error('Failed to load exhibitors:', err)
      setError('Failed to load exhibitors')
      setExhibitors([])
    } finally {
      setIsLoading(false)
    }
  }

  const getExhibitorLogo = (exhibitor) => {
    return exhibitor.logo_url || exhibitor.logo || exhibitor.image || exhibitor.company_logo || DEFAULT_LOGO
  }

  const getExhibitorName = (exhibitor) => {
    return exhibitor.company_name || exhibitor.name || exhibitor.company || 'Unknown Company'
  }

  const getExhibitorSector = (exhibitor) => {
    return exhibitor.sector || exhibitor.industry || exhibitor.category || 'General'
  }

  const getExhibitorCountry = (exhibitor) => {
    return exhibitor.country || exhibitor.location || 'Libya'
  }

  const getExhibitorBooth = (exhibitor) => {
    if (exhibitor.booth_number && exhibitor.hall) {
      return `${exhibitor.hall} - ${exhibitor.booth_number}`
    }
    return exhibitor.booth_number || exhibitor.booth || exhibitor.stand || 'TBA'
  }

  const getExhibitorDescription = (exhibitor) => {
    return exhibitor.description || exhibitor.about || exhibitor.company_description || ''
  }

  const countries = ['all', ...new Set(exhibitors.map(e => getExhibitorCountry(e)).filter(Boolean))]
  const sectors = ['all', ...new Set(exhibitors.map(e => getExhibitorSector(e)).filter(Boolean))]

  const filtered = exhibitors.filter(ex => {
    const name = getExhibitorName(ex).toLowerCase()
    const desc = getExhibitorDescription(ex).toLowerCase()
    const booth = getExhibitorBooth(ex).toLowerCase()
    const searchLower = search.toLowerCase()
    
    const matchesSearch = !search || 
      name.includes(searchLower) ||
      desc.includes(searchLower) ||
      booth.includes(searchLower)
    const matchesCountry = country === 'all' || getExhibitorCountry(ex) === country
    const matchesSector = sector === 'all' || getExhibitorSector(ex) === sector
    return matchesSearch && matchesCountry && matchesSector
  })

  return (
    <>
      <Header title="Exhibitors" showBack={false} />
      <div className="p-4 space-y-4">
        <SearchBar 
          value={search} 
          onChange={setSearch}
          placeholder="Search by name, booth, hall, or country..." 
        />

        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Country</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {countries.map(c => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                className={clsx(
                  'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors',
                  country === c
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                )}
              >
                {c === 'all' ? 'All Countries' : c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Sector</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {sectors.map(s => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={clsx(
                  'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors',
                  sector === s
                    ? 'bg-accent-600 text-white'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                )}
              >
                {s === 'all' ? 'All Sectors' : s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
            <button onClick={loadExhibitors} className="ml-2 underline">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No exhibitors found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(exhibitor => (
            <Card key={exhibitor.id}>
              <Link to={`/exhibitors/${exhibitor.id}`} className="block p-4">
                <div className="flex gap-4">
                  <img
                    src={getExhibitorLogo(exhibitor)}
                    alt={getExhibitorName(exhibitor)}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                    onError={(e) => { e.target.src = DEFAULT_LOGO }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{getExhibitorName(exhibitor)}</h3>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          toggleFavorite('exhibitors', exhibitor.id)
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      >
                        <Heart
                          className={clsx(
                            'w-5 h-5',
                            isFavorite('exhibitors', exhibitor.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400'
                          )}
                        />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="primary" size="sm">{getExhibitorSector(exhibitor)}</Badge>
                      <Badge size="sm">{getExhibitorCountry(exhibitor)}</Badge>
                    </div>
                    {getExhibitorDescription(exhibitor) && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{getExhibitorDescription(exhibitor)}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {getExhibitorBooth(exhibitor)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {getExhibitorCountry(exhibitor)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Exhibitors
