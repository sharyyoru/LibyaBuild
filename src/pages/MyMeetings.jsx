import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, Loader2, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import MeetingCard from '../components/MeetingCard'
import { getVisitorMeetings, getSchedules, createSchedule, approveMeeting, rejectMeeting } from '../services/eventxApi'
import { getCachedData, clearCache } from '../services/apiCache'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'

const CACHE_TTL = 2 * 60 * 1000

const MyMeetings = () => {
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation(language)
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
    if (user?.id) {
      loadData()
    }
  }, [selectedDate, user?.id])

  const loadData = async (forceRefresh = false) => {
    setIsLoading(true)
    try {
      if (forceRefresh) {
        clearCache('meetings')
        clearCache('schedules')
      }

      const storedUser = localStorage.getItem('eventx_user')
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      const [meetingsData, schedulesData] = await Promise.all([
        getCachedData(`meetings_${dateStr}`, () => getVisitorMeetings(dateStr), CACHE_TTL),
        getCachedData('schedules', () => getSchedules(), CACHE_TTL)
      ])
      
      setMeetings(Array.isArray(meetingsData) ? meetingsData : meetingsData.data || [])
      
      const allSchedules = schedulesData.data || []
      setSchedules(allSchedules)
      
      let currentUserId = null
      if (user?.id) {
        currentUserId = user.id
      } else if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          currentUserId = parsedUser?.id
        } catch (e) {
          console.error('Failed to parse localStorage user')
        }
      }
      
      if (!currentUserId) {
        setExhibitorMeetings([])
        setIsLoading(false)
        return
      }
      
      const userAssignedMeetings = allSchedules.filter(schedule => 
        parseInt(schedule.user_id) === parseInt(currentUserId)
      )
      
      setExhibitorMeetings(userAssignedMeetings)
    } catch (err) {
      setError('Failed to load meetings')
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }, [])

  const navigateDate = useCallback((days) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }, [selectedDate])

  const handleApproveMeeting = useCallback(async (meetingId) => {
    setActionLoading(meetingId)
    try {
      await approveMeeting(meetingId)
      await loadData(true)
      setError('')
    } catch (err) {
      setError('Failed to approve meeting: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }, [])

  const handleRejectMeeting = useCallback(async (meetingId) => {
    setActionLoading(meetingId)
    try {
      await rejectMeeting(meetingId)
      await loadData(true)
      setError('')
    } catch (err) {
      setError('Failed to reject meeting: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }, [])

  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'confirmed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
      case 'canceled':
      case 'cancel':
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }, [])

  const pendingMeetingsCount = useMemo(() => 
    exhibitorMeetings.filter(m => {
      const status = m.status?.toLowerCase()
      return status === 'pending' && status !== 'cancelled' && status !== 'canceled' && status !== 'cancel'
    }).length,
    [exhibitorMeetings]
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Incoming Meetings Notification Bar */}
      {pendingMeetingsCount > 0 && (
        <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-medium text-sm">
              {pendingMeetingsCount} {t('meetingRequests')}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('assigned')}
            className="bg-white text-amber-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-50 transition-all"
          >
            {t('view')}
          </button>
        </div>
      )}

      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('myMeetings')}</h1>
            <p className="text-white/80 mt-1">{t('b2bAppointments')}</p>
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
            {t('myMeetings')}
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === 'assigned'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500'
            }`}
          >
            {t('meetingRequests')}
            {exhibitorMeetings.filter(m => {
              const status = m.status?.toLowerCase()
              return status === 'pending' && status !== 'cancelled' && status !== 'canceled' && status !== 'cancel'
            }).length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {exhibitorMeetings.filter(m => {
                  const status = m.status?.toLowerCase()
                  return status === 'pending' && status !== 'cancelled' && status !== 'canceled' && status !== 'cancel'
                }).length}
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
            {t('allMeetings')}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noMeetings')}</h3>
              <p className="text-gray-500">{t('noMeetings')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exhibitorMeetings.map((meeting, index) => (
                <MeetingCard
                  key={meeting.id || index}
                  meeting={meeting}
                  showActions={true}
                  isPending={meeting.status?.toLowerCase() === 'pending'}
                  actionLoading={actionLoading === meeting.id}
                  onApprove={() => handleApproveMeeting(meeting.id)}
                  onReject={() => handleRejectMeeting(meeting.id)}
                  getStatusColor={getStatusColor}
                  t={t}
                />
              ))}
            </div>
          )
        ) : activeTab === 'meetings' ? (
          meetings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noMeetings')}</h3>
              <p className="text-gray-500 mb-4">{t('noMeetingsFound')}</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                {t('scheduleMeeting')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting, index) => (
                <MeetingCard
                  key={meeting.id || index}
                  meeting={meeting}
                  showActions={false}
                  getStatusColor={getStatusColor}
                  t={t}
                />
              ))}
            </div>
          )
        ) : (
          schedules.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noSchedules')}</h3>
              <p className="text-gray-500">{t('scheduledMeetingsAppear')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule, index) => (
                <MeetingCard
                  key={schedule.id || index}
                  meeting={schedule}
                  showActions={false}
                  getStatusColor={getStatusColor}
                  t={t}
                />
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
            loadData(true)
          }}
        />
      )}
    </div>
  )
}

const CreateMeetingModal = ({ onClose, onSuccess }) => {
  const { language } = useLanguage()
  const { t } = useTranslation(language)
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
          <h2 className="text-lg font-semibold">{t('scheduleMeeting')}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('exhibitorId')} *</label>
            <input
              type="number"
              value={formData.exhibitorId}
              onChange={(e) => setFormData(p => ({ ...p, exhibitorId: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder={t('enterExhibitorId')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')} *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')} *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('message')}</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder={t('whatToDiscuss')}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isLoading ? t('creating') : t('schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MyMeetings
