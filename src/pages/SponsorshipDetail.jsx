import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Mail, Phone, Globe, Heart, Calendar, Building2, ArrowLeft, Clock, Users, Package, CheckCircle, Loader2, ChevronDown, Send, Star, Award, Crown, BadgeCheck, Briefcase, User } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { getLocalizedName, getLocalizedProfile } from '../utils/localization'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import { getExhibitors, scheduleMeeting } from '../services/eventxApi'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { clsx } from 'clsx'

const DEFAULT_LOGO = '/media/default-company.svg'

// Sponsorship configurations
const SPONSOR_CONFIG = {
  platinum: { label: 'Platinum', icon: Crown, bg: 'bg-gradient-to-r from-slate-600 to-slate-800', text: 'text-white', theme: 'slate' },
  gold: { label: 'Gold', icon: Award, bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', text: 'text-amber-900', theme: 'primary' },
  silver: { label: 'Silver', icon: Star, bg: 'bg-gradient-to-r from-gray-300 to-gray-400', text: 'text-gray-800', theme: 'gray' },
}

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

const SponsorshipDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite, addMeeting } = useApp()
  const { user } = useAuth()
  const { language } = useLanguage()
  const [sponsor, setSponsor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Meeting scheduling state
  const [showMeetingForm, setShowMeetingForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(EVENT_DATES[0].date)
  const [selectedTime, setSelectedTime] = useState('')
  const [meetingPurpose, setMeetingPurpose] = useState('')
  const [isSubmittingMeeting, setIsSubmittingMeeting] = useState(false)
  const [meetingSuccess, setMeetingSuccess] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])

  useEffect(() => {
    if (id) {
      loadSponsor()
    }
  }, [id])

  // Load available users when sponsor is loaded
  useEffect(() => {
    if (sponsor) {
      const users = getSponsorUsers()
      setAvailableUsers(users)
      setSelectedUserIds([]) // Reset selection when sponsor changes
    }
  }, [sponsor])

  const loadSponsor = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getExhibitors()
      const exhibitorList = response.data || response.exhibitors || response || []
      const allExhibitors = Array.isArray(exhibitorList) ? exhibitorList : []
      
      // Find sponsor by ID and ensure it has sponsorship flags
      const sponsorData = allExhibitors.find(exhibitor => {
        const eventUser = exhibitor?.event_user || exhibitor
        const isThisId = exhibitor.id == id
        const isThisSponsor = eventUser?.is_platinum_sponsorship === 1 || 
                             eventUser?.gold_sponsorship === 1 || 
                             eventUser?.silver_sponsorship === 1
        return isThisId && isThisSponsor
      })
      
      if (sponsorData) {
        setSponsor(sponsorData)
      } else {
        setError('Sponsor not found')
      }
    } catch (err) {
      console.error('Failed to load sponsor:', err)
      setError('Failed to load sponsor details')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions to get sponsor data
  const getSponsorLogo = () => {
    const form3Logo = sponsor?.form3_data_entry?.company_logo
    if (form3Logo && typeof form3Logo === 'string' && form3Logo.trim() && form3Logo !== 'null') {
      const logoPath = form3Logo.trim()
      if (logoPath.startsWith('http')) {
        return logoPath
      }
      return `https://eventxcrm.com/storage/${logoPath}`
    }
    
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
    
    return DEFAULT_LOGO
  }

  const getSponsorName = () => getLocalizedName(sponsor, language)
  const getSponsorArabicName = () => sponsor?.ar_name || ''
  const getSponsorCountry = () => sponsor?.country || sponsor?.form3_data_entry?.country || sponsor?.location || 'Libya'
  const getSponsorSector = () => {
    // Check direct company_industries from API response first
    if (sponsor?.company_industries?.length > 0) {
      return sponsor.company_industries[0].name || sponsor.company_industries[0].en_name || 'General'
    }
    
    // Fallback to form3_data_entry (it's an array!)
    const form3Array = sponsor?.form3_data_entry
    if (Array.isArray(form3Array) && form3Array.length > 0) {
      for (const form3 of form3Array) {
        if (form3?.company_industries?.length > 0) {
          return form3.company_industries[0].name || form3.company_industries[0].en_name || 'General'
        }
      }
    }
    
    return sponsor?.sector || sponsor?.industry || sponsor?.category || 'General'
  }

  const getSponsorIndustries = () => {
    // Check direct company_industries from API response first
    if (sponsor?.company_industries?.length > 0) {
      return sponsor.company_industries
    }
    
    // Fallback to form3_data_entry (it's an array - use first entry only, max 5 industries)
    const form3Array = sponsor?.form3_data_entry
    if (Array.isArray(form3Array) && form3Array.length > 0) {
      const firstForm3 = form3Array[0]
      if (firstForm3?.company_industries?.length > 0) {
        return firstForm3.company_industries
      }
    }
    
    return []
  }

  const getSponsorProfile = () => getLocalizedProfile(sponsor, language)

  const getSponsorDescription = () => sponsor?.form3_data_entry?.company_description || sponsor?.description || sponsor?.about || sponsor?.company_description || ''
  const getSponsorBooth = () => {
    if (sponsor?.booth_number && sponsor?.hall) {
      return `${sponsor.hall} - ${sponsor.booth_number}`
    }
    return sponsor?.booth_number || sponsor?.booth || sponsor?.stand || 'TBA'
  }

  const getMainContact = () => {
    return sponsor?.contacts?.find(contact => contact.contact_type === 'main_contact') || sponsor?.contacts?.[0]
  }

  const getEmail = () => {
    const mainContact = getMainContact()
    return mainContact?.email || sponsor?.email || sponsor?.contact_email || ''
  }

  const getPhone = () => {
    const mainContact = getMainContact()
    return mainContact?.mobile || mainContact?.phone || sponsor?.phone || sponsor?.contact_phone || ''
  }

  const getWebsite = () => sponsor?.website || sponsor?.company_website || ''

  const getAllContacts = () => sponsor?.contacts || []
  const getExhibitorBadges = () => sponsor?.exhibitor_badges || []

  // Get sponsorship level
  const getSponsorshipLevel = () => {
    const eventUser = sponsor?.event_user || sponsor
    if (eventUser?.is_platinum_sponsorship === 1 || eventUser?.is_platinum_sponsorship === true) return 'platinum'
    if (eventUser?.gold_sponsorship === 1 || eventUser?.gold_sponsorship === true) return 'gold'
    if (eventUser?.silver_sponsorship === 1 || eventUser?.silver_sponsorship === true) return 'silver'
    return null
  }

  const getSponsorConfig = () => {
    const level = getSponsorshipLevel()
    return level ? SPONSOR_CONFIG[level] : null
  }

  // Check if partner
  const isPartner = () => sponsor?.is_partner === 1 || sponsor?.is_partner === true

  const getSponsorUsers = () => {
    const users = []
    
    // Add main user if exists (from sponsor.user field)
    if (sponsor?.user && sponsor.user.id) {
      users.push({
        id: sponsor.user.id, // This is the actual user ID we need
        name: `${sponsor.user.first_name || ''} ${sponsor.user.last_name || ''}`.trim(),
        email: sponsor.user.email,
        job_title: sponsor.user.job_title,
        type: 'main_user'
      })
    }

    // Add users from exhibitor_badges if available
    if (sponsor?.exhibitor_badges && Array.isArray(sponsor.exhibitor_badges)) {
      sponsor.exhibitor_badges.forEach(badge => {
        // New API structure: badge_user contains the actual user ID
        if (badge.badge_user && badge.badge_user.id) {
          users.push({
            id: badge.badge_user.id, // This is the actual badge user ID (826, 827, etc.)
            name: `${badge.fnameEN || ''} ${badge.lnameEN || ''}`.trim(),
            email: badge.email,
            job_title: badge.role,
            type: 'badge_user'
          })
        }
      })
    }

    // Add users from form3_data_entry if available (this is where the actual users are)
    if (sponsor?.form3_data_entry && Array.isArray(sponsor.form3_data_entry)) {
      sponsor.form3_data_entry.forEach(entry => {
        if (entry.user && entry.user.id) {
          users.push({
            id: entry.user.id, // This is the actual user ID we need
            name: `${entry.user.first_name || ''} ${entry.user.last_name || ''}`.trim(),
            email: entry.user.email,
            job_title: entry.user.job_title,
            type: 'form3_user'
          })
        }
      })
    }

    // Remove duplicates by user ID (not email)
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

    setIsSubmittingMeeting(true)
    setError('')
    try {
      // Selected IDs are already the correct user IDs (badge_user.id for badges, user.id for others)
      const badgeUserIds = selectedUserIds.length > 0 
        ? selectedUserIds
        : availableUsers.length > 0 
          ? [availableUsers[0].id] 
          : []

      // Add visitor_id (auth user) to the user_ids array
      const visitorId = sponsor?.visitor_id || sponsor?.user?.id
      const actualUserIds = visitorId ? [visitorId, ...badgeUserIds] : badgeUserIds

      // Use scheduleMeeting API with user_ids instead of createSchedule
      const meetingData = {
        user_ids: actualUserIds.length > 0 ? actualUserIds : [sponsor.id],
        date: selectedDate,
        time: selectedTime,
        message: `SPONSORSHIP MEETING: ${meetingPurpose || 'Sponsorship discussion'}\n\nDuration: 30 minutes\nRequested by: ${user?.first_name || user?.name || 'User'}\nWith: ${getSponsorName()}`
      }

      const response = await scheduleMeeting(meetingData)
      
      if (response.error || !response.success) {
        throw new Error(response.message || 'Failed to create meeting')
      }
      
      addMeeting({
        id: Date.now(),
        exhibitor_id: sponsor.id,
        exhibitor_name: getSponsorName(),
        date: selectedDate,
        time: selectedTime,
        purpose: meetingPurpose || 'Sponsorship discussion',
        status: 'pending'
      })

      setMeetingSuccess(true)
      setShowMeetingForm(false)
      setMeetingPurpose('')
      setSelectedTime('')
      
      setTimeout(() => setMeetingSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to schedule meeting:', err)
    } finally {
      setIsSubmittingMeeting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center animate-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading sponsor details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
            <Crown className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sponsor Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => navigate('/sponsorships')}
            variant="primary"
          >
            Back to Sponsors
          </Button>
        </div>
      </div>
    )
  }

  if (!sponsor) {
    return null
  }

  const sponsorConfig = getSponsorConfig()
  const SponsorIcon = sponsorConfig?.icon || Crown

  return (
    <>
      <Header 
        title="Sponsor Details" 
        showBack={true} 
        onBack={() => navigate('/sponsorships')}
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
                  src={getSponsorLogo()}
                  alt={getSponsorName()}
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
                <h1 className="text-xl font-bold text-white mb-1">{getSponsorName()}</h1>
                {getSponsorArabicName() && getSponsorArabicName() !== getSponsorName() && (
                  <p className="text-white/80 text-sm mb-2" dir="rtl">{getSponsorArabicName()}</p>
                )}
                <div className="flex items-center gap-3 text-sm text-white/80">
                  {sponsorConfig && (
                    <span className="flex items-center gap-1">
                      <SponsorIcon className="w-4 h-4" />
                      {sponsorConfig.label} Sponsor
                    </span>
                  )}
                  {getSponsorBooth() !== 'TBA' && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {getSponsorBooth()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleFavorite('exhibitors', sponsor.id)}
              className="p-2 bg-white/10 rounded-xl border border-white/20"
            >
              <Heart
                className={clsx(
                  'w-5 h-5',
                  isFavorite('exhibitors', sponsor.id)
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
              <p className="font-semibold text-green-900">Meeting Request Sent!</p>
              <p className="text-sm text-green-700">Your meeting request has been submitted to {getSponsorName()}.</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Company Profile */}
          {getSponsorProfile() && (
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary-600" />
                Company Profile
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {getSponsorProfile()}
              </p>
            </Card>
          )}
          
          {/* Industries */}
          {getSponsorIndustries().length > 0 && (
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                Industries
              </h3>
              <div className="flex flex-wrap gap-2">
                {getSponsorIndustries().map((industry, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full border border-primary-200 hover:bg-primary-200 transition-colors"
                  >
                    {industry.name || industry.en_name || 'Industry'}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Location */}
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              Location
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-primary-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">Booth</p>
                <p className="font-bold text-primary-700 text-lg">{getSponsorBooth() !== 'TBA' ? getSponsorBooth() : 'TBA'}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">Country</p>
                <p className="font-bold text-primary-700 text-sm">{getSponsorCountry()}</p>
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
                Visit Website
              </Button>
            )}
          </Card>

          {/* Contact Information */}
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Contact Information
            </h3>
            
            {/* Primary Contact */}
            <div className="space-y-3 mb-4">
              {getEmail() && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Primary Email</p>
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
                    <p className="text-sm font-medium text-gray-900">Primary Phone</p>
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
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Team Members</h4>
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

          {/* Meeting Request */}
          {user && (
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Schedule Meeting
              </h3>
              
              {!showMeetingForm ? (
                <Button
                  onClick={() => setShowMeetingForm(true)}
                  fullWidth
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Request Meeting
                </Button>
              ) : (
                <form onSubmit={handleMeetingSubmit} className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
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
                        Select Users ({selectedUserIds.length} selected)
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
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-400" />
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
                        <div className="text-center py-4 text-sm text-primary-600 bg-primary-50 rounded-lg">
                          No user contacts found for this sponsor.
                          You may still request a meeting, but it will be sent to the company directly.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
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

                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Purpose</label>
                    <textarea
                      value={meetingPurpose}
                      onChange={(e) => setMeetingPurpose(e.target.value)}
                      placeholder="Describe the purpose of your meeting..."
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
                        setMeetingPurpose('')
                      }}
                      disabled={isSubmittingMeeting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      disabled={!selectedTime || isSubmittingMeeting}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      {isSubmittingMeeting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Request
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

export default SponsorshipDetail
