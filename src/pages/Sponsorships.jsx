import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Users, ExternalLink, Heart, Loader2, Crown, Globe, Tag, Filter, LayoutGrid, LayoutList } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import { getExhibitors, getIndustries } from '../services/eventxApi'
import { useApp } from '../context/AppContext'
import { clsx } from 'clsx'

const Sponsorships = () => {
  const [sponsors, setSponsors] = useState([])
  const [filteredSponsors, setFilteredSponsors] = useState([])
  const [industries, setIndustries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTier, setSelectedTier] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedSector, setSelectedSector] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const { isFavorite, toggleFavorite } = useApp()

  useEffect(() => {
    loadSponsors()
  }, [])

  useEffect(() => {
    filterSponsors()
  }, [sponsors, searchQuery, selectedTier, selectedCountry, selectedSector])

  const loadSponsors = async () => {
    setIsLoading(true)
    try {
      const [exhibitorsResponse, industriesResponse] = await Promise.all([
        getExhibitors(),
        getIndustries()
      ])
      
      const allExhibitors = exhibitorsResponse.data || exhibitorsResponse.exhibitors || exhibitorsResponse || []
      

      // Filter only sponsors (have sponsorship variables in events_user)
      const sponsorsList = allExhibitors.filter(exhibitor => {
        const eventsUser = exhibitor.events_user || exhibitor.event_user || exhibitor
        return eventsUser.platinum_sponsorship === 1 || 
               eventsUser.gold_sponsorship === 1 || 
               eventsUser.silver_sponsorship === 1 || 
               eventsUser.is_platinum_sponsorship === 1 ||
               eventsUser.is_official_sponsorship === 1 ||
               eventsUser.platinum_sponsorship === true || 
               eventsUser.gold_sponsorship === true || 
               eventsUser.silver_sponsorship === true || 
               eventsUser.is_platinum_sponsorship === true ||
               eventsUser.is_official_sponsorship === true
      })
      
      // Expand sponsors to include each form3_data_entry as a separate card
      const expandedSponsors = []
      sponsorsList.forEach(sponsor => {
        if (sponsor?.form3_data_entry && Array.isArray(sponsor.form3_data_entry)) {
          // Create a card for each form3_data_entry (main sponsor + co-exhibitors)
          sponsor.form3_data_entry.forEach(form3Entry => {
            expandedSponsors.push({
              ...sponsor,
              _form3Entry: form3Entry, // Store the specific form3 entry for this card
              _isCoExhibitor: form3Entry.is_coexhibitor === 1
            })
          })
        } else {
          // No form3_data_entry, add sponsor as-is
          expandedSponsors.push(sponsor)
        }
      })
      
      // Handle different API response structures for industries
      const industryList = industriesResponse.data || industriesResponse.industries || industriesResponse || []
      setIndustries(Array.isArray(industryList) ? industryList : [])
      
      setSponsors(expandedSponsors)
    } catch (err) {
      console.error('Failed to load sponsors:', err)
      setSponsors([])
      setIndustries([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterSponsors = () => {
    let filtered = sponsors

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(sponsor => 
        getSponsorName(sponsor).toLowerCase().includes(query) ||
        getSponsorDescription(sponsor).toLowerCase().includes(query) ||
        (sponsor.country || '').toLowerCase().includes(query)
      )
    }

    // Tier filter
    if (selectedTier !== 'all') {
      filtered = filtered.filter(sponsor => getSponsorTier(sponsor) === selectedTier)
    }

    // Country filter
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(sponsor => 
        (sponsor.country || '').toLowerCase() === selectedCountry.toLowerCase()
      )
    }

    // Sector filter - check if sponsor matches selected sector
    if (selectedSector !== 'all') {
      filtered = filtered.filter(sponsor => {
        const sponsorSector = getSponsorSector(sponsor)
        
        // Check direct match first
        if (sponsorSector === selectedSector) {
          return true
        }
        
        // Also check if sponsor has multiple industries that include the selected sector
        const form3Entry = sponsor?._form3Entry
        if (form3Entry?.company_industries && Array.isArray(form3Entry.company_industries)) {
          return form3Entry.company_industries.some(industry => 
            (industry.name || industry.en_name || industry) === selectedSector
          )
        }
        
        return false
      })
    }

    setFilteredSponsors(filtered)
  }

  // Get sponsor tier
  const getSponsorTier = (sponsor) => {
    const eventsUser = sponsor.events_user || sponsor.event_user || sponsor
    if (eventsUser.platinum_sponsorship === 1 || eventsUser.platinum_sponsorship === true || eventsUser.is_platinum_sponsorship === 1 || eventsUser.is_platinum_sponsorship === true) return 'platinum'
    if (eventsUser.gold_sponsorship === 1 || eventsUser.gold_sponsorship === true) return 'gold'
    if (eventsUser.silver_sponsorship === 1 || eventsUser.silver_sponsorship === true) return 'silver'
    if (eventsUser.is_official_sponsorship === 1 || eventsUser.is_official_sponsorship === true) return 'official'
    return 'sponsor'
  }

  // Get tier configuration
  const getTierConfig = (tier) => {
    switch (tier) {
      case 'platinum':
        return { 
          label: 'Platinum Sponsor', 
          color: 'from-slate-700 to-slate-800', 
          bg: 'bg-slate-700', 
          text: 'text-slate-700',
          light: 'bg-slate-50 text-slate-700 border-slate-200'
        }
      case 'gold':
        return { 
          label: 'Gold Sponsor', 
          color: 'from-amber-500 to-amber-600', 
          bg: 'bg-amber-500', 
          text: 'text-amber-600',
          light: 'bg-amber-50 text-amber-700 border-amber-200'
        }
      case 'silver':
        return { 
          label: 'Silver Sponsor', 
          color: 'from-gray-400 to-gray-500', 
          bg: 'bg-gray-400', 
          text: 'text-gray-600',
          light: 'bg-gray-50 text-gray-700 border-gray-200'
        }
      case 'official':
        return { 
          label: 'Official Sponsor', 
          color: 'from-blue-500 to-blue-600', 
          bg: 'bg-blue-500', 
          text: 'text-blue-600',
          light: 'bg-blue-50 text-blue-700 border-blue-200'
        }
      default:
        return { 
          label: 'Sponsor', 
          color: 'from-primary-500 to-primary-600', 
          bg: 'bg-primary-500', 
          text: 'text-primary-600',
          light: 'bg-primary-50 text-primary-700 border-primary-200'
        }
    }
  }

  // Get unique tiers, countries, and sectors
  const tiers = ['all', ...new Set(sponsors.map(sponsor => getSponsorTier(sponsor)))]
  const countries = ['all', ...new Set(sponsors.map(s => s.country).filter(Boolean))]
  
  // Extract unique sectors from sponsor _form3Entry company_industries
  const extractedSectors = sponsors.flatMap(sponsor => {
    const form3Entry = sponsor?._form3Entry
    if (form3Entry?.company_industries && Array.isArray(form3Entry.company_industries)) {
      return form3Entry.company_industries.map(industry => industry.name || industry.en_name || industry).filter(Boolean)
    }
    return []
  })
  
  const sectors = ['all', ...new Set(extractedSectors)].filter(Boolean)

  // Helper functions
  const getSponsorName = (sponsor) => {
    const form3Entry = sponsor?._form3Entry
    if (form3Entry?.company) {
      return form3Entry.company
    }
    return sponsor.en_name || sponsor.company_name || sponsor.name || 'Sponsor'
  }
  const getSponsorLogo = (sponsor) => {
    // Priority 1: Check the specific _form3Entry for this card
    const form3Entry = sponsor?._form3Entry
    if (form3Entry?.company_logo && typeof form3Entry.company_logo === 'string' && form3Entry.company_logo.trim() && form3Entry.company_logo !== 'null') {
      const logoPath = form3Entry.company_logo.trim()
      // If already full URL, return as is
      if (logoPath.startsWith('http')) {
        return logoPath
      }
      // Build full URL for relative paths
      return `https://eventxtest.fxunlock.com/storage/${logoPath}`
    }
    
    // Priority 2: Check other logo fields from main sponsor
    const alternativeLogos = [
      sponsor?.logo_url,
      sponsor?.logo,
      sponsor?.image,
      sponsor?.company_logo
    ]
    
    for (const logo of alternativeLogos) {
      if (logo && typeof logo === 'string' && logo.trim() && logo !== 'null') {
        const logoPath = logo.trim()
        if (logoPath.startsWith('http')) {
          return logoPath
        }
        return `https://eventxtest.fxunlock.com/storage/${logoPath}`
      }
    }
    
    return '/media/default-company.svg'
  }
  const getSponsorSector = (sponsor) => {
    const form3Entry = sponsor?._form3Entry
    if (form3Entry?.company_industries && Array.isArray(form3Entry.company_industries) && form3Entry.company_industries.length > 0) {
      const firstIndustry = form3Entry.company_industries[0]
      
      // The company_industries array contains objects with id, name, ar_name properties
      if (typeof firstIndustry === 'object' && firstIndustry && firstIndustry.name) {
        return firstIndustry.name || firstIndustry.en_name || 'General'
      }
      
      // Fallback for string values
      if (typeof firstIndustry === 'string' && isNaN(firstIndustry) && firstIndustry.trim() !== '') {
        return firstIndustry
      }
    }
    
    // Fallback to direct sponsor properties - but never return numbers
    const fallback = sponsor.sector || sponsor.industry || sponsor.category || 'General'
    
    // Ensure we never return a numeric value (like the sector: 1 field)
    if (typeof fallback === 'number' || (typeof fallback === 'string' && !isNaN(fallback))) {
      return 'General'
    }
    
    return fallback || 'General'
  }
  const getSponsorDescription = (sponsor) => {
    const form3Entry = sponsor?._form3Entry
    if (form3Entry?.company_profile) {
      return form3Entry.company_profile
    }
    
    return sponsor.description || sponsor.about || sponsor.company_description || ''
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center animate-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading sponsors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white">
        <div className="px-4 pt-12 pb-6 safe-top">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Crown className="w-6 h-6" />
                Event Sponsors
              </h1>
              <p className="text-white/70 text-sm mt-1">{sponsors.length} official sponsors</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-2.5 rounded-xl transition-all',
                  viewMode === 'grid' ? 'bg-white text-amber-600' : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-2.5 rounded-xl transition-all',
                  viewMode === 'list' ? 'bg-white text-amber-600' : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sponsors..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {tiers.map(tier => (
                <option key={tier} value={tier} className="bg-amber-600 text-white">
                  {tier === 'all' ? 'All Tiers' : getTierConfig(tier).label}
                </option>
              ))}
            </select>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {countries.map(country => (
                <option key={country} value={country} className="bg-amber-600 text-white">
                  {country === 'all' ? 'All Countries' : country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sector Carousel - Same as Exhibitors page */}
      <div className="px-4 pb-4 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600">
        <div>
          <h3 className="text-xs font-semibold text-white/90 mb-2">Sector</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {sectors.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSector(s)}
                className={clsx(
                  'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors',
                  selectedSector === s
                    ? 'bg-white text-amber-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                {s === 'all' ? 'All Sectors' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="-mt-4 relative z-10">
        <div className="bg-gray-50 rounded-t-3xl pt-6 pb-6 min-h-[60vh]">
          <div className="px-4">
            {filteredSponsors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                  <Crown className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-800 font-semibold text-lg mb-1">
                  {sponsors.length === 0 ? 'No sponsors found' : 'No matches found'}
                </p>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                  {sponsors.length === 0 
                    ? 'Sponsors will be displayed here once available' 
                    : 'Try adjusting your search or filters'
                  }
                </p>
                {filteredSponsors.length !== sponsors.length && (
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedTier('all'); setSelectedCountry('all') }}
                    className="mt-4 px-6 py-2.5 bg-amber-600 text-white rounded-xl font-medium text-sm hover:bg-amber-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className={clsx(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' 
                  : 'space-y-3'
              )}>
                {filteredSponsors.map(sponsor => {
                  const tier = getSponsorTier(sponsor)
                  const tierConfig = getTierConfig(tier)
                  
                  return (
                    <Link key={sponsor.id} to={`/exhibitors/${sponsor.id}`}>
                      <div className={clsx(
                        'bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]',
                        viewMode === 'list' ? 'p-4' : 'p-5'
                      )}>
                        {/* Sponsor Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={clsx(
                            'flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full text-white',
                            tierConfig.bg
                          )}>
                            <Crown className="w-3.5 h-3.5" />
                            {tierConfig.label.toUpperCase()}
                          </span>
                        </div>

                        <div className={clsx(
                          'flex gap-4',
                          viewMode === 'list' ? 'items-center' : 'items-start'
                        )}>
                          <div className="flex-shrink-0">
                            <img
                              src={getSponsorLogo(sponsor)}
                              alt={getSponsorName(sponsor)}
                              className={clsx(
                                'object-cover bg-gray-100 border border-gray-200 rounded-xl',
                                viewMode === 'list' ? 'w-16 h-16' : 'w-20 h-20'
                              )}
                              onError={(e) => { e.target.src = '/media/default-company.svg' }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                              {getSponsorName(sponsor)}
                            </h3>
                            <p className={clsx('text-sm font-medium mb-2', tierConfig.text)}>
                              {getSponsorSector(sponsor)}
                            </p>
                            {getSponsorDescription(sponsor) && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {getSponsorDescription(sponsor)}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              {sponsor.booth_number && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  Booth {sponsor.booth_number}
                                </span>
                              )}
                              {sponsor.country && (
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3.5 h-3.5" />
                                  {sponsor.country}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); toggleFavorite('exhibitors', sponsor.id) }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-all"
                          >
                            <Heart className={clsx('w-5 h-5 transition-all', isFavorite('exhibitors', sponsor.id) ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sponsorships
