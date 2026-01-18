import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Calendar, Clock, Building2, CheckCircle, XCircle, Loader2, User, Briefcase, Bell, ChevronDown, CalendarDays, Plus, LayoutList, LayoutGrid, MapPin, Users, Send } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { getExhibitors } from '../services/eventxApi'
import { fetchMeetings, createMeeting, updateMeetingStatus } from '../lib/supabase'
import { format, addMinutes, isAfter, isBefore, parseISO, isToday, isTomorrow } from 'date-fns'
import { clsx } from 'clsx'

// Event dates: April 20-23, 2026
const EVENT_DAYS = [
  { date: '2026-04-20', label: 'Day 1', day: '20', month: 'Apr' },
  { date: '2026-04-21', label: 'Day 2', day: '21', month: 'Apr' },
  { date: '2026-04-22', label: 'Day 3', day: '22', month: 'Apr' },
  { date: '2026-04-23', label: 'Day 4', day: '23', month: 'Apr' },
]

// Time slots: 10:00 AM to 5:00 PM, 30-minute intervals
const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30'
]

const formatTimeSlot = (time) => {
  if (!time) return 'TBA'
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

// Status configurations
const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
  confirmed: { label: 'Confirmed', color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
  rejected: { label: 'Declined', color: 'from-red-500 to-rose-600', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'from-gray-400 to-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', icon: XCircle },
}

const DEFAULT_LOGO = '/media/default-company.svg'

const MeetingScheduler = () => {
  const [searchParams] = useSearchParams()
  const preselectedExhibitor = searchParams.get('exhibitor')
  
  const { meetings: localMeetings, addMeeting, updateMeeting } = useApp()
  const { user } = useAuth()
  const [exhibitors, setExhibitors] = useState([])
  const [meetings, setMeetings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(!!preselectedExhibitor)
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeDay, setActiveDay] = useState('all')
  const [viewMode, setViewMode] = useState('visitor') // 'visitor' or 'exhibitor'
  const [displayMode, setDisplayMode] = useState('list') // 'list' or 'compact'
  
  const [formData, setFormData] = useState({
    exhibitorId: preselectedExhibitor || '',
    date: EVENT_DAYS[0].date,
    time: '',
    notes: ''
  })

  // Check if user is an exhibitor
  const isExhibitor = user?.user_level === 'exhibitor' || user?.is_exhibitor || user?.type === 'exhibitor'

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Set up reminder checks every minute
    const reminderInterval = setInterval(checkReminders, 60000)
    return () => clearInterval(reminderInterval)
  }, [meetings])

  const checkReminders = () => {
    const now = new Date()
    meetings.forEach(meeting => {
      if (meeting.status === 'approved' || meeting.status === 'confirmed') {
        const meetingTime = parseISO(`${meeting.date}T${meeting.time}`)
        const reminderTime = addMinutes(meetingTime, -15)
        
        if (isAfter(now, reminderTime) && isBefore(now, meetingTime)) {
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('Meeting Reminder', {
              body: `Your meeting with ${meeting.exhibitorName || meeting.visitorName} starts in 15 minutes!`,
              icon: '/media/App Icons-14.svg'
            })
          }
        }
      }
    })
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load exhibitors from API
      const exhibitorsData = await getExhibitors()
      const exhibitorList = exhibitorsData.data || exhibitorsData.exhibitors || exhibitorsData || []
      setExhibitors(Array.isArray(exhibitorList) ? exhibitorList : [])
      
      // Load meetings from Supabase
      const userId = user?.id || user?.user_id
      if (userId) {
        const { data: meetingsData, error } = await fetchMeetings(userId)
        if (!error && meetingsData) {
          setMeetings(meetingsData)
        } else {
          // Fallback to local meetings
          setMeetings(localMeetings)
        }
      } else {
        setMeetings(localMeetings)
      }
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      setMeetings(localMeetings)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    
    try {
      const exhibitor = exhibitors.find(ex => ex.id === parseInt(formData.exhibitorId))
      const userId = user?.id || user?.user_id
      
      const meetingData = {
        visitor_id: userId,
        exhibitor_id: parseInt(formData.exhibitorId),
        exhibitor_name: exhibitor?.en_name || exhibitor?.company_name || exhibitor?.name || 'Exhibitor',
        exhibitor_booth: exhibitor?.booth_number || exhibitor?.booth || 'TBA',
        exhibitor_logo: exhibitor?.form3_data_entry?.company_logo || exhibitor?.logo_url || exhibitor?.logo,
        visitor_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email,
        visitor_company: user?.company || '',
        date: formData.date,
        time: formData.time,
        duration: 30,
        notes: formData.notes,
        type: 'outgoing'
      }
      
      // Create in Supabase
      const { data: createdMeeting, error: createError } = await createMeeting(meetingData)
      
      if (createError) {
        throw new Error(createError.message || 'Failed to create meeting')
      }
      
      // Also add to local state
      const newMeeting = createdMeeting || {
        id: Date.now(),
        ...meetingData,
        status: 'pending'
      }
      
      setMeetings(prev => [...prev, newMeeting])
      addMeeting(newMeeting)
      
      setSuccess('Meeting request sent! You will be notified when the exhibitor responds.')
      setFormData({ exhibitorId: '', date: EVENT_DAYS[0].date, time: '', notes: '' })
      setShowForm(false)
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Meeting Requested', {
          body: `Your meeting request with ${meetingData.exhibitor_name} has been sent!`,
          icon: '/media/App Icons-14.svg'
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to create meeting request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async (meetingId) => {
    try {
      await updateMeetingStatus(meetingId, 'approved')
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, status: 'approved' } : m
      ))
      updateMeeting(meetingId, { status: 'approved' })
      setSuccess('Meeting approved! The visitor has been notified.')
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const meeting = meetings.find(m => m.id === meetingId)
        new Notification('Meeting Approved', {
          body: `Meeting with ${meeting?.visitor_name || 'visitor'} has been approved!`,
          icon: '/media/App Icons-14.svg'
        })
      }
    } catch (err) {
      console.error('Failed to approve meeting:', err)
      // Update locally anyway
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, status: 'approved' } : m
      ))
      updateMeeting(meetingId, { status: 'approved' })
    }
  }

  const handleReject = async (meetingId) => {
    try {
      await updateMeetingStatus(meetingId, 'rejected')
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, status: 'rejected' } : m
      ))
      updateMeeting(meetingId, { status: 'rejected' })
    } catch (err) {
      console.error('Failed to reject meeting:', err)
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, status: 'rejected' } : m
      ))
      updateMeeting(meetingId, { status: 'rejected' })
    }
  }

  const handleCancel = async (meetingId) => {
    try {
      await updateMeetingStatus(meetingId, 'cancelled')
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, status: 'cancelled' } : m
      ))
      updateMeeting(meetingId, { status: 'cancelled' })
    } catch (err) {
      console.error('Failed to cancel meeting:', err)
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, status: 'cancelled' } : m
      ))
      updateMeeting(meetingId, { status: 'cancelled' })
    }
  }

  const getExhibitorName = (ex) => ex.en_name || ex.company_name || ex.name || 'Unknown'
  const getExhibitorBooth = (ex) => ex.booth_number || ex.booth || 'TBA'
  
  // Helper to get meeting fields (supports both camelCase and snake_case)
  const getMeetingField = (meeting, field) => {
    const camelCase = field
    const snakeCase = field.replace(/([A-Z])/g, '_$1').toLowerCase()
    return meeting[camelCase] || meeting[snakeCase] || ''
  }


  // Filter meetings based on active filter
  const filteredMeetings = meetings.filter(m => {
    if (activeFilter === 'all') return true
    return m.status === activeFilter
  })

  // Separate incoming (for exhibitors) and outgoing (for visitors) meetings
  const incomingMeetings = filteredMeetings.filter(m => m.type === 'incoming' || isExhibitor)
  const outgoingMeetings = filteredMeetings.filter(m => m.type === 'outgoing' || !isExhibitor)

  const filterCounts = {
    all: meetings.length,
    pending: meetings.filter(m => m.status === 'pending').length,
    approved: meetings.filter(m => m.status === 'approved' || m.status === 'confirmed').length,
    cancelled: meetings.filter(m => m.status === 'cancelled' || m.status === 'rejected').length,
  }

  // Format date label
  const formatDateLabel = (dateStr) => {
    try {
      const date = parseISO(dateStr)
      if (isToday(date)) return 'Today'
      if (isTomorrow(date)) return 'Tomorrow'
      return format(date, 'EEEE, MMM d')
    } catch {
      return dateStr
    }
  }

  // Filter by day
  const dayFilteredMeetings = filteredMeetings.filter(m => {
    if (activeDay === 'all') return true
    return m.date === activeDay
  })

  // Group meetings by date
  const groupedMeetings = dayFilteredMeetings.reduce((acc, meeting) => {
    const date = meeting.date || 'unknown'
    if (!acc[date]) acc[date] = []
    acc[date].push(meeting)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white">
        <div className="px-4 pt-12 pb-6 safe-top">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Meetings</h1>
              <p className="text-white/70 text-sm mt-1">B2B Appointments • April 20-23</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDisplayMode('list')}
                className={clsx(
                  'p-2.5 rounded-xl transition-all',
                  displayMode === 'list' ? 'bg-white text-primary-600' : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <LayoutList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDisplayMode('compact')}
                className={clsx(
                  'p-2.5 rounded-xl transition-all',
                  displayMode === 'compact' ? 'bg-white text-primary-600' : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* View Mode Toggle for Exhibitors */}
          {isExhibitor && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setViewMode('visitor')}
                className={clsx(
                  'flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  viewMode === 'visitor' ? 'bg-white text-primary-600 shadow-lg' : 'bg-white/20 text-white'
                )}
              >
                <User className="w-4 h-4" />
                My Requests
              </button>
              <button
                onClick={() => setViewMode('exhibitor')}
                className={clsx(
                  'flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  viewMode === 'exhibitor' ? 'bg-white text-primary-600 shadow-lg' : 'bg-white/20 text-white'
                )}
              >
                <Briefcase className="w-4 h-4" />
                Incoming
              </button>
            </div>
          )}
          
          {/* Day Selector - Calendar Style */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => setActiveDay('all')}
              className={clsx(
                'flex flex-col items-center justify-center min-w-[70px] py-3 px-4 rounded-2xl font-medium transition-all',
                activeDay === 'all'
                  ? 'bg-white text-primary-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              <CalendarDays className="w-5 h-5 mb-1" />
              <span className="text-xs">All Days</span>
            </button>
            {EVENT_DAYS.map(day => (
              <button
                key={day.date}
                onClick={() => setActiveDay(day.date)}
                className={clsx(
                  'flex flex-col items-center justify-center min-w-[60px] py-3 px-4 rounded-2xl transition-all',
                  activeDay === day.date
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                )}
              >
                <span className="text-xl font-bold">{day.day}</span>
                <span className="text-xs opacity-80">{day.month}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="-mt-4 relative z-10">
        <div className="bg-gray-50 rounded-t-3xl pt-4 pb-6">
          {/* Status Filter Pills */}
          <div className="px-4 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {[
                { key: 'all', label: 'All', color: 'bg-gray-600' },
                { key: 'pending', label: 'Pending', color: 'bg-amber-500' },
                { key: 'approved', label: 'Accepted', color: 'bg-emerald-500' },
                { key: 'cancelled', label: 'Cancelled', color: 'bg-gray-400' },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
                    activeFilter === filter.key
                      ? `${filter.color} text-white border-transparent shadow-sm`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {filter.label}
                  <span className={clsx(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    activeFilter === filter.key ? 'bg-white/20' : 'bg-gray-100'
                  )}>
                    {filterCounts[filter.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="px-4 mb-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-emerald-800 text-sm font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* New Meeting Button */}
          {viewMode === 'visitor' && !showForm && (
            <div className="px-4 mb-4">
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                Request New Meeting
              </button>
            </div>
          )}

          {/* Meeting Request Form */}
          {showForm && viewMode === 'visitor' && (
            <div className="px-4 mb-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  Request B2B Meeting
                </h3>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Exhibitor *</label>
                    <div className="relative">
                      <select
                        required
                        value={formData.exhibitorId}
                        onChange={(e) => setFormData({ ...formData, exhibitorId: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                      >
                        <option value="">Choose an exhibitor...</option>
                        {exhibitors.map(ex => (
                          <option key={ex.id} value={ex.id}>
                            {getExhibitorName(ex)} - Booth {getExhibitorBooth(ex)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {EVENT_DAYS.map(({ date, day, month }) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setFormData({ ...formData, date })}
                          className={clsx(
                            'flex flex-col items-center py-3 rounded-xl font-medium transition-all',
                            formData.date === date
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          )}
                        >
                          <span className="text-lg font-bold">{day}</span>
                          <span className="text-xs">{month}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Time *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData({ ...formData, time })}
                          className={clsx(
                            'py-2 rounded-lg text-xs font-medium transition-all',
                            formData.time === time
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          )}
                        >
                          {formatTimeSlot(time)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="What would you like to discuss?"
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="secondary" fullWidth onClick={() => setShowForm(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" fullWidth disabled={!formData.time || isSubmitting}>
                      {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Sending...</> : <><Send className="w-4 h-4 mr-1" />Send</>}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Meetings List */}
          <div className="px-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-4 animate-pulse">
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
                <p className="text-gray-500 font-medium">Loading meetings...</p>
              </div>
            ) : Object.keys(groupedMeetings).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-800 font-semibold text-lg mb-1">No meetings found</p>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                  {activeFilter !== 'all' || activeDay !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Request a meeting with an exhibitor to get started'}
                </p>
                {(activeFilter !== 'all' || activeDay !== 'all') && (
                  <button
                    onClick={() => { setActiveFilter('all'); setActiveDay('all') }}
                    className="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedMeetings)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, dateMeetings]) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{formatDateLabel(date)}</h3>
                        <p className="text-xs text-gray-500">{dateMeetings.length} meeting{dateMeetings.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {dateMeetings.map(meeting => {
                        const status = meeting.status || 'pending'
                        const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
                        const StatusIcon = config.icon
                        const isIncoming = meeting.type === 'incoming' || (isExhibitor && viewMode === 'exhibitor')
                        
                        if (displayMode === 'compact') {
                          return (
                            <div key={meeting.id} className={`p-3 rounded-xl border ${config.border} ${config.bg} transition-all`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                                  <StatusIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm truncate">
                                    {isIncoming ? (meeting.visitor_name || meeting.visitorName || 'Visitor') : (meeting.exhibitor_name || meeting.exhibitorName || 'Exhibitor')}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTimeSlot(meeting.time)}</span>
                                    <span className="text-gray-300">•</span>
                                    <span>30 min</span>
                                  </div>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.text} border ${config.border}`}>
                                  {config.label}
                                </span>
                              </div>
                            </div>
                          )
                        }
                        
                        return (
                          <div key={meeting.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className={`h-1 bg-gradient-to-r ${config.color}`} />
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                  {(meeting.exhibitor_logo || meeting.exhibitorLogo) ? (
                                    <img 
                                      src={meeting.exhibitor_logo || meeting.exhibitorLogo} 
                                      alt="" 
                                      className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200"
                                      onError={(e) => { e.target.src = DEFAULT_LOGO }}
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                                      {(isIncoming ? (meeting.visitor_name || meeting.visitorName || 'V') : (meeting.exhibitor_name || meeting.exhibitorName || 'E')).charAt(0)}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-gray-900">
                                      {isIncoming ? (meeting.visitor_name || meeting.visitorName || 'Visitor') : (meeting.exhibitor_name || meeting.exhibitorName || 'Exhibitor')}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {isIncoming ? (meeting.visitor_company || meeting.visitorCompany || 'Meeting Request') : `Booth ${meeting.exhibitor_booth || meeting.exhibitorBooth || 'TBA'}`}
                                    </p>
                                  </div>
                                </div>
                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text} border ${config.border}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {config.label}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                  <Clock className="w-3.5 h-3.5 text-primary-600" />
                                  {formatTimeSlot(meeting.time)} • 30 min
                                </span>
                                {(meeting.exhibitor_booth || meeting.exhibitorBooth) && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                    <MapPin className="w-3.5 h-3.5 text-primary-600" />
                                    Booth {meeting.exhibitor_booth || meeting.exhibitorBooth}
                                  </span>
                                )}
                              </div>

                              {(meeting.notes || meeting.message) && (
                                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-xl mb-3">
                                  {meeting.notes || meeting.message}
                                </p>
                              )}

                              {/* Exhibitor Actions */}
                              {isIncoming && status === 'pending' && viewMode === 'exhibitor' && (
                                <div className="grid grid-cols-2 gap-2">
                                  <Button size="sm" variant="danger" fullWidth onClick={() => handleReject(meeting.id)}>
                                    <XCircle className="w-4 h-4 mr-1" />Decline
                                  </Button>
                                  <Button size="sm" variant="success" fullWidth onClick={() => handleApprove(meeting.id)}>
                                    <CheckCircle className="w-4 h-4 mr-1" />Approve
                                  </Button>
                                </div>
                              )}

                              {/* Visitor Actions */}
                              {!isIncoming && status === 'pending' && viewMode === 'visitor' && (
                                <Button size="sm" variant="secondary" fullWidth onClick={() => handleCancel(meeting.id)}>
                                  Cancel Request
                                </Button>
                              )}

                              {/* Reminder Info */}
                              {(status === 'approved' || status === 'confirmed') && (
                                <div className="flex items-center gap-2 text-xs text-emerald-700 mt-2">
                                  <Bell className="w-3.5 h-3.5" />
                                  <span>Reminder 15 min before</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingScheduler
