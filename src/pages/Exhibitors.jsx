import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Heart, Mail, Phone, Globe } from 'lucide-react'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import { exhibitors } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { clsx } from 'clsx'

const Exhibitors = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [country, setCountry] = useState('all')
  const [sector, setSector] = useState('all')
  const { isFavorite, toggleFavorite } = useApp()

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500)
  }, [])

  const categories = ['all', ...new Set(exhibitors.map(e => e.category))]
  const countries = ['all', ...new Set(exhibitors.map(e => e.country))]
  const sectors = ['all', ...new Set(exhibitors.map(e => e.sector))]

  const filtered = exhibitors.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.description.toLowerCase().includes(search.toLowerCase()) ||
      ex.booth.toLowerCase().includes(search.toLowerCase()) ||
      ex.hall.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || ex.category === category
    const matchesCountry = country === 'all' || ex.country === country
    const matchesSector = sector === 'all' || ex.sector === sector
    return matchesSearch && matchesCategory && matchesCountry && matchesSector
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

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(exhibitor => (
            <Card key={exhibitor.id}>
              <Link to={`/exhibitors/${exhibitor.id}`} className="block p-4">
                <div className="flex gap-4">
                  <img
                    src={exhibitor.logo}
                    alt={exhibitor.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{exhibitor.name}</h3>
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
                    <div className="flex gap-1.5 mb-2">
                      <Badge variant="primary" size="sm">{exhibitor.sector}</Badge>
                      <Badge size="sm">{exhibitor.country}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{exhibitor.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {exhibitor.booth}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {exhibitor.country}
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
