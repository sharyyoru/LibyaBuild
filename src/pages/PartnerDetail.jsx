import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Mail, Phone, Globe, Heart, Calendar, Building2, ArrowLeft, Clock, Users, Package, CheckCircle, Loader2, ChevronDown, Send, Star, Award, Crown, BadgeCheck, Briefcase, User, Shield } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import { getPartner, scheduleMeeting } from '../services/eventxApi'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
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

const PartnerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite, addMeeting } = useApp()
  const { user } = useAuth()
  const [partner, setPartner] = useState(null)
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
      loadPartner()
    }
  }, [id])

  // Load available users when partner is loaded
  useEffect(() => {
    if (partner) {
      const users = getPartnerUsers()
      setAvailableUsers(users)
      setSelectedUserIds([]) // Reset selection when partner changes
    }
  }, [partner])

  const loadPartner = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getPartner(id)
      // Handle API response structure - data is an array
      const dataArray = response.data || []
      const partnerData = Array.isArray(dataArray) ? dataArray.find(p => p.id == id) || dataArray[0] : dataArray
      
      if (partnerData) {
        setPartner(partnerData)
      } else {
        setError('Partner not found')
      }
    } catch (err) {
      console.error('Failed to load partner:', err)
      setError('Failed to load partner details')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions to get partner data
  const getPartnerLogo = () => {
    // Priority 1: Check form3_data_entry[0].company_logo
    const form3Data = partner?.form3_data_entry?.[0]
    const form3Logo = form3Data?.company_logo
    if (form3Logo && typeof form3Logo === 'string' && form3Logo.trim() && form3Logo !== 'null') {
      const logoPath = form3Logo.trim()
      if (logoPath.startsWith('http')) {
        return logoPath
      }
      return `https://eventxtest.fxunlock.com/storage/${logoPath}`
    }
    
    // Priority 2: Check root logo field
    const rootLogo = partner?.logo
    if (rootLogo && typeof rootLogo === 'string' && rootLogo.trim() && rootLogo !== 'null') {
      const logoPath = rootLogo.trim()
      if (logoPath.startsWith('http')) {
        return logoPath
      }
      return `https://eventxtest.fxunlock.com/storage/${logoPath}`
    }
    
    // Priority 3: Check other logo fields
    const alternativeLogos = [
      partner?.logo_url,
      partner?.image,
      partner?.company_logo
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
    
    return DEFAULT_LOGO
  }

  const getPartnerName = () => {
    const form3Data = partner?.form3_data_entry?.[0]
    return form3Data?.company || partner?.en_name || partner?.company_name || partner?.name || 'Partner'
  }
  
  const getPartnerArabicName = () => {
    const form3Data = partner?.form3_data_entry?.[0]
    return form3Data?.ar_company || partner?.ar_name || ''
  }
  
  const getPartnerCountry = () => {
    const form3Data = partner?.form3_data_entry?.[0]
    return form3Data?.country || partner?.country || partner?.location || 'Libya'
  }
  
  const getPartnerSector = () => {
    const form3Data = partner?.form3_data_entry?.[0]
    if (form3Data?.company_industries?.length > 0) {
      return form3Data.company_industries[0].name || form3Data.company_industries[0].en_name || 'General'
    }
    return partner?.sector || partner?.industry || partner?.category || 'General'
  }
  
  const getPartnerIndustries = () => {
    const form3Data = partner?.form3_data_entry?.[0]
    return form3Data?.company_industries || []
  }
  
  const getPartnerDescription = () => {
    const form3Data = partner?.form3_data_entry?.[0]
    return form3Data?.company_profile || partner?.description || partner?.about || partner?.company_description || ''
  }
  
  const getPartnerBooth = () => {
    const form3Data = partner?.form3_data_entry?.[0]
    const standNo = form3Data?.stand_no || partner?.event_user?.stand_no
    if (standNo) {
      return standNo
    }
    if (partner?.booth_number && partner?.hall) {
      return `${partner.hall} - ${partner.booth_number}`
    }
    return partner?.booth_number || partner?.booth || partner?.stand || 'TBA'
  }
  const getTags = () => partner?.tags || []
  const getProducts = () => {
    const form3Data = partner?.form3_data_entry?.[0]
    return form3Data?.products || partner?.products || []
  }
  const getPartnerBadges = () => partner?.partner_badges || []
  
  const getMainContact = () => {
    return partner?.contacts?.find(contact => contact.contact_type === 'main_contact') || partner?.contacts?.[0]
  }
  
  const getEmail = () => {
    const form3Data = partner?.form3_data_entry?.[0]
    const mainContact = getMainContact()
    return form3Data?.email || mainContact?.email || partner?.email || partner?.contact_email || ''
  }
  
  const getPhone = () => {
    const form3Data = partner?.form3_data_entry?.[0]
    const mainContact = getMainContact()
    return form3Data?.mobile || mainContact?.mobile || mainContact?.phone || partner?.phone || partner?.contact_phone || ''
  }
  
  const getWebsite = () => {
    const form3Data = partner?.form3_data_entry?.[0]
    return form3Data?.website || partner?.website || partner?.company_website || ''
  }
  
  const getAllContacts = () => {
    return partner?.contacts || []
  }

  // Check if partner is official
  const isOfficialPartner = () => partner?.is_partner === 1 || partner?.is_partner === true

  const getPartnerUsers = () => {
    const users = []
    
    // Add main user if exists (from partner.user field)
    if (partner?.user && partner.user.id) {
      users.push({
        id: partner.user.id, // This is the actual user ID we need
        name: `${partner.user.first_name || ''} ${partner.user.last_name || ''}`.trim(),
        email: partner.user.email,
        job_title: partner.user.job_title,
        type: 'main_user'
      })
    }

    // Add users from exhibitor_badges if available
    if (partner?.exhibitor_badges && Array.isArray(partner.exhibitor_badges)) {
      partner.exhibitor_badges.forEach(badge => {
        if (badge.user && badge.user.id) {
          users.push({
            id: badge.user.id, // This is the actual user ID we need
            name: `${badge.user.first_name || ''} ${badge.user.last_name || ''}`.trim(),
            email: badge.user.email,
            job_title: badge.user.job_title,
            type: 'badge_user'
          })
        }
      })
    }

    // Add users from form3_data_entry if available (this is where the actual users are)
    if (partner?.form3_data_entry && Array.isArray(partner.form3_data_entry)) {
      partner.form3_data_entry.forEach(entry => {
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
      // Use selected users or fallback if no users available
      const userIds = selectedUserIds.length > 0 ? selectedUserIds : 
                     availableUsers.length > 0 ? [availableUsers[0].id] : [partner.id]

      // Use scheduleMeeting API with user_ids instead of createSchedule
      const meetingData = {
        user_ids: userIds,
        date: selectedDate,
        time: selectedTime,
        message: `PARTNERSHIP MEETING: ${meetingPurpose || 'Partnership discussion'}\n\nDuration: 30 minutes\nRequested by: ${user?.first_name || user?.name || 'User'}\nWith: ${getPartnerName()}`
      }

      const response = await scheduleMeeting(meetingData)
      
      if (response.error || !response.success) {
        throw new Error(response.message || 'Failed to create meeting')
      }
      
      // Add to local state for immediate UI feedback
      addMeeting({
        id: Date.now(),
        partner_id: partner.id,
        partner_name: getPartnerName(),
        date: selectedDate,
        time: selectedTime,
        purpose: meetingPurpose || 'Partnership discussion',
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading partner details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Partner Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => navigate('/partners')}
            variant="primary"
          >
            Back to Partners
          </Button>
        </div>
      </div>
    )
  }

  if (!partner) {
    return null
  }

  return (
    <>
      <Header 
        title="Partner Details" 
        showBack={true} 
        onBack={() => navigate('/partners')}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Simplified */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={getPartnerLogo()}
                  alt={getPartnerName()}
                  className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 object-cover"
                  onError={(e) => { e.target.src = DEFAULT_LOGO }}
                />
                {isOfficialPartner() && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <BadgeCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white mb-1">{getPartnerName()}</h1>
                {getPartnerArabicName() && getPartnerArabicName() !== getPartnerName() && (
                  <p className="text-purple-100 text-sm mb-2" dir="rtl">{getPartnerArabicName()}</p>
                )}
                <div className="flex items-center gap-3 text-sm text-purple-100">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Official Partner
                  </span>
                  {getPartnerBooth() !== 'TBA' && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {getPartnerBooth()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleFavorite('partners', partner.id)}
              className="p-2 bg-white/10 rounded-xl border border-white/20"
            >
              <Heart
                className={clsx(
                  'w-5 h-5',
                  isFavorite('partners', partner.id)
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
              <p className="text-sm text-green-700">Your meeting request has been submitted to {getPartnerName()}.</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Company Profile */}
          {getPartnerDescription() && (
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                Company Profile
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {getPartnerDescription()}
              </p>
            </Card>
          )}
          
          {/* Industries */}
          {getPartnerIndustries().length > 0 && (
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Industries
              </h3>
              <div className="flex flex-wrap gap-2">
                {getPartnerIndustries().map((industry, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200 hover:bg-purple-200 transition-colors"
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
              <MapPin className="w-5 h-5 text-purple-600" />
              Location
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-purple-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">Stand</p>
                <p className="font-bold text-purple-700 text-lg">{getPartnerBooth() !== 'TBA' ? getPartnerBooth() : 'TBA'}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">Country</p>
                <p className="font-bold text-purple-700 text-sm">{getPartnerCountry()}</p>
              </div>
            </div>
            {getWebsite() && (
              <Button 
                onClick={() => window.open(getWebsite(), '_blank')}
                variant="outline" 
                fullWidth 
                className="mt-4 border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <Globe className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            )}
          </Card>

              {/* Contact Information */}
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Contact Information
            </h3>
            
            {/* Primary Contact */}
            <div className="space-y-3 mb-4">
              {getEmail() && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Primary Email</p>
                    <a
                      href={`mailto:${getEmail()}`}
                      className="text-purple-600 hover:text-purple-700 text-sm break-all"
                    >
                      {getEmail()}
                    </a>
                  </div>
                </div>
              )}
              {getPhone() && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Primary Phone</p>
                    <a
                      href={`tel:${getPhone()}`}
                      className="text-purple-600 hover:text-purple-700 text-sm"
                    >
                      {getPhone()}
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* All Contacts */}
            {getAllContacts().length > 1 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">All Team Contacts</h4>
                <div className="space-y-2">
                  {getAllContacts().map((contact, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900 text-sm">
                          {contact.first_name} {contact.last_name}
                        </h5>
                        <Badge variant="outline" size="sm" className="text-xs">
                          {contact.contact_type?.replace('_', ' ')}
                        </Badge>
                      </div>
                      {contact.job_title && (
                        <p className="text-xs text-gray-600 mb-2">{contact.job_title}</p>
                      )}
                      <div className="space-y-1 text-xs">
                        {contact.email && (
                          <p className="text-purple-600 hover:text-purple-700">
                            <a href={`mailto:${contact.email}`}>{contact.email}</a>
                          </p>
                        )}
                        {contact.phone && (
                          <p className="text-gray-600">
                            <a href={`tel:${contact.phone}`} className="hover:text-purple-600">
                              {contact.phone}
                            </a>
                          </p>
                        )}
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
                <Calendar className="w-5 h-5 text-purple-600" />
                Schedule Meeting
              </h3>
              
              {!showMeetingForm ? (
                <Button
                  onClick={() => setShowMeetingForm(true)}
                  fullWidth
                  className="bg-purple-600 hover:bg-purple-700"
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
                              ? 'bg-purple-600 text-white'
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
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {user.name || 'No Name'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email} • {user.job_title || 'No Title'}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {availableUsers.length === 0 && (
                        <div className="text-center py-4 text-sm text-amber-600 bg-amber-50 rounded-lg">
                          No user contacts found for this partner.
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
                              ? 'bg-purple-600 text-white'
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
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
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
                      className="bg-purple-600 hover:bg-purple-700"
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

          {/* Other Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/partners">
              <Button variant="outline" fullWidth className="border-purple-200 text-purple-600 hover:bg-purple-50">
                <Users className="w-4 h-4 mr-2" />
                All Partners
              </Button>
            </Link>
            <Button fullWidth className="bg-purple-600 hover:bg-purple-700">
              <User className="w-4 h-4 mr-2" />
              Exchange Card
            </Button>
          </div>
        </div>

      </div>
    </>
  )
}

export default PartnerDetail
