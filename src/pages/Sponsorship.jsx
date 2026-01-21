import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Heart, Mail, Phone, Globe, Building2, Crown, Award, Star, BadgeCheck, Search, Calendar } from 'lucide-react'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import MeetingRequestModal from '../components/MeetingRequestModal'
import { getExhibitors, getIndustries } from '../services/eventxApi'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import { clsx } from 'clsx'

const DEFAULT_LOGO = '/media/default-company.svg'

// Sponsorship configurations
const SPONSOR_CONFIG = {
  platinum: { label: 'Platinum', icon: Crown, bg: 'bg-gradient-to-r from-slate-600 to-slate-800', text: 'text-white' },
  gold: { label: 'Gold', icon: Award, bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', text: 'text-amber-900' },
  silver: { label: 'Silver', icon: Star, bg: 'bg-gradient-to-r from-gray-300 to-gray-400', text: 'text-gray-800' },
}

const Sponsorship = () => {
  const [exhibitors, setExhibitors] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [industries, setIndustries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sponsorLevel, setSponsorLevel] = useState('all')
  const [country, setCountry] = useState('all')
  const [sector, setSector] = useState('all')
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [selectedExhibitor, setSelectedExhibitor] = useState(null)
  const { isFavorite, toggleFavorite } = useApp()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation(language)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [exhibitorsData, industriesData] = await Promise.all([
        getExhibitors(),
        getIndustries()
      ])
      
      // Handle different API response structures for exhibitors
      const exhibitorList = exhibitorsData.data || exhibitorsData.exhibitors || exhibitorsData || []
      const allExhibitors = Array.isArray(exhibitorList) ? exhibitorList : []
      setExhibitors(allExhibitors)
      
      // Filter only sponsors (those with sponsorship flags = 1)
      const sponsorsList = allExhibitors.filter(exhibitor => {
        const eventUser = exhibitor?.event_user || exhibitor
        return eventUser?.is_platinum_sponsorship === 1 || 
               eventUser?.gold_sponsorship === 1 || 
               eventUser?.silver_sponsorship === 1
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
      
      setSponsors(expandedSponsors)
      
      // Handle different API response structures for industries
      const industryList = industriesData.data || industriesData.industries || industriesData || []
      setIndustries(Array.isArray(industryList) ? industryList : [])
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load sponsors and industries')
      setExhibitors([])
      setSponsors([])
      setIndustries([])
    } finally {
      setIsLoading(false)
    }
  }

  // Get logo from the specific form3_data_entry item for this card
  const getExhibitorLogo = (exhibitor) => {
    // Priority 1: Check the specific _form3Entry for this card
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.company_logo && typeof form3Entry.company_logo === 'string' && form3Entry.company_logo.trim() && form3Entry.company_logo !== 'null') {
      const logoPath = form3Entry.company_logo.trim()
      // If already full URL, return as is
      if (logoPath.startsWith('http')) {
        return logoPath
      }
      // Build full URL for relative paths
      return `https://eventxcrm.com/storage/${logoPath}`
    }
    
    // Priority 2: Check other logo fields from main exhibitor
    const alternativeLogos = [
      exhibitor?.logo_url,
      exhibitor?.logo,
      exhibitor?.image,
      exhibitor?.company_logo
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
    
    return DEFAULT_LOGO
  }

  const handleMeetingRequest = (exhibitor) => {
    setSelectedExhibitor(exhibitor)
    setShowMeetingModal(true)
  }

  const closeMeetingModal = () => {
    setShowMeetingModal(false)
    setSelectedExhibitor(null)
  }

  // Get company name - check form3Entry first, then fallback to exhibitor
  const getExhibitorName = (exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.company) {
      return form3Entry.company
    }
    return exhibitor.en_name || exhibitor.company_name || exhibitor.name || exhibitor.company || 'Unknown Company'
  }

  // Get Arabic name - check form3Entry first
  const getExhibitorArabicName = (exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.ar_company) {
      return form3Entry.ar_company
    }
    return exhibitor.ar_name || ''
  }

  // Get sector/industry from the specific form3Entry for this card
  const getExhibitorSector = (exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.company_industries) {
      const industries = Array.isArray(form3Entry.company_industries) ? form3Entry.company_industries : [form3Entry.company_industries]
      if (industries.length > 0) {
        const first = industries[0]
        return typeof first === 'string' ? first : first.name || first.en_name || 'General'
      }
    }
    return exhibitor.sector || exhibitor.industry || exhibitor.category || 'General'
  }

  const getExhibitorCountry = (exhibitor) => {
    return exhibitor.country || exhibitor?.form3_data_entry?.country || exhibitor.location || 'Libya'
  }

  const getExhibitorBooth = (exhibitor) => {
    if (exhibitor.booth_number && exhibitor.hall) {
      return `${exhibitor.hall} - ${exhibitor.booth_number}`
    }
    return exhibitor.booth_number || exhibitor.booth || exhibitor.stand || 'TBA'
  }

  const getExhibitorDescription = (exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.company_profile) {
      return form3Entry.company_profile
    }
    return exhibitor.description || exhibitor.about || exhibitor.company_description || ''
  }

  // Check if partner
  const isPartner = (exhibitor) => exhibitor?.is_partner === 1 || exhibitor?.is_partner === true

  // Get sponsorship level
  const getSponsorshipLevel = (exhibitor) => {
    const eventUser = exhibitor?.event_user || exhibitor
    if (eventUser?.is_platinum_sponsorship === 1 || eventUser?.is_platinum_sponsorship === true) return 'platinum'
    if (eventUser?.gold_sponsorship === 1 || eventUser?.gold_sponsorship === true) return 'gold'
    if (eventUser?.silver_sponsorship === 1 || eventUser?.silver_sponsorship === true) return 'silver'
    return null
  }

  // Get team count from exhibitor_badges
  const getTeamCount = (exhibitor) => exhibitor?.exhibitor_badges?.length || 0

  const countries = ['all', ...new Set(sponsors.map(e => getExhibitorCountry(e)).filter(Boolean))]
  
  // Extract unique sectors from sponsor _form3Entry company_industries
  const extractedSectors = sponsors.flatMap(sponsor => {
    const form3Entry = sponsor?._form3Entry
    if (form3Entry?.company_industries && Array.isArray(form3Entry.company_industries)) {
      return form3Entry.company_industries.map(industry => industry.name || industry.en_name || industry).filter(Boolean)
    }
    return []
  })
  
  const sectors = ['all', ...new Set(extractedSectors)].filter(Boolean)

  // Sponsor level filter options
  const sponsorLevels = [
    { key: 'all', label: 'All Sponsors' },
    { key: 'platinum', label: 'Platinum' },
    { key: 'gold', label: 'Gold' },
    { key: 'silver', label: 'Silver' }
  ]

  const filtered = sponsors.filter(ex => {
    const name = getExhibitorName(ex).toLowerCase()
    const desc = getExhibitorDescription(ex).toLowerCase()
    const booth = getExhibitorBooth(ex).toLowerCase()
    const searchLower = search.toLowerCase()
    
    const matchesSearch = !search || 
      name.includes(searchLower) ||
      desc.includes(searchLower) ||
      booth.includes(searchLower)
    const matchesCountry = country === 'all' || getExhibitorCountry(ex) === country
    
    // Enhanced sector matching to check all industries in the form3Entry
    const exhibitorSector = getExhibitorSector(ex)
    const matchesSector = sector === 'all' || exhibitorSector === sector ||
      // Also check if sponsor has multiple industries that include the selected sector
      (ex?._form3Entry?.company_industries && 
       Array.isArray(ex._form3Entry.company_industries) &&
       ex._form3Entry.company_industries.some(industry => 
         (typeof industry === 'string' ? industry : (industry.name || industry.en_name)) === sector
       ))
    
    const matchesSponsorLevel = sponsorLevel === 'all' || getSponsorshipLevel(ex) === sponsorLevel
    
    return matchesSearch && matchesCountry && matchesSector && matchesSponsorLevel
  })

  return (
    <>
      <Header title="Sponsorship" showBack={false} />
      <div className="p-4 space-y-4">
        <SearchBar 
          value={search} 
          onChange={setSearch}
          placeholder="Search sponsors by name, booth, or description..." 
        />

        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Sponsorship Level</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {sponsorLevels.map(level => (
              <button
                key={level.key}
                onClick={() => setSponsorLevel(level.key)}
                className={clsx(
                  'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors',
                  sponsorLevel === level.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                )}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

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
            <button onClick={loadData} className="ml-2 underline">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Crown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No sponsors found</p>
            {sponsors.length === 0 && !error && (
              <p className="text-sm text-gray-400 mt-1">No exhibitors have sponsorship flags set</p>
            )}
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6" />
                <h2 className="text-lg font-bold">Event Sponsors</h2>
              </div>
              <p className="text-primary-100 text-sm">
                Meet our valued sponsors supporting Libya Build 2026 ({filtered.length} sponsors)
              </p>
            </div>
            
            <div className="space-y-3">
              {filtered.map(exhibitor => {
                const sponsorLevel = getSponsorshipLevel(exhibitor)
                const sponsorConfig = sponsorLevel ? SPONSOR_CONFIG[sponsorLevel] : null
                const SponsorIcon = sponsorConfig?.icon
                
                return (
                  <div key={exhibitor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                    {/* Sponsor banner */}
                    {sponsorConfig && (
                      <div className={`${sponsorConfig.bg} ${sponsorConfig.text} px-4 py-3 flex items-center gap-2`}>
                        <SponsorIcon className="w-5 h-5" />
                        <span className="text-sm font-bold">{sponsorConfig.label} Sponsor</span>
                      </div>
                    )}
                    
                    <Link to={`/sponsorships/${exhibitor.id}`} className="block p-4">
                      <div className="flex gap-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={getExhibitorLogo(exhibitor)}
                            alt={getExhibitorName(exhibitor)}
                            className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200"
                            onError={(e) => { e.target.src = DEFAULT_LOGO }}
                          />
                          {isPartner(exhibitor) && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                              <BadgeCheck className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <h3 className="font-bold text-gray-900 truncate">{getExhibitorName(exhibitor)}</h3>
                              {getExhibitorArabicName(exhibitor) && (
                                <p className="text-xs text-gray-500 truncate" dir="rtl">{getExhibitorArabicName(exhibitor)}</p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                toggleFavorite('exhibitors', exhibitor.id)
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                            >
                              <Heart
                                className={clsx(
                                  'w-5 h-5 transition-all',
                                  isFavorite('exhibitors', exhibitor.id)
                                    ? 'fill-red-500 text-red-500 scale-110'
                                    : 'text-gray-400'
                                )}
                              />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {isPartner(exhibitor) && (
                              <Badge variant="success" size="sm">
                                <BadgeCheck className="w-3 h-3 mr-0.5" />
                                Partner
                              </Badge>
                            )}
                            <Badge variant="primary" size="sm">{getExhibitorSector(exhibitor)}</Badge>
                            <Badge size="sm">{getExhibitorCountry(exhibitor)}</Badge>
                          </div>
                          {getExhibitorDescription(exhibitor) && (
                            <p className="text-sm text-gray-600 line-clamp-2">{getExhibitorDescription(exhibitor)}</p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {getExhibitorBooth(exhibitor)}
                              </span>
                              {getTeamCount(exhibitor) > 0 && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5" />
                                  {getTeamCount(exhibitor)} team
                                </span>
                              )}
                            </div>
                            {user && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleMeetingRequest(exhibitor)
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                Request Meeting
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      
      {/* Meeting Request Modal */}
      <MeetingRequestModal
        isOpen={showMeetingModal}
        onClose={closeMeetingModal}
        recipient={selectedExhibitor}
        recipientType="exhibitor"
      />
    </>
  )
}

export default Sponsorship
