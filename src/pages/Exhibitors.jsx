import { useState, useEffect, useMemo, useCallback } from 'react'
import { Building2 } from 'lucide-react'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import Loader from '../components/Loader'
import MeetingRequestModal from '../components/MeetingRequestModal'
import ExhibitorCard from '../components/ExhibitorCard'
import { getExhibitors, getIndustries } from '../services/eventxApi'
import { getCachedData, clearCache } from '../services/apiCache'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import { getLocalizedIndustry } from '../utils/localization'
import { clsx } from 'clsx'

const DEFAULT_LOGO = '/media/default-company.svg'
const CACHE_TTL = 5 * 60 * 1000
const ITEMS_PER_PAGE = 20

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
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const { isFavorite, toggleFavorite } = useApp()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation(language)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (forceRefresh = false) => {
    setIsLoading(true)
    setError('')
    try {
      if (forceRefresh) {
        clearCache('exhibitors')
        clearCache('industries')
      }

      const [exhibitorsData, industriesData] = await Promise.all([
        getCachedData('exhibitors', () => getExhibitors(), CACHE_TTL),
        getCachedData('industries', () => getIndustries(), CACHE_TTL)
      ])
      
      const exhibitorList = exhibitorsData.data || exhibitorsData.exhibitors || exhibitorsData || []
      
      const expandedExhibitors = []
      if (Array.isArray(exhibitorList)) {
        exhibitorList.forEach(exhibitor => {
          if (exhibitor?.form3_data_entry && Array.isArray(exhibitor.form3_data_entry) && exhibitor.form3_data_entry.length > 0) {
            exhibitor.form3_data_entry.forEach(form3Entry => {
              expandedExhibitors.push({
                ...exhibitor,
                _form3Entry: form3Entry,
                _isCoExhibitor: form3Entry.is_coexhibitor === 1
              })
            })
          } else {
            expandedExhibitors.push({
              ...exhibitor,
              _form3Entry: null,
              _isCoExhibitor: false,
              _useCompanyData: true
            })
          }
        })
      }
      
      setExhibitors(expandedExhibitors)
      
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

  const getExhibitorLogo = useCallback((exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.company_logo && typeof form3Entry.company_logo === 'string' && form3Entry.company_logo.trim() && form3Entry.company_logo !== 'null') {
      const logoPath = form3Entry.company_logo.trim()
      if (logoPath.startsWith('http')) {
        return logoPath
      }
      return `https://eventxcrm.com/storage/${logoPath}`
    }
    
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
  }, [])

  const handleMeetingRequest = (exhibitor) => {
    setSelectedExhibitor(exhibitor)
    setShowMeetingModal(true)
  }

  const closeMeetingModal = useCallback(() => {
    setShowMeetingModal(false)
    setSelectedExhibitor(null)
  }, [])

  const getExhibitorName = useCallback((exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry) {
      if (language === 'ar' && form3Entry.ar_company) return form3Entry.ar_company
      if (form3Entry.company) return form3Entry.company
    }
    if (language === 'ar' && exhibitor.ar_name) return exhibitor.ar_name
    return exhibitor.en_name || exhibitor.company_name || exhibitor.name || 'Unknown Exhibitor'
  }, [language])

  const getExhibitorArabicName = useCallback((exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.ar_company) {
      return form3Entry.ar_company
    }
    return exhibitor.ar_name || ''
  }, [])

  const getExhibitorSector = useCallback((exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.company_industries) {
      const industryList = Array.isArray(form3Entry.company_industries) ? form3Entry.company_industries : [form3Entry.company_industries]
      if (industryList.length > 0) {
        const first = industryList[0]
        if (typeof first === 'string') return first
        return getLocalizedIndustry(first, language)
      }
    }
    
    if (exhibitor.sector && typeof exhibitor.sector === 'number') {
      const sectorObj = industries.find(ind => ind.id === exhibitor.sector)
      if (sectorObj) {
        return getLocalizedIndustry(sectorObj, language)
      }
    }
    
    return exhibitor.sector || exhibitor.industry || exhibitor.category || 'General'
  }, [industries, language])

  const getExhibitorCountry = useCallback((exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.country) return form3Entry.country
    return exhibitor.country || exhibitor.location || 'Libya'
  }, [])

  const getExhibitorBooth = useCallback((exhibitor) => {
    const eventUser = exhibitor?.event_user
    if (eventUser?.stand_no) return eventUser.stand_no
    if (eventUser?.hall_no && eventUser?.stand_no) {
      return `${eventUser.hall_no} - ${eventUser.stand_no}`
    }
    
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry?.stand_no) return form3Entry.stand_no
    
    if (exhibitor.booth_number && exhibitor.hall) {
      return `${exhibitor.hall} - ${exhibitor.booth_number}`
    }
    return exhibitor.booth_number || exhibitor.booth || exhibitor.stand || 'TBA'
  }, [])

  const getExhibitorDescription = useCallback((exhibitor) => {
    const form3Entry = exhibitor?._form3Entry
    if (form3Entry) {
      if (language === 'ar' && form3Entry.ar_company_profile) return form3Entry.ar_company_profile
      if (form3Entry.company_profile) return form3Entry.company_profile
    }
    const desc = exhibitor.description || exhibitor.profile || ''
    const contact = exhibitor.email || exhibitor.phone || ''
    return desc || (contact ? `Contact: ${contact}` : 'No description available')
  }, [language])

  const isPartner = useCallback((exhibitor) => {
    const eventUser = exhibitor?.event_user || exhibitor
    return eventUser?.is_partner === 1 || eventUser?.is_partner === true
  }, [])

  const getPartnerType = useCallback((exhibitor) => {
    const eventUser = exhibitor?.event_user || exhibitor
    return eventUser?.partner_type || 'Partner'
  }, [])

  const getSponsorshipLevel = useCallback((exhibitor) => {
    const eventUser = exhibitor?.event_user || exhibitor
    if (eventUser?.is_platinum_sponsorship === 1 || eventUser?.is_platinum_sponsorship === true) return 'platinum'
    if (eventUser?.gold_sponsorship === 1 || eventUser?.gold_sponsorship === true) return 'gold'
    if (eventUser?.silver_sponsorship === 1 || eventUser?.silver_sponsorship === true) return 'silver'
    return null
  }, [])

  const getTeamCount = useCallback((exhibitor) => exhibitor?.exhibitor_badges?.length || 0, [])

  const countries = useMemo(() => 
    ['all', ...new Set(exhibitors.map(e => getExhibitorCountry(e)).filter(Boolean))],
    [exhibitors, getExhibitorCountry]
  )
  
  const sectors = useMemo(() => 
    ['all', ...industries.map(industry => 
      industry.en_name || industry.name || industry.title || industry
    ).filter(Boolean)],
    [industries]
  )

  const filtered = useMemo(() => 
    exhibitors.filter(ex => {
      const name = getExhibitorName(ex).toLowerCase()
      const desc = getExhibitorDescription(ex).toLowerCase()
      const booth = getExhibitorBooth(ex).toLowerCase()
      const searchLower = search.toLowerCase()
      
      const matchesSearch = !search || 
        name.includes(searchLower) ||
        desc.includes(searchLower) ||
        booth.includes(searchLower)
      const matchesCountry = country === 'all' || getExhibitorCountry(ex) === country
      
      const exhibitorSector = getExhibitorSector(ex)
      const matchesSector = sector === 'all' || exhibitorSector === sector || 
        (ex?.form3_data_entry?.[0]?.company_industries && 
         Array.isArray(ex.form3_data_entry[0].company_industries) &&
         ex.form3_data_entry[0].company_industries.some(industry => 
           (typeof industry === 'string' ? industry : (industry.name || industry.en_name)) === sector
         ))
      
      return matchesSearch && matchesCountry && matchesSector
    }),
    [exhibitors, search, country, sector, getExhibitorName, getExhibitorDescription, getExhibitorBooth, getExhibitorCountry, getExhibitorSector]
  )

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [search, country, sector])

  // Paginated exhibitors to display
  const displayedExhibitors = useMemo(() => 
    filtered.slice(0, displayedCount),
    [filtered, displayedCount]
  )

  const hasMore = displayedCount < filtered.length

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    // Simulate a small delay for better UX
    setTimeout(() => {
      setDisplayedCount(prev => prev + ITEMS_PER_PAGE)
      setIsLoadingMore(false)
    }, 300)
  }

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
            <button onClick={() => loadData(true)} className="ml-2 underline">{t('retry')}</button>
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
          <>
            <div className="space-y-3">
              {displayedExhibitors.map(exhibitor => (
                <ExhibitorCard
                  key={exhibitor.id}
                  exhibitor={exhibitor}
                  name={getExhibitorName(exhibitor)}
                  arabicName={getExhibitorArabicName(exhibitor)}
                  logo={getExhibitorLogo(exhibitor)}
                  sector={getExhibitorSector(exhibitor)}
                  country={getExhibitorCountry(exhibitor)}
                  booth={getExhibitorBooth(exhibitor)}
                  description={getExhibitorDescription(exhibitor)}
                  teamCount={getTeamCount(exhibitor)}
                  sponsorLevel={getSponsorshipLevel(exhibitor)}
                  isPartner={isPartner(exhibitor)}
                  isFavorite={isFavorite('exhibitors', exhibitor.id)}
                  onToggleFavorite={() => toggleFavorite('exhibitors', exhibitor.id)}
                  t={t}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="space-y-3 py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold text-base hover:from-primary-700 hover:to-primary-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader size="sm" />
                      <span>{t('loading')}...</span>
                    </>
                  ) : (
                    <span>{t('loadMore')}</span>
                  )}
                </button>
                <p className="text-center text-sm text-gray-500">
                  {t('showing')} {displayedCount} {t('of')} {filtered.length} {t('exhibitors')}
                </p>
              </div>
            )}

            {/* All items loaded message */}
            {!hasMore && filtered.length > ITEMS_PER_PAGE && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">
                  {t('allExhibitorsLoaded')} ({filtered.length} {t('total')})
                </p>
              </div>
            )}
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

export default Exhibitors
