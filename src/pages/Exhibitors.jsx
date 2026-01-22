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
import { getLocalizedName, getLocalizedProfile, getLocalizedIndustry } from '../utils/localization'
import { clsx } from 'clsx'

const DEFAULT_LOGO = '/media/default-company.svg'

// Sponsorship configurations
const SPONSOR_CONFIG = {
  platinum: { label: 'Platinum', icon: Crown, bg: 'bg-gradient-to-r from-slate-600 to-slate-800', text: 'text-white' },
  gold: { label: 'Gold', icon: Award, bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', text: 'text-amber-900' },
  silver: { label: 'Silver', icon: Star, bg: 'bg-gradient-to-r from-gray-300 to-gray-400', text: 'text-gray-800' },
}

const Exhibitors = () => {
  const [exhibitors, setExhibitors] = useState([])
  const [industries, setIndustries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
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
  }, []) // Fresh fetch on every mount
  
  // Also refresh when user navigates back to this page
  useEffect(() => {
    const handleFocus = () => {
      loadData()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
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
      
      // Expand exhibitors to include each form3_data_entry as a separate card
      const expandedExhibitors = []
      if (Array.isArray(exhibitorList)) {
        exhibitorList.forEach(exhibitor => {
          if (exhibitor?.form3_data_entry && Array.isArray(exhibitor.form3_data_entry) && exhibitor.form3_data_entry.length > 0) {
            // Create a card for each form3_data_entry (main exhibitor + co-exhibitors)
            exhibitor.form3_data_entry.forEach(form3Entry => {
              expandedExhibitors.push({
                ...exhibitor,
                _form3Entry: form3Entry, // Store the specific form3 entry for this card
                _isCoExhibitor: form3Entry.is_coexhibitor === 1
              })
            })
          } else {
            // No form3_data_entry or empty array - add exhibitor with company base data
            // This handles exhibitors like "Company Brevo Exhibitor testt" (id 5258)
            expandedExhibitors.push({
              ...exhibitor,
              _form3Entry: null,
              _isCoExhibitor: false,
              _useCompanyData: true // Flag to use company-level data
            })
          }
        })
      }
      
      setExhibitors(expandedExhibitors)
      
      // Handle different API response structures for industries
      const industryList = industriesData.data || industriesData.industries || industriesData || []
      setIndustries(Array.isArray(industryList) ? industryList : [])
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load exhibitors and industries')
      setExhibitors([])
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

  // Get exhibitor name based on language
  const getExhibitorName = (exhibitor) => {
    // Try form3 entry first
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry) {
      if (language === 'ar' && form3Entry.ar_company) return form3Entry.ar_company
      if (form3Entry.company) return form3Entry.company
    }
    // Fallback to company-level data
    if (language === 'ar' && exhibitor.ar_name) return exhibitor.ar_name
    return exhibitor.en_name || exhibitor.company_name || exhibitor.name || 'Unknown Exhibitor'
  }

  // Get Arabic name - kept for compatibility
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
        if (typeof first === 'string') return first
        // Check for Arabic name if in Arabic mode
        return getLocalizedIndustry(first, language)
      }
    }
    
    // Fallback to company-level sector or find sector name from industries list
    if (exhibitor.sector && typeof exhibitor.sector === 'number') {
      // Try to find sector name from industries list
      const sectorObj = industries.find(ind => ind.id === exhibitor.sector)
      if (sectorObj) {
        return getLocalizedIndustry(sectorObj, language)
      }
    }
    
    return exhibitor.sector || exhibitor.industry || exhibitor.category || 'General'
  }

  const getExhibitorCountry = (exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.country) return form3Entry.country
    return exhibitor.country || exhibitor.location || 'Libya'
  }

  const getExhibitorBooth = (exhibitor) => {
    // Check event_user for stand info
    const eventUser = exhibitor?.event_user
    if (eventUser?.stand_no) return eventUser.stand_no
    if (eventUser?.hall_no && eventUser?.stand_no) {
      return `${eventUser.hall_no} - ${eventUser.stand_no}`
    }
    
    // Check form3 entry
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.stand_no) return form3Entry.stand_no
    
    // Fallback to company level
    if (exhibitor.booth_number && exhibitor.hall) {
      return `${exhibitor.hall} - ${exhibitor.booth_number}`
    }
    return exhibitor.booth_number || exhibitor.booth || exhibitor.stand || 'TBA'
  }

  const getExhibitorDescription = (exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry) {
      if (language === 'ar' && form3Entry.ar_company_profile) return form3Entry.ar_company_profile
      if (form3Entry.company_profile) return form3Entry.company_profile
    }
    // Fallback to company-level description or contact info
    const desc = exhibitor.description || exhibitor.profile || ''
    const contact = exhibitor.email || exhibitor.phone || ''
    return desc || (contact ? `Contact: ${contact}` : 'No description available')
  }

  // Check if partner
  const isPartner = (exhibitor) => {
    const eventUser = exhibitor?.event_user || exhibitor
    return eventUser?.is_partner === 1 || eventUser?.is_partner === true
  }

  // Get partner type
  const getPartnerType = (exhibitor) => {
    const eventUser = exhibitor?.event_user || exhibitor
    return eventUser?.partner_type || 'Partner'
  }

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

  const countries = ['all', ...new Set(exhibitors.map(e => getExhibitorCountry(e)).filter(Boolean))]
  
  // Use industries from API instead of extracting from exhibitor data
  const sectors = ['all', ...industries.map(industry => {
    // Handle different industry object structures
    return industry.en_name || industry.name || industry.title || industry
  }).filter(Boolean)]

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
    
    // Fix sector matching to properly compare with exhibitor's actual industries
    const exhibitorSector = getExhibitorSector(ex)
    const matchesSector = sector === 'all' || exhibitorSector === sector || 
      // Also check if exhibitor has multiple industries that include the selected sector
      (ex?.form3_data_entry?.[0]?.company_industries && 
       Array.isArray(ex.form3_data_entry[0].company_industries) &&
       ex.form3_data_entry[0].company_industries.some(industry => 
         (typeof industry === 'string' ? industry : (industry.name || industry.en_name)) === sector
       ))
    
    return matchesSearch && matchesCountry && matchesSector
  })

  return (
    <>
      <Header title={t('exhibitors')} showBack={false} />
      <div className="p-4 space-y-4">
        <SearchBar 
          value={search} 
          onChange={setSearch}
          placeholder={t('searchByName')} 
        />

        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">{t('country')}</h3>
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
                {c === 'all' ? t('allCountries') : c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">{t('sector')}</h3>
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
                {s === 'all' ? t('allSectors') : s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
            <button onClick={loadData} className="ml-2 underline">{t('retry')}</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('noExhibitorsFound')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(exhibitor => {
              const sponsorLevel = getSponsorshipLevel(exhibitor)
              const sponsorConfig = sponsorLevel ? SPONSOR_CONFIG[sponsorLevel] : null
              const SponsorIcon = sponsorConfig?.icon
              const isExhibitorPartner = isPartner(exhibitor)
              const partnerType = getPartnerType(exhibitor)
              
              return (
                <div key={exhibitor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                  {/* Sponsor banner */}
                  {sponsorConfig && (
                    <div className={`${sponsorConfig.bg} ${sponsorConfig.text} px-4 py-2 flex items-center gap-2`}>
                      <SponsorIcon className="w-4 h-4" />
                      <span className="text-sm font-semibold">{t(sponsorConfig.label.toLowerCase() + 'Sponsor')}</span>
                    </div>
                  )}
                  
                  {/* Partner banner */}
                  {!sponsorConfig && isExhibitorPartner && (
                    <div className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-4 py-2 flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-semibold">{t('partner')}</span>
                    </div>
                  )}
                  
                  <Link to={`/exhibitors/${exhibitor.id}`} className="block p-4">
                    <div className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={getExhibitorLogo(exhibitor)}
                          alt={getExhibitorName(exhibitor)}
                          className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200"
                          onError={(e) => { e.target.src = DEFAULT_LOGO }}
                        />
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
                              {t('partner')}
                            </Badge>
                          )}
                          <Badge variant="primary" size="sm">
                            {getExhibitorSector(exhibitor)}
                          </Badge>
                          <Badge size="sm">{getExhibitorCountry(exhibitor)}</Badge>
                        </div>
                        {getExhibitorDescription(exhibitor) && (
                          <p className="text-sm text-gray-600 line-clamp-2">{getExhibitorDescription(exhibitor)}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {getExhibitorBooth(exhibitor)}
                          </span>
                          {getTeamCount(exhibitor) > 0 && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {getTeamCount(exhibitor)} {t('team')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
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

export default Exhibitors
