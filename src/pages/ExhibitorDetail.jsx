import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Mail, Phone, Globe, Heart, Calendar, Building2, ArrowLeft, Clock, Users, Package, CheckCircle, Loader2, ChevronDown, Send, Star, Award, Crown, BadgeCheck, Briefcase, User } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import { getExhibitorFiltered, scheduleMeeting } from '../services/eventxApi'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import { getLocalizedName, getLocalizedProfile, getLocalizedIndustry } from '../utils/localization'
import { clsx } from 'clsx'

const DEFAULT_LOGO = '/media/default-company.svg'

// Event dates: April 20-23, 2026
const EVENT_DATES = [
  { date: '2026-04-20', label: 'Apr 20' },
  { date: '2026-04-21', label: 'Apr 21' },
  { date: '2026-04-22', label: 'Apr 22' },
  { date: '2026-04-23', label: 'Apr 23' },
]

// Time slots: 10:00 AM to 5:00 PM, 30-minute intervals
const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30'
]

const formatTimeSlot = (time) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

const ExhibitorDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite, addMeeting } = useApp()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation(language)
  const [exhibitor, setExhibitor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Meeting scheduling state
  const [showMeetingForm, setShowMeetingForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(EVENT_DATES[0].date)
  const [selectedTime, setSelectedTime] = useState('')
  const [meetingNotes, setMeetingNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [meetingSuccess, setMeetingSuccess] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])

  useEffect(() => {
    loadExhibitor()
  }, [id])

  // Load available users when exhibitor is loaded
  useEffect(() => {
    if (exhibitor) {
      const users = getExhibitorUsers()
      setAvailableUsers(users)
      setSelectedUserIds([]) // Reset selection when exhibitor changes
    }
  }, [exhibitor])

  const loadExhibitor = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getExhibitorFiltered(id)
      // Handle different response structures
      const dataArray = response.data || []
      const exhibitorData = Array.isArray(dataArray) ? dataArray[0] : dataArray
      
      if (exhibitorData) {
        setExhibitor(exhibitorData)
      } else {
        setError('Exhibitor not found')
      }
    } catch (err) {
      console.error('Failed to load exhibitor:', err)
      setError('Failed to load exhibitor details')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions to get exhibitor data
  const getExhibitorLogo = () => {
    const form3Logo = exhibitor?.form3_data_entry?.company_logo
    if (form3Logo && typeof form3Logo === 'string' && form3Logo.trim() && form3Logo !== 'null') {
      const logoPath = form3Logo.trim()
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
  }

  const getName = () => getLocalizedName(exhibitor, language)
  const getArabicName = () => exhibitor?.ar_name || ''
  const getCountry = () => exhibitor?.country || exhibitor?.form3_data_entry?.country || exhibitor?.location || 'Libya'
  const getSector = () => {
    // Check direct company_industries from API response first
    if (exhibitor?.company_industries?.length > 0) {
      return exhibitor.company_industries[0].name || exhibitor.company_industries[0].en_name || 'General'
    }
    
    // Fallback to form3_data_entry (it's an array!)
    const form3Array = exhibitor?.form3_data_entry
    if (Array.isArray(form3Array) && form3Array.length > 0) {
      for (const form3 of form3Array) {
        if (form3?.company_industries?.length > 0) {
          return form3.company_industries[0].name || form3.company_industries[0].en_name || 'General'
        }
      }
    }
    
    return exhibitor?.sector || exhibitor?.industry || exhibitor?.category || 'General'
  }
  
  const getExhibitorIndustries = () => {
    // Check direct company_industries from API response first
    if (exhibitor?.company_industries?.length > 0) {
      return exhibitor.company_industries
    }
    
    // Fallback to form3_data_entry (it's an array - use first entry only, max 5 industries)
    const form3Array = exhibitor?.form3_data_entry
    if (Array.isArray(form3Array) && form3Array.length > 0) {
      const firstForm3 = form3Array[0]
      if (firstForm3?.company_industries?.length > 0) {
        return firstForm3.company_industries
      }
    }
    
    return []
  }
  
  const getExhibitorProfile = () => getLocalizedProfile(exhibitor, language)
  
  const getHall = () => exhibitor?.hall || 'TBA'
  const getBooth = () => {
    if (exhibitor?.booth_number && exhibitor?.hall) {
      return `${exhibitor.hall} - ${exhibitor.booth_number}`
    }
    return exhibitor?.booth_number || exhibitor?.booth || exhibitor?.stand || 'TBA'
  }
  const getDescription = () => exhibitor?.form3_data_entry?.company_description || exhibitor?.description || exhibitor?.about || exhibitor?.company_description || ''
  const getTags = () => exhibitor?.tags || []
  const getProducts = () => {
    const form3 = exhibitor?.form3_data_entry
    return form3?.products || exhibitor?.products || []
  }
  const getExhibitorBadges = () => exhibitor?.exhibitor_badges || []
  
  const getMainContact = () => {
    return exhibitor?.contacts?.find(contact => contact.contact_type === 'main_contact') || exhibitor?.contacts?.[0]
  }
  
  const getEmail = () => {
    const form3 = exhibitor?.form3_data_entry
    const mainContact = getMainContact()
    return form3?.email || mainContact?.email || exhibitor?.email || exhibitor?.contact_email || ''
  }
  
  const getPhone = () => {
    const form3 = exhibitor?.form3_data_entry
    const mainContact = getMainContact()
    return form3?.mobile || mainContact?.mobile || mainContact?.phone || exhibitor?.phone || exhibitor?.contact_phone || ''
  }
  
  const getWebsite = () => {
    const form3 = exhibitor?.form3_data_entry
    let website = form3?.website || exhibitor?.website || exhibitor?.company_website || ''
    
    // Ensure URL has proper protocol
    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
      website = 'https://' + website
    }
    
    return website
  }
  
  const getAllContacts = () => {
    return exhibitor?.contacts || []
  }

  // Check if exhibitor is a partner
  const isPartner = () => exhibitor?.is_partner === 1 || exhibitor?.is_partner === true
  const getSponsorshipLevel = () => {
    const eventUser = exhibitor?.event_user || exhibitor
    if (eventUser?.is_platinum_sponsorship === 1 || eventUser?.is_platinum_sponsorship === true) return 'platinum'
    if (eventUser?.gold_sponsorship === 1 || eventUser?.gold_sponsorship === true) return 'gold'
    if (eventUser?.silver_sponsorship === 1 || eventUser?.silver_sponsorship === true) return 'silver'
    return null
  }
  
  const getSponsorConfig = () => {
    const level = getSponsorshipLevel()
    if (!level) return null
    const configs = {
      platinum: { label: 'Platinum', icon: Crown, bg: 'bg-gradient-to-r from-slate-600 to-slate-800', theme: 'slate' },
      gold: { label: 'Gold', icon: Award, bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', theme: 'amber' },
      silver: { label: 'Silver', icon: Star, bg: 'bg-gradient-to-r from-gray-300 to-gray-400', theme: 'gray' },
    }
    return configs[level]
  }

  const sponsorshipConfig = {
    platinum: { label: 'Platinum Sponsor', bg: 'bg-gradient-to-r from-slate-700 to-slate-900', icon: Crown },
    gold: { label: 'Gold Sponsor', bg: 'bg-gradient-to-r from-amber-500 to-yellow-600', icon: Award },
    silver: { label: 'Silver Sponsor', bg: 'bg-gradient-to-r from-gray-400 to-gray-500', icon: Star },
  }

  const getExhibitorUsers = () => {
    const users = []
    
    // Add main user if exists (from exhibitor.user field)
    if (exhibitor?.user && exhibitor.user.id) {
      users.push({
        id: exhibitor.user.id,
        name: `${exhibitor.user.first_name || ''} ${exhibitor.user.last_name || ''}`.trim(),
        email: exhibitor.user.email,
        job_title: exhibitor.user.job_title,
        image: exhibitor.user.image,
        type: 'main_user'
      })
    }

    // Add users from exhibitor_badges if available
    if (exhibitor?.exhibitor_badges && Array.isArray(exhibitor.exhibitor_badges)) {
      exhibitor.exhibitor_badges.forEach(badge => {
        // New API structure: badge_user contains the actual user ID
        if (badge.badge_user && badge.badge_user.id) {
          users.push({
            id: badge.badge_user.id, // This is the actual badge user ID (826, 827, etc.)
            name: `${badge.fnameEN || ''} ${badge.lnameEN || ''}`.trim(),
            email: badge.email,
            job_title: badge.role,
            image: badge.badge_user.image,
            type: 'badge_user'
          })
        }
      })
    }

    // Add users from form3_data_entry if available
    if (exhibitor?.form3_data_entry && Array.isArray(exhibitor.form3_data_entry)) {
      exhibitor.form3_data_entry.forEach(entry => {
        if (entry.user && entry.user.id) {
          users.push({
            id: entry.user.id,
            name: `${entry.user.first_name || ''} ${entry.user.last_name || ''}`.trim(),
            email: entry.user.email,
            job_title: entry.user.job_title,
            image: entry.user.image,
            type: 'form3_user'
          })
        }
      })
    }

    // Remove duplicates by user ID
    const uniqueUsers = users.filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id)
    )

    return uniqueUsers
  }

  // Handler for user selection
  const handleUserSelect = (userId) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  const handleMeetingSubmit = async (e) => {
    e.preventDefault()
    if (!selectedTime) return
    
    // Require user selection if users are available
    if (availableUsers.length > 0 && selectedUserIds.length === 0) {
      setError('Please select at least one user for the meeting request')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    try {
      // Selected IDs are already the correct user IDs (badge_user.id for badges, user.id for others)
      const badgeUserIds = selectedUserIds.length > 0 
        ? selectedUserIds
        : availableUsers.length > 0 
          ? [availableUsers[0].id] 
          : []
      
      // Add visitor_id (auth user) to the user_ids array
      const visitorId = exhibitor?.visitor_id || exhibitor?.user?.id
      const actualUserIds = visitorId ? [visitorId, ...badgeUserIds] : badgeUserIds
      
      // Use scheduleMeeting API with user_ids instead of createSchedule
      const meetingData = {
        user_ids: actualUserIds.length > 0 ? actualUserIds : [parseInt(id)],
        date: selectedDate,
        time: selectedTime,
        message: `BUSINESS MEETING: ${meetingNotes}\n\nDuration: 30 minutes\nRequested by: ${user?.first_name || user?.name || 'User'}\nWith: ${getName()}`
      }

      const response = await scheduleMeeting(meetingData)
      
      if (response.error || !response.success) {
        throw new Error(response.message || 'Failed to create meeting')
      }
      
      // Add to local meetings
      addMeeting({
        id: Date.now(),
        exhibitorId: id,
        exhibitorName: getName(),
        exhibitorBooth: getBooth(),
        exhibitorLogo: getLogo(),
        date: selectedDate,
        time: selectedTime,
        duration: 30,
        notes: meetingNotes,
        status: 'pending',
        type: 'outgoing'
      })
      
      setMeetingSuccess(true)
      setShowMeetingForm(false)
      setSelectedTime('')
      setMeetingNotes('')
      
      // Auto-hide success after 5 seconds
      setTimeout(() => setMeetingSuccess(false), 5000)
    } catch (err) {
      console.error('Failed to create meeting:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (error || !exhibitor) {
    return (
      <>
        <Header title={t('exhibitors')} />
        <div className="p-4 text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">{error || t('noExhibitorsFound')}</p>
          <Link to="/exhibitors" className="text-primary-600 font-medium">
            {t('back')}
          </Link>
        </div>
      </>

    )
  }

  const sponsorConfig = getSponsorConfig()
  const SponsorIcon = sponsorConfig?.icon

  return (
    <>
      <Header 
        title={t('exhibitorDetails')} 
        showBack={true} 
        onBack={() => navigate('/exhibitors')}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Simplified */}
        <div className={clsx(
          "px-4 pt-4 pb-6",
          sponsorConfig ? sponsorConfig.bg : 'bg-gradient-to-br from-primary-500 to-primary-600'
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={getExhibitorLogo()}
                  alt={getName()}
                  className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 object-cover"
                  onError={(e) => { e.target.src = DEFAULT_LOGO }}
                />
                {sponsorConfig && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-white">
                    <SponsorIcon className="w-3 h-3 text-primary-600" />
                  </div>
                )}
                {isPartner() && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <BadgeCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white mb-1">{getName()}</h1>
                {getArabicName() && getArabicName() !== getName() && (
                  <p className="text-white/80 text-sm mb-2" dir="rtl">{getArabicName()}</p>
                )}
                <div className="flex items-center gap-3 text-sm text-white/80">
                  {sponsorConfig && (
                    <span className="flex items-center gap-1">
                      <SponsorIcon className="w-4 h-4" />
                      {t(sponsorConfig.label.toLowerCase() + 'Sponsor')}
                    </span>
                  )}
                  {getBooth() !== 'TBA' && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {getBooth()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleFavorite('exhibitors', exhibitor.id)}
              className="p-2 bg-white/10 rounded-xl border border-white/20"
            >
              <Heart
                className={clsx(
                  'w-5 h-5',
                  isFavorite('exhibitors', exhibitor.id)
                    ? 'fill-red-400 text-red-400'
                    : 'text-white'
                )}
              />
            </button>
          </div>
        </div>

        {/* Meeting Success Alert */}
        {meetingSuccess && (
          <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">{t('meetingRequestSent')}</p>
              <p className="text-sm text-green-700">{t('requestSubmittedTo')} {getName()}.</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Company Profile */}
          {getExhibitorProfile() && (
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary-600" />
                {t('companyProfile')}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {getExhibitorProfile()}
              </p>
            </Card>
          )}
          
          {/* Industries */}
          {getExhibitorIndustries().length > 0 && (
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                {t('industries')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {getExhibitorIndustries().map((industry, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full border border-primary-200 hover:bg-primary-200 transition-colors"
                  >
                    {getLocalizedIndustry(industry, language)}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Location */}
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              {t('location')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-primary-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">{t('hall')}</p>
                <p className="font-bold text-primary-700 text-lg">{getHall()}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">{t('booth')}</p>
                <p className="font-bold text-primary-700 text-sm">{getBooth() !== 'TBA' ? getBooth() : 'TBA'}</p>
              </div>
            </div>
            {getWebsite() && (
              <Button 
                onClick={() => window.open(getWebsite(), '_blank')}
                variant="outline" 
                fullWidth 
                className="mt-4 border-primary-200 text-primary-600 hover:bg-primary-50"
              >
                <Globe className="w-4 h-4 mr-2" />
                {t('visitWebsite')}
              </Button>
            )}
          </Card>

          {/* Products & Services */}
          {getProducts().length > 0 && (
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />
                {t('productsServices')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {getProducts().map((product, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1.5 bg-accent-100 text-accent-700 text-xs font-medium rounded-full border border-accent-200 hover:bg-accent-200 transition-colors"
                  >
                    {typeof product === 'string' ? product : product.name || product.title || 'Product'}
                  </span>
                ))}
              </div>
            </Card>
          )}


          {/* Contact Information */}
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              {t('contactInformation')}
            </h3>
            
            {/* Primary Contact */}
            <div className="space-y-3 mb-4">
              {getEmail() && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('primaryEmail')}</p>
                    <a
                      href={`mailto:${getEmail()}`}
                      className="text-primary-600 hover:text-primary-700 text-sm break-all"
                    >
                      {getEmail()}
                    </a>
                  </div>
                </div>
              )}
              {getPhone() && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('primaryPhone')}</p>
                    <a
                      href={`tel:${getPhone()}`}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      {getPhone()}
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Team Members */}
            {getExhibitorBadges().length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">{t('teamMembers')}</h4>
                <div className="space-y-2">
                  {getExhibitorBadges().map((badge, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm">
                            {badge.fnameEN || ''} {badge.lnameEN || ''}
                          </h5>
                          {badge.role && (
                            <p className="text-xs text-gray-600 mt-1">{badge.role}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Meeting Request - Hide for partners */}
          {user && exhibitor?.event_user?.is_partner !== 1 && (
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                {t('scheduleMeeting')}
              </h3>
              
              {!showMeetingForm ? (
                <Button
                  onClick={() => setShowMeetingForm(true)}
                  fullWidth
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('requestMeeting')}
                </Button>
              ) : (
                <form onSubmit={handleMeetingSubmit} className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectDate')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EVENT_DATES.map(({ date, label }) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setSelectedDate(date)}
                          className={clsx(
                            'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                            selectedDate === date
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* User Selection */}
                  {availableUsers.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('selectUsers')} ({selectedUserIds.length} {t('selected')})
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        {availableUsers.map((user) => (
                          <label
                            key={user.id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={() => handleUserSelect(user.id)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                              {user.image ? (
                                <img
                                  src={user.image.startsWith('http') ? user.image : `https://eventxcrm.com/storage/${user.image}`}
                                  alt={user.name || 'User'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null
                                    e.target.src = '/media/default-user.svg'
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary-100">
                                  <User className="w-5 h-5 text-primary-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {user.name || 'No Name'}
                                </span>
                              </div>
                              {user.job_title && (
                                <p className="text-xs text-gray-500 truncate">
                                  {user.job_title}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                      {availableUsers.length === 0 && (
                        <div className="text-center py-4 text-sm text-amber-600 bg-amber-50 rounded-lg">
                          {t('noUserContactsFound')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectTime')}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={clsx(
                            'py-2 px-2 rounded-lg text-xs font-medium transition-all',
                            selectedTime === time
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          )}
                        >
                          {formatTimeSlot(time)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('message')}</label>
                    <textarea
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                      placeholder={t('whatToDiscuss')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      onClick={() => {
                        setShowMeetingForm(false)
                        setSelectedTime('')
                        setMeetingNotes('')
                      }}
                      disabled={isSubmitting}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      disabled={!selectedTime || isSubmitting}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('sending')}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t('sendRequest')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

export default ExhibitorDetail
