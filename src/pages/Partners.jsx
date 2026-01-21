import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Users, ExternalLink, Heart, Loader2, Building2, Globe, Tag, Filter, LayoutGrid, LayoutList, Calendar } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import MeetingRequestModal from '../components/MeetingRequestModal'
import { getPartners, getIndustries } from '../services/eventxApi'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import { clsx } from 'clsx'

const Partners = () => {
  const [partners, setPartners] = useState([])
  const [filteredPartners, setFilteredPartners] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSector, setSelectedSector] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const { toggleFavorite, isFavorite } = useApp()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation(language)

  useEffect(() => {
    loadPartners()
  }, [])

  useEffect(() => {
    filterPartners()
  }, [partners, searchQuery, selectedSector, selectedCountry])

  const loadPartners = async () => {
    setIsLoading(true)
    try {
      const [partnersData, industriesData] = await Promise.all([
        getPartners(),
        getIndustries()
      ])
      const partnersList = partnersData.data || partnersData.partners || partnersData || []
      
      setPartners(Array.isArray(partnersList) ? partnersList : [])
    } catch (err) {
      console.error('Failed to load partners:', err)
      setPartners([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterPartners = () => {
    let filtered = partners

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(partner => 
        (partner.en_name || partner.company_name || partner.name || '').toLowerCase().includes(query) ||
        (partner.form3_data_entry?.company_description || partner.description || '').toLowerCase().includes(query) ||
        (partner.country || '').toLowerCase().includes(query)
      )
    }

    // Sector filter
    if (selectedSector !== 'all') {
      filtered = filtered.filter(partner => {
        const form3 = partner.form3_data_entry
        if (form3?.industries) {
          const industries = Array.isArray(form3.industries) ? form3.industries : [form3.industries]
          return industries.some(industry => {
            const industryName = typeof industry === 'string' ? industry : industry.name || industry.en_name || ''
            return industryName.toLowerCase().includes(selectedSector.toLowerCase())
          })
        }
        return (partner.sector || partner.industry || '').toLowerCase().includes(selectedSector.toLowerCase())
      })
    }

    // Country filter
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(partner => 
        (partner.country || '').toLowerCase() === selectedCountry.toLowerCase()
      )
    }

    setFilteredPartners(filtered)
  }

  // Get unique sectors and countries
  const sectors = ['all', ...new Set(
    partners.flatMap(partner => {
      const form3 = partner.form3_data_entry
      if (form3?.industries) {
        const industries = Array.isArray(form3.industries) ? form3.industries : [form3.industries]
        return industries.map(industry => typeof industry === 'string' ? industry : industry.name || industry.en_name || 'General')
      }
      return [partner.sector || partner.industry || 'General']
    }).filter(Boolean)
  )]

  const countries = ['all', ...new Set(partners.map(p => p.country).filter(Boolean))]

  // Helper functions
  const getPartnerName = (partner) => partner.en_name || partner.company_name || partner.name || 'Partner'
  
  const getPartnerLogo = (partner) => {
    const form3Logo = partner?.form3_data_entry?.company_logo
    if (form3Logo && typeof form3Logo === 'string' && form3Logo.trim() && form3Logo !== 'null') {
      const logoPath = form3Logo.trim()
      // If already full URL, return as is
      if (logoPath.startsWith('http')) {
        return logoPath
      }
      // Build full URL for relative paths starting with 'files/'
      if (logoPath.startsWith('files/')) {
        return `https://eventxcrm.com/storage/${logoPath}`
      }
      return `https://eventxcrm.com/storage/${logoPath}`
    }
    
    // Priority 2: Check other logo fields
    const alternativeLogos = [
      partner?.logo_url,
      partner?.logo,
      partner?.image,
      partner?.company_logo
    ]
    
    for (const logo of alternativeLogos) {
      if (logo && typeof logo === 'string' && logo.trim() && logo !== 'null') {
        const logoPath = logo.trim()
        if (logoPath.startsWith('http')) {
          return logoPath
        }
        if (logoPath.startsWith('files/')) {
          return `https://eventxcrm.com/storage/${logoPath}`
        }
        return `https://eventxcrm.com/storage/${logoPath}`
      }
    }
    
    return '/media/default-company.svg'
  }

  const handleMeetingRequest = (partner) => {
    setSelectedPartner(partner)
    setShowMeetingModal(true)
  }

  const closeMeetingModal = () => {
    setShowMeetingModal(false)
    setSelectedPartner(null)
  }
  const getPartnerSector = (partner) => {
    const form3 = partner.form3_data_entry
    if (form3?.industries) {
      const industries = Array.isArray(form3.industries) ? form3.industries : [form3.industries]
      if (industries.length > 0) {
        const first = industries[0]
        return typeof first === 'string' ? first : first.name || first.en_name || 'General'
      }
    }
    return partner.sector || partner.industry || 'General'
  }
  const getPartnerDescription = (partner) => partner.form3_data_entry?.company_description || partner.description || ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading partners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 text-white">
        <div className="px-4 pt-12 pb-6 safe-top">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Official Partners</h1>
              <p className="text-white/70 text-sm mt-1">{partners.length} strategic partners</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-2.5 rounded-xl transition-all',
                  viewMode === 'grid' ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-2.5 rounded-xl transition-all',
                  viewMode === 'list' ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {/* <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partners..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
            />
          </div> */}

          {/* Filter Pills */}
          {/* <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {sectors.map(sector => (
                <option key={sector} value={sector} className="bg-purple-600 text-white">
                  {sector === 'all' ? 'All Sectors' : sector}
                </option>
              ))}
            </select>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {countries.map(country => (
                <option key={country} value={country} className="bg-purple-600 text-white">
                  {country === 'all' ? 'All Countries' : country}
                </option>
              ))}
            </select>
          </div> */}
        </div>
      </div>

      {/* Content */}
      <div className="-mt-4 relative z-10">
        <div className="bg-gray-50 rounded-t-3xl pt-6 pb-6 min-h-[60vh]">
          <div className="px-4">
            {filteredPartners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-800 font-semibold text-lg mb-1">
                  {partners.length === 0 ? 'No partners found' : 'No matches found'}
                </p>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                  {partners.length === 0 
                    ? 'Partners will be displayed here once available' 
                    : 'Try adjusting your search or filters'
                  }
                </p>
                {filteredPartners.length !== partners.length && (
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedSector('all'); setSelectedCountry('all') }}
                    className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700 transition-colors"
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
                {filteredPartners.map(partner => (
                  <Link key={partner.id} to={`/partners/${partner.id}`}>
                    <div className={clsx(
                      'bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]',
                      viewMode === 'list' ? 'p-4' : 'p-5'
                    )}>
                      {/* Partner Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full">
                          OFFICIAL PARTNER
                        </span>
                      </div>

                      <div className={clsx(
                        'flex gap-4',
                        viewMode === 'list' ? 'items-center' : 'items-start'
                      )}>
                        <div className="flex-shrink-0">
                          <img
                            src={getPartnerLogo(partner)}
                            alt={getPartnerName(partner)}
                            className={clsx(
                              'object-cover bg-gray-100 border border-gray-200 rounded-xl',
                              viewMode === 'list' ? 'w-16 h-16' : 'w-20 h-20'
                            )}
                            onError={(e) => { e.target.src = '/media/default-company.svg' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                            {getPartnerName(partner)}
                          </h3>
                          <p className="text-sm text-purple-600 font-medium mb-2">
                            {getPartnerSector(partner)}
                          </p>
                          {getPartnerDescription(partner) && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {getPartnerDescription(partner)}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              {partner.booth_number && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  Booth {partner.booth_number}
                                </span>
                              )}
                              {partner.country && (
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3.5 h-3.5" />
                                  {partner.country}
                                </span>
                              )}
                            </div>
                            {user && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleMeetingRequest(partner)
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                Request Meeting
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); toggleFavorite('exhibitors', partner.id) }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-all"
                        >
                          <Heart className={clsx('w-5 h-5 transition-all', isFavorite('exhibitors', partner.id) ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Meeting Request Modal */}
      <MeetingRequestModal
        isOpen={showMeetingModal}
        onClose={closeMeetingModal}
        recipient={selectedPartner}
        recipientType="partner"
      />
    </div>
  )
}

export default Partners
