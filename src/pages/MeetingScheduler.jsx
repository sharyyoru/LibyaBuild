import { useState } from 'react'
import { Calendar, Clock, Building2, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { exhibitors } from '../data/mockData'
import { format } from 'date-fns'

const MeetingScheduler = () => {
  const { meetings, addMeeting, updateMeeting } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    exhibitorId: '',
    date: '',
    time: '',
    duration: '30',
    notes: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const exhibitor = exhibitors.find(ex => ex.id === parseInt(formData.exhibitorId))
    addMeeting({
      ...formData,
      exhibitorName: exhibitor?.name,
      exhibitorBooth: exhibitor?.booth
    })
    setFormData({ exhibitorId: '', date: '', time: '', duration: '30', notes: '' })
    setShowForm(false)
  }

  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger'
  }

  const statusIcons = {
    pending: ClockIcon,
    confirmed: CheckCircle,
    cancelled: XCircle
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
                      {ex.name} - {ex.booth}
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
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth>
                  Send Request
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div>
          <h3 className="font-bold text-gray-900 mb-3">
            Scheduled Meetings ({meetings.length})
          </h3>
          {meetings.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No meetings scheduled yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {meetings.map(meeting => {
                const StatusIcon = statusIcons[meeting.status]
                return (
                  <Card key={meeting.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{meeting.exhibitorName}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span>{meeting.exhibitorBooth}</span>
                        </div>
                      </div>
                      <Badge variant={statusColors[meeting.status]} size="sm">
                        <StatusIcon className="w-3 h-3 mr-1 inline" />
                        {meeting.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <span>{format(new Date(meeting.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-600" />
                        <span>{meeting.time} • {meeting.duration} min</span>
                      </div>
                    </div>

                    {meeting.notes && (
                      <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-xl">
                        {meeting.notes}
                      </p>
                    )}

                    {meeting.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          fullWidth
                          onClick={() => updateMeeting(meeting.id, { status: 'cancelled' })}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          fullWidth
                          onClick={() => updateMeeting(meeting.id, { status: 'confirmed' })}
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
