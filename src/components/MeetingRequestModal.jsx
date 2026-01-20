import { useState } from 'react'
import { Calendar, Clock, User, MessageSquare, X, Send, CalendarDays, Users } from 'lucide-react'
import { scheduleMeeting } from '../services/eventxApi'
import { useAuth } from '../context/AuthContext'

const MeetingRequestModal = ({ isOpen, onClose, recipient, recipientType }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 30,
    message: '',
    meetingType: 'business'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const meetingData = {
        user_ids: [recipient?.id], // Array of user IDs as required by API
        date: formData.date,
        time: formData.time,
        message: `${formData.meetingType.toUpperCase()} MEETING REQUEST: ${formData.message}\n\nDuration: ${formData.duration} minutes\nRequested by: ${user?.first_name || user?.name || 'User'} (${user?.is_exhibitor ? 'Exhibitor' : 'Visitor'})`
      }

      const result = await scheduleMeeting(meetingData)
      
      if (result.error || !result.success) {
        setError(result.message || 'Failed to send meeting request. Please try again.')
      } else {
        // Success
        onClose()
        // Reset form
        setFormData({
          date: '',
          time: '',
          duration: 30,
          message: '',
          meetingType: 'business'
        })
        
        // Show success message
        alert('Meeting request sent successfully! The recipient will be notified.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Meeting request failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen || !recipient) return null

  const recipientName = recipient.en_name || recipient.company_name || recipient.name || recipient.first_name || 'Unknown'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Request Meeting</h2>
            <p className="text-sm text-gray-600 mt-1">
              with {recipientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{recipientName}</h4>
              <p className="text-sm text-gray-600 capitalize">
                {recipientType} • {recipient.sector || recipient.industry || 'General'}
              </p>
            </div>
          </div>

          {/* Meeting Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Meeting Type</label>
            <select
              value={formData.meetingType}
              onChange={(e) => handleChange('meetingType', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="business">Business Discussion</option>
              <option value="demo">Product Demo</option>
              <option value="consultation">Consultation</option>
              <option value="partnership">Partnership Discussion</option>
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Duration (minutes)</label>
            <select
              value={formData.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Add a message about the meeting purpose..."
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MeetingRequestModal
