import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Crown, LayoutGrid, LayoutList } from 'lucide-react'
import SponsorCard from '../components/SponsorCard'
import { getExhibitorSponsorships, getIndustries } from '../services/eventxApi'
import { getCachedData, clearCache } from '../services/apiCache'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import { getLocalizedName, getLocalizedProfile, getLocalizedIndustry } from '../utils/localization'
import { clsx } from 'clsx'

const CACHE_TTL = 5 * 60 * 1000

const Sponsorships = () => {
  const [sponsors, setSponsors] = useState([])
  const [industries, setIndustries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTier, setSelectedTier] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedSector, setSelectedSector] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const { isFavorite, toggleFavorite } = useApp()
  const { language } = useLanguage()
  const { t } = useTranslation(language)

  useEffect(() => {
    loadSponsors()
  }, [])

  const loadSponsors = async (forceRefresh = false) => {
    setIsLoading(true)
    try {
      // Clear cache to get fresh data
      clearCache('sponsorships')
      clearCache('industries')

      console.log('=== Sponsorships API Call Debug ===')
      console.log('Calling getExhibitorSponsorships()...')
      
      const sponsorshipsResponse = await getExhibitorSponsorships()
      const industriesResponse = await getIndustries()
      
      console.log('Raw API Response:', sponsorshipsResponse)
      console.log('Response keys:', Object.keys(sponsorshipsResponse || {}))
      
      const sponsorsList = sponsorshipsResponse.data || sponsorshipsResponse.exhibitors || sponsorshipsResponse || []
      
      console.log('=== Sponsorships Data Debug ===')
      console.log('Total sponsors from API:', sponsorsList.length)
      console.log('Is Array?', Array.isArray(sponsorsList))
      
      // Filter to only include sponsors where is_sponsorship === 1
      const actualSponsors = sponsorsList.filter(sponsor => {
        const eventUser = sponsor.event_user || sponsor
        const isSponsorship = eventUser?.is_sponsorship
        const sponsorshipType = eventUser?.sponsorship_type
        
        // Log first 5 items for debugging
        if (sponsorsList.indexOf(sponsor) < 5) {
          console.log(`Sponsor ${sponsor.id}:`, {
            en_name: sponsor.en_name,
            is_sponsorship: isSponsorship,
            sponsorship_type: sponsorshipType,
            has_event_user: !!sponsor.event_user
          })
        }
        
        // Handle both number and string comparison
        return isSponsorship == 1 || isSponsorship === '1'
      })
      
      console.log('Filtered sponsors with is_sponsorship=1:', actualSponsors.length)
      console.log('=========================')
      
      // Expand sponsors to include each form3_data_entry as a separate card
      const expandedSponsors = []
      actualSponsors.forEach(sponsor => {
        if (sponsor?.form3_data_entry && Array.isArray(sponsor.form3_data_entry) && sponsor.form3_data_entry.length > 0) {
          // Create a card for each form3_data_entry (main sponsor + co-exhibitors)
          sponsor.form3_data_entry.forEach((form3Entry, index) => {
            expandedSponsors.push({
              ...sponsor,
              _form3Entry: form3Entry, // Store the specific form3 entry for this card
              _isCoExhibitor: form3Entry.is_coexhibitor === 1,
              _uniqueKey: `${sponsor.id}-${index}`, // Unique key for React rendering
              booth_number: form3Entry.booth_number || sponsor.booth_number // Prioritize form3 booth number
            })
          })
        } else {
          // No form3_data_entry or empty array, add sponsor using event_user and main details
          expandedSponsors.push({
            ...sponsor,
            _uniqueKey: `${sponsor.id}-single`
          })
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


  const getSponsorTier = useCallback((sponsor) => {
    const eventUser = sponsor.event_user || sponsor
    if (eventUser?.is_sponsorship === 1) {
      const sponsorshipType = eventUser?.sponsorship_type
      if (sponsorshipType) {
        return sponsorshipType
      }
    }
    return 'Sponsor'
  }, [])

  const getTierConfig = useCallback((tier) => {
    const lowerTier = tier?.toLowerCase() || ''
    
    if (lowerTier.includes('platinum')) {
      return { 
        label: tier, 
        color: 'from-slate-700 to-slate-800', 
        bg: 'bg-slate-700', 
        text: 'text-slate-700',
        light: 'bg-slate-50 text-slate-700 border-slate-200'
      }
    }
    if (lowerTier.includes('gold')) {
      return { 
        label: tier, 
        color: 'from-amber-500 to-amber-600', 
        bg: 'bg-amber-500', 
        text: 'text-amber-600',
        light: 'bg-amber-50 text-amber-700 border-amber-200'
      }
    }
    if (lowerTier.includes('silver')) {
      return { 
        label: tier, 
        color: 'from-gray-400 to-gray-500', 
        bg: 'bg-gray-400', 
        text: 'text-gray-600',
        light: 'bg-gray-50 text-gray-700 border-gray-200'
      }
    }
    if (lowerTier.includes('official')) {
      return { 
        label: tier, 
        color: 'from-blue-500 to-blue-600', 
        bg: 'bg-blue-500', 
        text: 'text-blue-600',
        light: 'bg-blue-50 text-blue-700 border-blue-200'
      }
    }
    if (lowerTier.includes('paint')) {
      return { 
        label: tier, 
        color: 'from-purple-500 to-purple-600', 
        bg: 'bg-purple-500', 
        text: 'text-purple-600',
        light: 'bg-purple-50 text-purple-700 border-purple-200'
      }
    }
    if (lowerTier.includes('hvac')) {
      return { 
        label: tier, 
        color: 'from-cyan-500 to-cyan-600', 
        bg: 'bg-cyan-500', 
        text: 'text-cyan-600',
        light: 'bg-cyan-50 text-cyan-700 border-cyan-200'
      }
    }
    if (lowerTier.includes('machinery')) {
      return { 
        label: tier, 
        color: 'from-orange-500 to-orange-600', 
        bg: 'bg-orange-500', 
        text: 'text-orange-600',
        light: 'bg-orange-50 text-orange-700 border-orange-200'
      }
    }
    
    return { 
      label: tier || 'Sponsor', 
      color: 'from-primary-500 to-primary-600', 
      bg: 'bg-primary-500', 
      text: 'text-primary-600',
      light: 'bg-primary-50 text-primary-700 border-primary-200'
    }
  }, [])

  const getSponsorName = useCallback((sponsor) => {
    return getLocalizedName(sponsor, language)
  }, [language])

  const getSponsorLogo = useCallback((sponsor) => {
    // Priority 1: Check the specific _form3Entry for this card
    const form3Entry = sponsor?._form3Entry
    if (form3Entry?.company_logo && typeof form3Entry.company_logo === 'string' && form3Entry.company_logo.trim() && form3Entry.company_logo !== 'null') {
      const logoPath = form3Entry.company_logo.trim()
      // If already full URL, return as is
      if (logoPath.startsWith('http')) {
        return logoPath
      }
      // Build full URL for relative paths
      return `https://eventxcrm.com/storage/${logoPath}`
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
        return `https://eventxcrm.com/storage/${logoPath}`
      }
    }
    
    return '/media/default-company.svg'
  }, [])

  const getSponsorSector = useCallback((sponsor) => {
    const form3Entry = sponsor?._form3Entry
    if (form3Entry?.company_industries && Array.isArray(form3Entry.company_industries) && form3Entry.company_industries.length > 0) {
      const firstIndustry = form3Entry.company_industries[0]
      
      // The company_industries array contains objects with id, name, ar_name properties
      if (typeof firstIndustry === 'object' && firstIndustry) {
        return getLocalizedIndustry(firstIndustry, language)
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
  }, [language])

  const getSponsorDescription = useCallback((sponsor) => {
    return getLocalizedProfile(sponsor, language)
  }, [language])

  const tiers = useMemo(() => 
    ['all', ...new Set(sponsors.map(sponsor => getSponsorTier(sponsor)))],
    [sponsors, getSponsorTier]
  )

  const countries = useMemo(() => {
    const extractedCountries = sponsors.map(sponsor => {
      // Check _form3Entry first, then fallback to main sponsor
      return sponsor?._form3Entry?.country || sponsor?.country || null
    }).filter(Boolean)
    return ['all', ...new Set(extractedCountries)]
  }, [sponsors])
  
  const sectors = useMemo(() => {
    const extractedSectors = sponsors.flatMap(sponsor => {
      const form3Entry = sponsor?._form3Entry
      if (form3Entry?.company_industries && Array.isArray(form3Entry.company_industries)) {
        return form3Entry.company_industries.map(industry => industry.name || industry.en_name || industry).filter(Boolean)
      }
      // Fallback to main sponsor sector/industry if no form3Entry
      const mainSector = sponsor?.sector || sponsor?.industry || sponsor?.category
      if (mainSector && typeof mainSector === 'string' && isNaN(mainSector)) {
        return [mainSector]
      }
      return []
    })
    return ['all', ...new Set(extractedSectors)].filter(Boolean)
  }, [sponsors])

  const filteredSponsors = useMemo(() => {
    let filtered = sponsors

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(sponsor => 
        getSponsorName(sponsor).toLowerCase().includes(query) ||
        getSponsorDescription(sponsor).toLowerCase().includes(query) ||
        (sponsor.country || '').toLowerCase().includes(query)
      )
    }

    if (selectedTier !== 'all') {
      filtered = filtered.filter(sponsor => getSponsorTier(sponsor) === selectedTier)
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(sponsor => {
        const sponsorCountry = sponsor?._form3Entry?.country || sponsor?.country || ''
        return sponsorCountry.toLowerCase() === selectedCountry.toLowerCase()
      })
    }

    if (selectedSector !== 'all') {
      filtered = filtered.filter(sponsor => {
        const sponsorSector = getSponsorSector(sponsor)
        if (sponsorSector === selectedSector) return true
        
        // Check all industries in form3Entry
        const form3Entry = sponsor?._form3Entry
        if (form3Entry?.company_industries && Array.isArray(form3Entry.company_industries)) {
          return form3Entry.company_industries.some(industry => 
            (industry.name || industry.en_name || industry) === selectedSector
          )
        }
        
        // Fallback to main sponsor fields
        const mainSector = sponsor?.sector || sponsor?.industry || sponsor?.category
        if (mainSector && typeof mainSector === 'string') {
          return mainSector === selectedSector
        }
        
        return false
      })
    }

    return filtered
  }, [sponsors, searchQuery, selectedTier, selectedCountry, selectedSector, getSponsorName, getSponsorDescription, getSponsorTier, getSponsorSector])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center animate-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">{t('loadingSponsors')}</p>
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
                {t('eventSponsors')}
              </h1>
              <p className="text-white/70 text-sm mt-1">{sponsors.length} {t('officialSponsors')}</p>
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
              placeholder={t('searchSponsors')}
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
                  {tier === 'all' ? t('allTiers') : getTierConfig(tier).label}
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
                  {country === 'all' ? t('allCountries') : country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sector Carousel - Same as Exhibitors page */}
      <div className="px-4 pb-4 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600">
        <div>
          <h3 className="text-xs font-semibold text-white/90 mb-2">{t('sector')}</h3>
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
                {s === 'all' ? t('allSectors') : s}
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
                  {sponsors.length === 0 ? t('noSponsorsFound') : t('noMatchesFound')}
                </p>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                  {sponsors.length === 0 
                    ? t('sponsorsWillBeDisplayed') 
                    : t('tryAdjustingFilters')
                  }
                </p>
                {filteredSponsors.length !== sponsors.length && (
                  <button
                    onClick={() => { 
                      setSearchQuery('')
                      setSelectedTier('all')
                      setSelectedCountry('all')
                      setSelectedSector('all')
                    }}
                    className="mt-4 px-6 py-2.5 bg-amber-600 text-white rounded-xl font-medium text-sm hover:bg-amber-700 transition-colors"
                  >
                    {t('clearFilters')}
                  </button>
                )}
              </div>
            ) : (
              <div className={clsx(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' 
                  : 'space-y-3'
              )}>
                {filteredSponsors.map(sponsor => (
                  <SponsorCard
                    key={sponsor._uniqueKey || sponsor.id}
                    sponsor={sponsor}
                    name={getSponsorName(sponsor)}
                    logo={getSponsorLogo(sponsor)}
                    sector={getSponsorSector(sponsor)}
                    description={getSponsorDescription(sponsor)}
                    booth={sponsor.booth_number}
                    country={sponsor.country}
                    tierConfig={getTierConfig(getSponsorTier(sponsor))}
                    viewMode={viewMode}
                    isFavorite={isFavorite('exhibitors', sponsor.id)}
                    onToggleFavorite={() => toggleFavorite('exhibitors', sponsor.id)}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sponsorships
