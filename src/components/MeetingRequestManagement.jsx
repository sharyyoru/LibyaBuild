import { useState, useEffect } from 'react'
import { Calendar, Clock, User, MessageSquare, Check, X, Edit, Users, ChevronRight } from 'lucide-react'
import { getUserScheduledMeetings, approveMeeting, rejectMeeting } from '../services/eventxApi'
import { useAuth } from '../context/AuthContext'
import { format, parseISO } from 'date-fns'
import { clsx } from 'clsx'

const MeetingRequestCard = ({ request, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({
    newDate: request.requested_date,
    newTime: request.requested_time
  })

  const handleStatusUpdate = async (status, updates = {}) => {
    setIsUpdating(true)
    try {
      if (status === 'approved') {
        await approveMeeting(request.id)
      } else if (status === 'rejected') {
        await rejectMeeting(request.id)
      }
      // For rescheduling, we might need a separate endpoint or handle differently
      onUpdate()
    } catch (err) {
      console.error('Failed to update meeting request:', err)
    } finally {
      setIsUpdating(false)
      setShowReschedule(false)
    }
  }

  const handleReschedule = () => {
    handleStatusUpdate('rescheduled', rescheduleData)
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Pending' }
      case 'approved':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Approved' }
      case 'rejected':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rejected' }
      case 'rescheduled':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Rescheduled' }
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: status }
    }
  }

  const statusConfig = getStatusConfig(request.status)
  const requesterName = request.requester?.en_name || request.requester?.name || request.requester?.first_name || 'Unknown User'
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{requesterName}</h4>
            <p className="text-sm text-gray-600 capitalize">
              {request.requester_type} • {request.meeting_type || 'business'}
            </p>
          </div>
        </div>
        <span className={clsx(
          'px-3 py-1 rounded-full text-xs font-semibold border',
          statusConfig.bg, statusConfig.text, statusConfig.border
        )}>
          {statusConfig.label}
        </span>
      </div>

      {/* Meeting Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{format(parseISO(request.requested_date), 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{request.requested_time} ({request.duration || 30} minutes)</span>
        </div>
        {request.message && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="line-clamp-3">{request.message}</p>
          </div>
        )}
      </div>

      {/* Reschedule Form */}
      {showReschedule && (
        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
          <h5 className="font-semibold text-gray-900">Reschedule Meeting</h5>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={rescheduleData.newDate}
              onChange={(e) => setRescheduleData(prev => ({ ...prev, newDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="time"
              value={rescheduleData.newTime}
              onChange={(e) => setRescheduleData(prev => ({ ...prev, newTime: e.target.value }))}
              className="p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReschedule}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Confirm Reschedule
            </button>
            <button
              onClick={() => setShowReschedule(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {request.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusUpdate('approved')}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Check className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => setShowReschedule(true)}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Reschedule
          </button>
          <button
            onClick={() => handleStatusUpdate('rejected')}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  )
}

const MeetingRequestManagement = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    loadMeetingRequests()
  }, [user])

  const loadMeetingRequests = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      const result = await getUserScheduledMeetings()
      if (result.data || result.meetings || result) {
        const meetingsList = result.data || result.meetings || result || []
        // Convert API response to expected format
        const formattedRequests = Array.isArray(meetingsList) ? meetingsList.map(meeting => ({
          id: meeting.id,
          requester_id: meeting.user_id || meeting.requester_id,
          recipient_id: meeting.exhibitor_id || meeting.recipient_id,
          requester_type: meeting.user_type || 'visitor',
          recipient_type: 'exhibitor',
          requested_date: meeting.date,
          requested_time: meeting.time,
          duration: meeting.duration || 30,
          message: meeting.message || '',
          meeting_type: meeting.type || 'business',
          status: meeting.status || 'pending',
          created_at: meeting.created_at,
          updated_at: meeting.updated_at,
          requester: {
            name: meeting.user_name || meeting.requester_name || 'Unknown',
            en_name: meeting.user_name || meeting.requester_name || 'Unknown'
          }
        })) : []
        
        setRequests(formattedRequests)
      }
    } catch (err) {
      console.error('Failed to load meeting requests:', err)
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  })

  const getFilterCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length
    }
  }

  const counts = getFilterCounts()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Meeting Requests</h2>
        <p className="text-sm text-gray-600 mt-1">
          {user?.is_exhibitor ? 'Manage meeting requests from visitors' : 'Track your meeting requests'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'pending', label: 'Pending', count: counts.pending },
          { key: 'approved', label: 'Approved', count: counts.approved },
          { key: 'rejected', label: 'Rejected', count: counts.rejected }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors',
              filter === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={clsx(
                'px-2 py-0.5 rounded-full text-xs font-bold',
                filter === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No meeting requests</h3>
          <p className="text-sm text-gray-600">
            {filter === 'all' 
              ? 'No meeting requests found' 
              : `No ${filter} meeting requests`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <MeetingRequestCard
              key={request.id}
              request={request}
              onUpdate={loadMeetingRequests}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MeetingRequestManagement
