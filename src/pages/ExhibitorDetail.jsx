import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Mail, Phone, Globe, Heart, Calendar, Building2, ArrowLeft, Clock, Users, Package, CheckCircle, Loader2, ChevronDown, Send, Star, Award, Crown, BadgeCheck, Briefcase, User } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import { getExhibitors, createSchedule } from '../services/eventxApi'
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

const ExhibitorDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite, addMeeting } = useApp()
  const { user } = useAuth()
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

  useEffect(() => {
    loadExhibitor()
  }, [id])

  const loadExhibitor = async () => {
    setIsLoading(true)
    try {
      const data = await getExhibitors()
      const exhibitorList = data.data || data.exhibitors || data || []
      const found = exhibitorList.find(e => e.id === parseInt(id))
      setExhibitor(found)
    } catch (err) {
      console.error('Failed to load exhibitor:', err)
      setError('Failed to load exhibitor details')
    } finally {
      setIsLoading(false)
    }
  }

  // Get logo from form3_data_entry or fallback
  const getLogo = () => {
    const form3Logo = exhibitor?.form3_data_entry?.company_logo
    if (form3Logo) return form3Logo
    return exhibitor?.logo_url || exhibitor?.logo || exhibitor?.image || DEFAULT_LOGO
  }
  
  // Get company name - prefer en_name (English) with ar_name (Arabic) fallback
  const getName = () => exhibitor?.en_name || exhibitor?.company_name || exhibitor?.name || exhibitor?.company || 'Unknown'
  const getArabicName = () => exhibitor?.ar_name || ''
  
  // Get sector/industry from form3_data_entry or exhibitor data
  const getSector = () => {
    const form3 = exhibitor?.form3_data_entry
    if (form3?.industries) {
      const industries = Array.isArray(form3.industries) ? form3.industries : [form3.industries]
      return industries.map(i => typeof i === 'string' ? i : i.name || i.en_name).join(', ')
    }
    return exhibitor?.sector || exhibitor?.industry || exhibitor?.category || 'General'
  }
  
  const getDescription = () => exhibitor?.form3_data_entry?.company_description || exhibitor?.description || exhibitor?.about || ''
  const getBooth = () => exhibitor?.booth_number || exhibitor?.booth || 'TBA'
  const getHall = () => exhibitor?.hall || 'TBA'
  const getEmail = () => exhibitor?.email || exhibitor?.contact?.email || exhibitor?.company_email || ''
  const getPhone = () => exhibitor?.phone || exhibitor?.contact?.phone || exhibitor?.mobile || ''
  const getWebsite = () => exhibitor?.form3_data_entry?.website || exhibitor?.website || exhibitor?.contact?.website || exhibitor?.company_website || ''
  const getCountry = () => exhibitor?.country || exhibitor?.form3_data_entry?.country || 'Libya'
  const getTags = () => exhibitor?.tags || exhibitor?.products || []
  const getProducts = () => exhibitor?.form3_data_entry?.products || exhibitor?.products || exhibitor?.services || []
  
  // Get exhibitor badges (users/representatives)
  const getExhibitorBadges = () => exhibitor?.exhibitor_badges || []
  
  // Check if exhibitor is a partner
  const isPartner = () => exhibitor?.is_partner === 1 || exhibitor?.is_partner === true
  
  // Get sponsorship level from events_user
  const getSponsorshipLevel = () => {
    const eventsUser = exhibitor?.events_user || exhibitor
    if (eventsUser?.is_platinum_sponsorship === 1 || eventsUser?.is_platinum_sponsorship === true) return 'platinum'
    if (eventsUser?.gold_sponsorship === 1 || eventsUser?.gold_sponsorship === true) return 'gold'
    if (eventsUser?.silver_sponsorship === 1 || eventsUser?.silver_sponsorship === true) return 'silver'
    return null
  }
  
  const sponsorshipConfig = {
    platinum: { label: 'Platinum Sponsor', bg: 'bg-gradient-to-r from-slate-700 to-slate-900', icon: Crown },
    gold: { label: 'Gold Sponsor', bg: 'bg-gradient-to-r from-amber-500 to-yellow-600', icon: Award },
    silver: { label: 'Silver Sponsor', bg: 'bg-gradient-to-r from-gray-400 to-gray-500', icon: Star },
  }

  const handleMeetingSubmit = async (e) => {
    e.preventDefault()
    if (!selectedTime) return
    
    setIsSubmitting(true)
    try {
      await createSchedule({
        exhibitorId: parseInt(id),
        date: selectedDate,
        time: selectedTime,
        message: meetingNotes
      })
      
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
        <Header title="Exhibitor" />
        <div className="p-4 text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">{error || 'Exhibitor not found'}</p>
          <Link to="/exhibitors" className="text-primary-600 font-medium">
            Back to Exhibitors
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Header 
        title={getName()}
        action={
          <button
            onClick={() => toggleFavorite('exhibitors', exhibitor.id)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart
              className={clsx(
                'w-6 h-6',
                isFavorite('exhibitors', exhibitor.id)
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400'
              )}
            />
          </button>
        }
      />
      <div className="p-4 space-y-4">
        {/* Sponsorship Banner */}
        {getSponsorshipLevel() && (
          <div className={`${sponsorshipConfig[getSponsorshipLevel()].bg} text-white rounded-2xl p-4 flex items-center gap-3`}>
            {(() => {
              const SponsorIcon = sponsorshipConfig[getSponsorshipLevel()].icon
              return <SponsorIcon className="w-8 h-8" />
            })()}
            <div>
              <p className="font-bold text-lg">{sponsorshipConfig[getSponsorshipLevel()].label}</p>
              <p className="text-white/80 text-sm">Official Event Sponsor</p>
            </div>
          </div>
        )}

        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <img
                src={getLogo()}
                alt={getName()}
                className="w-20 h-20 rounded-2xl object-cover bg-gray-100 border-2 border-gray-200"
                onError={(e) => { e.target.src = DEFAULT_LOGO }}
              />
              {isPartner() && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{getName()}</h2>
              {getArabicName() && (
                <p className="text-gray-500 text-sm mb-2" dir="rtl">{getArabicName()}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {isPartner() && (
                  <Badge variant="success" size="sm">
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Partner
                  </Badge>
                )}
                <Badge variant="primary" size="sm">{getSector()}</Badge>
                <Badge size="sm">{getCountry()}</Badge>
              </div>
            </div>
          </div>
          {getDescription() && (
            <p className="text-gray-600 mb-4 leading-relaxed">{getDescription()}</p>
          )}
          {getTags().length > 0 && (
            <div className="flex flex-wrap gap-2">
              {getTags().map((tag, idx) => (
                <Badge key={idx} size="sm">{typeof tag === 'string' ? tag : tag.name}</Badge>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            Location
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-primary-50 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">Hall</p>
              <p className="font-bold text-primary-700 text-lg">{getHall()}</p>
            </div>
            <div className="p-3 bg-accent-50 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">Booth</p>
              <p className="font-bold text-accent-700 text-lg">{getBooth()}</p>
            </div>
          </div>
          <Link to="/floor-plan">
            <Button variant="outline" fullWidth className="mt-4">
              View on Floor Plan
            </Button>
          </Link>
        </Card>

        {/* Products & Services */}
        {getProducts().length > 0 && (
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              Products & Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {getProducts().map((product, idx) => (
                <Badge key={idx} variant="primary" size="sm">
                  {typeof product === 'string' ? product : product.name}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Team Members / Exhibitor Badges */}
        {getExhibitorBadges().length > 0 && (
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Team Members ({getExhibitorBadges().length})
            </h3>
            <div className="space-y-3">
              {getExhibitorBadges().map((badge, idx) => (
                <div key={badge.id || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {(badge.first_name || badge.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {badge.first_name && badge.last_name 
                        ? `${badge.first_name} ${badge.last_name}`
                        : badge.name || 'Team Member'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {badge.job_title && <span>{badge.job_title}</span>}
                      {badge.email && (
                        <span className="truncate text-xs">{badge.email}</span>
                      )}
                    </div>
                  </div>
                  {badge.phone && (
                    <a 
                      href={`tel:${badge.phone}`} 
                      className="p-2 bg-primary-100 rounded-lg text-primary-600 hover:bg-primary-200 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {(getEmail() || getPhone() || getWebsite()) && (
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3">Contact Information</h3>
            <div className="space-y-3">
              {getEmail() && (
                <a href={`mailto:${getEmail()}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
                  <Mail className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-900 truncate">{getEmail()}</span>
                </a>
              )}
              {getPhone() && (
                <a href={`tel:${getPhone()}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
                  <Phone className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-900">{getPhone()}</span>
                </a>
              )}
              {getWebsite() && (
                <a href={getWebsite().startsWith('http') ? getWebsite() : `https://${getWebsite()}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
                  <Globe className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-900 truncate">{getWebsite()}</span>
                </a>
              )}
            </div>
          </Card>
        )}

        {/* Meeting Success Message */}
        {meetingSuccess && (
          <Card className="p-4 bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Meeting request sent!</p>
                <p className="text-green-700 text-sm">You'll be notified when {getName()} responds.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Meeting Booking */}
        <Card className="p-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Schedule a Meeting
          </h3>
          
          {!showMeetingForm ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Request a 30-minute meeting with {getName()} during Libya Build 2026.
              </p>
              <Button fullWidth onClick={() => setShowMeetingForm(true)} icon={Calendar}>
                Book Meeting Slot
              </Button>
            </div>
          ) : (
            <form onSubmit={handleMeetingSubmit} className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <div className="grid grid-cols-4 gap-2">
                  {EVENT_DATES.map(({ date, label }) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDate === date
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time (10 AM - 5 PM)</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {formatTimeSlot(time)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="What would you like to discuss?"
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  fullWidth 
                  disabled={!selectedTime || isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-1" />Sending...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-1" />Send Request</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Other Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/meetings">
            <Button variant="outline" fullWidth icon={Calendar}>
              View Meetings
            </Button>
          </Link>
          <Link to="/business-cards">
            <Button fullWidth>
              Exchange Card
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default ExhibitorDetail
