import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, Loader2, ChevronLeft, ChevronRight, Plus, Check, X } from 'lucide-react'
import { getVisitorMeetings, getSchedules, createSchedule, approveMeeting, rejectMeeting } from '../services/eventxApi'
import { useAuth } from '../context/AuthContext'

const MyMeetings = () => {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState([])
  const [schedules, setSchedules] = useState([])
  const [exhibitorMeetings, setExhibitorMeetings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState('meetings')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const [meetingsData, schedulesData] = await Promise.all([
        getVisitorMeetings(dateStr),
        getSchedules()
      ])
      
      setMeetings(Array.isArray(meetingsData) ? meetingsData : meetingsData.data || [])
      
      const allSchedules = schedulesData.data || []
      setSchedules(allSchedules)
      
      // Filter meetings assigned to current user (for exhibitors)
      if (user?.id) {
        const userAssignedMeetings = allSchedules.filter(schedule => {
          // Check if user_id matches or if user is in the assigned users
          return schedule.user_id === user.id || 
                 schedule.assigned_user_id === user.id ||
                 (schedule.attendees && schedule.attendees.some(a => a.user_id === user.id))
        })
        setExhibitorMeetings(userAssignedMeetings)
      }
    } catch (err) {
      setError('Failed to load meetings')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const navigateDate = (days) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const handleApproveMeeting = async (meetingId) => {
    setActionLoading(meetingId)
    try {
      await approveMeeting(meetingId)
      await loadData()
      setError('')
    } catch (err) {
      setError('Failed to approve meeting: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectMeeting = async (meetingId) => {
    setActionLoading(meetingId)
    try {
      await rejectMeeting(meetingId)
      await loadData()
      setError('')
    } catch (err) {
      setError('Failed to reject meeting: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'confirmed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Meetings</h1>
            <p className="text-white/80 mt-1">Manage your scheduled meetings</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{formatDate(selectedDate)}</p>
            <p className="text-xs text-gray-500">{selectedDate.toISOString().split('T')[0]}</p>
          </div>
          <button
            onClick={() => navigateDate(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('meetings')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === 'meetings'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500'
            }`}
          >
            My Meetings
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === 'assigned'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500'
            }`}
          >
            Meeting Requests
            {exhibitorMeetings.filter(m => m.status?.toLowerCase() === 'pending').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {exhibitorMeetings.filter(m => m.status?.toLowerCase() === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === 'schedules'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500'
            }`}
          >
            All Schedules
          </button>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : activeTab === 'assigned' ? (
          exhibitorMeetings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No meeting requests</h3>
              <p className="text-gray-500">You don't have any meeting requests assigned to you.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exhibitorMeetings.map((meeting, index) => {
                const isPending = meeting.status?.toLowerCase() === 'pending'
                return (
                  <div key={meeting.id || index} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {meeting.visitor_name || meeting.requester_name || meeting.title || 'Meeting Request'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {meeting.visitor_company || meeting.company_name || ''}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status || 'Pending'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {meeting.date || 'TBD'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {meeting.time || meeting.start_time || 'TBD'}
                      </div>
                      {meeting.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </div>
                      )}
                    </div>
                    
                    {meeting.message && (
                      <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3">
                        {meeting.message}
                      </p>
                    )}

                    {isPending && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleApproveMeeting(meeting.id)}
                          disabled={actionLoading === meeting.id}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-all"
                        >
                          {actionLoading === meeting.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectMeeting(meeting.id)}
                          disabled={actionLoading === meeting.id}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-all"
                        >
                          {actionLoading === meeting.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        ) : activeTab === 'meetings' ? (
          meetings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings scheduled</h3>
              <p className="text-gray-500 mb-4">You don't have any meetings for this date.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Schedule a Meeting
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting, index) => (
                <div key={meeting.id || index} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {meeting.exhibitor_name || meeting.title || 'Meeting'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {meeting.company_name || meeting.exhibitor?.company_name || ''}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status || 'Pending'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meeting.time || meeting.start_time || 'TBD'}
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {meeting.location}
                      </div>
                    )}
                  </div>
                  
                  {meeting.message && (
                    <p className="text-sm text-gray-600 mt-3 bg-gray-50 rounded-lg p-3">
                      {meeting.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          schedules.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules yet</h3>
              <p className="text-gray-500">Your scheduled meetings will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule, index) => (
                <div key={schedule.id || index} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{schedule.title || 'Schedule'}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                      {schedule.status || 'Scheduled'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {schedule.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {schedule.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

const CreateMeetingModal = ({ onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    exhibitorId: '',
    date: '',
    time: '',
    message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      await createSchedule({
        exhibitorId: parseInt(formData.exhibitorId),
        date: formData.date,
        time: formData.time,
        message: formData.message
      })
      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to create meeting')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold">Schedule a Meeting</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exhibitor ID *</label>
            <input
              type="number"
              value={formData.exhibitorId}
              onChange={(e) => setFormData(p => ({ ...p, exhibitorId: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Enter exhibitor ID"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(p => ({ ...p, time: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="What would you like to discuss?"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isLoading ? 'Creating...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MyMeetings
