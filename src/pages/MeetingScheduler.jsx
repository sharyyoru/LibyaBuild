import { useState, useEffect } from 'react'
import { Calendar, Clock, Building2, CheckCircle, XCircle, Clock as ClockIcon, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { getExhibitors, getVisitorMeetings, createSchedule, approveMeeting, cancelMeeting } from '../services/eventxApi'
import { format } from 'date-fns'

const MeetingScheduler = () => {
  const { meetings: localMeetings, addMeeting, updateMeeting } = useApp()
  const [exhibitors, setExhibitors] = useState([])
  const [meetings, setMeetings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    exhibitorId: '',
    date: '',
    time: '',
    duration: '30',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

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
    
    try {
      const exhibitor = exhibitors.find(ex => ex.id === parseInt(formData.exhibitorId))
      
      await createSchedule({
        exhibitorId: parseInt(formData.exhibitorId),
        date: formData.date,
        time: formData.time,
        message: formData.notes
      })
      
      // Add to local state
      const newMeeting = {
        id: Date.now(),
        exhibitorId: formData.exhibitorId,
        exhibitorName: exhibitor?.company_name || exhibitor?.name || 'Exhibitor',
        exhibitorBooth: exhibitor?.booth_number || exhibitor?.booth || 'TBA',
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        notes: formData.notes,
        status: 'pending'
      }
      
      setMeetings(prev => [...prev, newMeeting])
      addMeeting(newMeeting)
      
      setFormData({ exhibitorId: '', date: '', time: '', duration: '30', notes: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.message || 'Failed to create meeting')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (meetingId, status) => {
    try {
      if (status === 'confirmed') {
        await approveMeeting(meetingId)
      } else if (status === 'cancelled') {
        await cancelMeeting(meetingId)
      }
      
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, status } : m
      ))
      updateMeeting(meetingId, { status })
    } catch (err) {
      console.error('Failed to update meeting:', err)
      // Update locally anyway
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, status } : m
      ))
      updateMeeting(meetingId, { status })
    }
  }

  const getExhibitorName = (ex) => ex.company_name || ex.name || 'Unknown'
  const getExhibitorBooth = (ex) => ex.booth_number || ex.booth || 'TBA'

  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
    approved: 'success',
    rejected: 'danger'
  }

  const statusIcons = {
    pending: ClockIcon,
    confirmed: CheckCircle,
    cancelled: XCircle,
    approved: CheckCircle,
    rejected: XCircle
  }

  return (
    <>
      <Header title="Meeting Scheduler" />
      <div className="p-4 space-y-4">
        {!showForm && (
          <Button fullWidth onClick={() => setShowForm(true)} icon={Calendar}>
            Request New Meeting
          </Button>
        )}

        {showForm && (
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-4">Request B2B Meeting</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Exhibitor
                </label>
                <select
                  required
                  value={formData.exhibitorId}
                  onChange={(e) => setFormData({ ...formData, exhibitorId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose an exhibitor...</option>
                  {exhibitors.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {getExhibitorName(ex)} - {getExhibitorBooth(ex)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add meeting topics or notes..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

        <div>
          <h3 className="font-bold text-gray-900 mb-3">
            Scheduled Meetings ({meetings.length})
          </h3>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : meetings.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No meetings scheduled yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {meetings.map(meeting => {
                const status = meeting.status || 'pending'
                const StatusIcon = statusIcons[status] || ClockIcon
                return (
                  <Card key={meeting.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">
                          {meeting.exhibitorName || meeting.exhibitor?.company_name || meeting.title || 'Meeting'}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span>{meeting.exhibitorBooth || meeting.exhibitor?.booth_number || 'TBA'}</span>
                        </div>
                      </div>
                      <Badge variant={statusColors[status] || 'default'} size="sm">
                        <StatusIcon className="w-3 h-3 mr-1 inline" />
                        {status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <span>{meeting.date ? format(new Date(meeting.date), 'MMMM d, yyyy') : 'TBA'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-600" />
                        <span>{meeting.time || meeting.start_time || 'TBA'} {meeting.duration ? `• ${meeting.duration} min` : ''}</span>
                      </div>
                    </div>

                    {(meeting.notes || meeting.message) && (
                      <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-xl">
                        {meeting.notes || meeting.message}
                      </p>
                    )}

                    {status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          fullWidth
                          onClick={() => handleUpdateStatus(meeting.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          fullWidth
                          onClick={() => handleUpdateStatus(meeting.id, 'confirmed')}
                        >
                          Confirm
                        </Button>
                      </div>
                    )}
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
