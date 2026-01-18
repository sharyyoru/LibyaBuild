import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Calendar, Clock, Building2, CheckCircle, XCircle, Clock as ClockIcon, Loader2, Filter, User, Briefcase, Bell, ChevronDown } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { getExhibitors, getVisitorMeetings, createSchedule, approveMeeting, cancelMeeting, rejectMeeting } from '../services/eventxApi'
import { format, addMinutes, isAfter, isBefore, parseISO } from 'date-fns'

// Event dates: April 20-23, 2026
const EVENT_DATES = [
  { date: '2026-04-20', label: 'Day 1 - April 20' },
  { date: '2026-04-21', label: 'Day 2 - April 21' },
  { date: '2026-04-22', label: 'Day 3 - April 22' },
  { date: '2026-04-23', label: 'Day 4 - April 23' },
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
  const [viewMode, setViewMode] = useState('visitor') // 'visitor' or 'exhibitor'
  
  const [formData, setFormData] = useState({
    exhibitorId: preselectedExhibitor || '',
    date: EVENT_DATES[0].date,
    time: TIME_SLOTS[0],
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
      const [exhibitorsData, meetingsData] = await Promise.all([
        getExhibitors(),
        getVisitorMeetings(new Date().toISOString().split('T')[0])
      ])
      
      const exhibitorList = exhibitorsData.data || exhibitorsData.exhibitors || exhibitorsData || []
      setExhibitors(Array.isArray(exhibitorList) ? exhibitorList : [])
      
      const meetingList = meetingsData.data || meetingsData.meetings || meetingsData || []
      setMeetings(Array.isArray(meetingList) ? meetingList : [...localMeetings])
      
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
      
      await createSchedule({
        exhibitorId: parseInt(formData.exhibitorId),
        date: formData.date,
        time: formData.time,
        message: formData.notes
      })
      
      const newMeeting = {
        id: Date.now(),
        exhibitorId: formData.exhibitorId,
        exhibitorName: exhibitor?.company_name || exhibitor?.name || 'Exhibitor',
        exhibitorBooth: exhibitor?.booth_number || exhibitor?.booth || 'TBA',
        exhibitorLogo: exhibitor?.logo_url || exhibitor?.logo,
        visitorName: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email,
        visitorCompany: user?.company || '',
        date: formData.date,
        time: formData.time,
        duration: 30,
        notes: formData.notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
        type: 'outgoing' // visitor sent this request
      }
      
      setMeetings(prev => [...prev, newMeeting])
      addMeeting(newMeeting)
      
      setSuccess('Meeting request sent! You will be notified when the exhibitor responds.')
      setFormData({ exhibitorId: '', date: EVENT_DATES[0].date, time: TIME_SLOTS[0], notes: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.message || 'Failed to create meeting request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async (meetingId) => {
    try {
      await approveMeeting(meetingId)
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, status: 'approved' } : m
      ))
      updateMeeting(meetingId, { status: 'approved' })
      setSuccess('Meeting approved! The visitor has been notified.')
    } catch (err) {
      console.error('Failed to approve meeting:', err)
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, status: 'approved' } : m
      ))
      updateMeeting(meetingId, { status: 'approved' })
    }
  }

  const handleReject = async (meetingId) => {
    try {
      await rejectMeeting(meetingId)
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
      await cancelMeeting(meetingId)
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

  const getExhibitorName = (ex) => ex.company_name || ex.name || 'Unknown'
  const getExhibitorBooth = (ex) => ex.booth_number || ex.booth || 'TBA'

  const statusConfig = {
    pending: { color: 'warning', icon: ClockIcon, label: 'Pending', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    approved: { color: 'success', icon: CheckCircle, label: 'Approved', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    confirmed: { color: 'success', icon: CheckCircle, label: 'Confirmed', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    rejected: { color: 'danger', icon: XCircle, label: 'Rejected', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    cancelled: { color: 'danger', icon: XCircle, label: 'Cancelled', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
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

  return (
    <>
      <Header title="Meetings" />
      <div className="p-4 space-y-4">
        {/* View Mode Toggle for Exhibitors */}
        {isExhibitor && (
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setViewMode('visitor')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                viewMode === 'visitor' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              <User className="w-4 h-4" />
              My Requests
            </button>
            <button
              onClick={() => setViewMode('exhibitor')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                viewMode === 'exhibitor' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Incoming Requests
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <Card className="p-4 bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 text-sm font-medium">{success}</p>
            </div>
          </Card>
        )}

        {/* New Meeting Button (Visitor View) */}
        {viewMode === 'visitor' && !showForm && (
          <Button fullWidth onClick={() => setShowForm(true)} icon={Calendar}>
            Request New Meeting
          </Button>
        )}

        {/* Meeting Request Form */}
        {showForm && viewMode === 'visitor' && (
          <Card className="p-5">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Exhibitor *
                </label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Date *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_DATES.map(({ date, label }) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setFormData({ ...formData, date })}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        formData.date === date
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Time Slot *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({ ...formData, time })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        formData.time === time
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {formatTimeSlot(time)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Each meeting slot is 30 minutes</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meeting Purpose (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Describe what you'd like to discuss..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowForm(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending...</> : 'Send Request'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Smart Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Accepted' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeFilter === filter.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === filter.key ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {filterCounts[filter.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Meetings List */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            {viewMode === 'exhibitor' ? (
              <><Briefcase className="w-5 h-5 text-primary-600" />Meeting Requests</>
            ) : (
              <><Calendar className="w-5 h-5 text-primary-600" />Your Meetings</>
            )}
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : filteredMeetings.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-1">No meetings found</p>
              <p className="text-sm text-gray-400">
                {activeFilter !== 'all' ? 'Try a different filter' : 'Request a meeting with an exhibitor'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredMeetings.map(meeting => {
                const status = meeting.status || 'pending'
                const config = statusConfig[status] || statusConfig.pending
                const StatusIcon = config.icon
                const isIncoming = meeting.type === 'incoming' || (isExhibitor && viewMode === 'exhibitor')
                
                return (
                  <Card key={meeting.id} className={`overflow-hidden ${config.bg} ${config.border} border`}>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          {meeting.exhibitorLogo ? (
                            <img 
                              src={meeting.exhibitorLogo} 
                              alt="" 
                              className="w-12 h-12 rounded-xl object-cover bg-white"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {isIncoming 
                                ? (meeting.visitorName || 'Visitor')
                                : (meeting.exhibitorName || meeting.exhibitor?.company_name || 'Exhibitor')}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {isIncoming 
                                ? (meeting.visitorCompany || 'Meeting Request')
                                : `Booth ${meeting.exhibitorBooth || meeting.exhibitor?.booth_number || 'TBA'}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant={config.color} size="sm">
                          <StatusIcon className="w-3 h-3 mr-1 inline" />
                          {config.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-primary-600" />
                          <span>{meeting.date ? format(new Date(meeting.date), 'MMM d, yyyy') : 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-primary-600" />
                          <span>{meeting.time ? formatTimeSlot(meeting.time) : 'TBA'}</span>
                        </div>
                        <span className="text-gray-400">• 30 min</span>
                      </div>

                      {(meeting.notes || meeting.message) && (
                        <p className="text-sm text-gray-600 p-3 bg-white rounded-xl mb-3">
                          {meeting.notes || meeting.message}
                        </p>
                      )}

                      {/* Exhibitor Actions (Incoming Requests) */}
                      {isIncoming && status === 'pending' && viewMode === 'exhibitor' && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="danger"
                            fullWidth
                            onClick={() => handleReject(meeting.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            variant="success"
                            fullWidth
                            onClick={() => handleApprove(meeting.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}

                      {/* Visitor Actions (Outgoing Requests) */}
                      {!isIncoming && status === 'pending' && viewMode === 'visitor' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          fullWidth
                          onClick={() => handleCancel(meeting.id)}
                        >
                          Cancel Request
                        </Button>
                      )}

                      {/* Reminder Info for Approved Meetings */}
                      {(status === 'approved' || status === 'confirmed') && (
                        <div className="flex items-center gap-2 text-xs text-green-700 mt-2">
                          <Bell className="w-3.5 h-3.5" />
                          <span>You'll receive a reminder 15 minutes before</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MeetingScheduler
