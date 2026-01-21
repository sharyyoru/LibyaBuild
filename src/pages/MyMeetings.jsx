import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, Loader2, ChevronLeft, ChevronRight, Plus, Check, X } from 'lucide-react'
import { getVisitorMeetings, getSchedules, createSchedule, approveMeeting, rejectMeeting } from '../services/eventxApi'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'

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

  // Load data on mount and when dependencies change
  useEffect(() => {
    console.log('🔄 MyMeetings useEffect triggered - User ID:', user?.id, 'Date:', selectedDate)
    if (user?.id) {
      loadData()
    } else {
      console.warn('⚠️ User ID not available yet, waiting...')
    }
  }, [selectedDate, user?.id])
  
  // Also load once on mount regardless
  useEffect(() => {
    console.log('🚀 MyMeetings component mounted')
    const timer = setTimeout(() => {
      if (user?.id) {
        console.log('⏰ Delayed load triggered with user ID:', user.id)
        loadData()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Check localStorage for user data
      const storedUser = localStorage.getItem('eventx_user')
      console.log('🔍 RAW LocalStorage user:', storedUser)
      
      const dateStr = selectedDate.toISOString().split('T')[0]
      const [meetingsData, schedulesData] = await Promise.all([
        getVisitorMeetings(dateStr),
        getSchedules()
      ])
      
      setMeetings(Array.isArray(meetingsData) ? meetingsData : meetingsData.data || [])
      
      const allSchedules = schedulesData.data || []
      setSchedules(allSchedules)
      
      console.log('=== MEETING REQUEST FILTER DEBUG ===')
      console.log('📋 Total schedules fetched:', allSchedules.length)
      
      // Try multiple sources for user ID
      let currentUserId = null
      
      // Source 1: From user context
      if (user?.id) {
        currentUserId = user.id
        console.log('✅ User ID from context:', currentUserId)
      }
      
      // Source 2: From localStorage (fallback)
      if (!currentUserId && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          currentUserId = parsedUser?.id
          console.log('✅ User ID from localStorage:', currentUserId)
        } catch (e) {
          console.error('Failed to parse localStorage user')
        }
      }
      
      if (!currentUserId) {
        console.error('❌ CRITICAL: No user ID found anywhere!')
        console.error('User context:', user)
        setExhibitorMeetings([])
        setIsLoading(false)
        return
      }
      
      console.log('👤 Current User ID (final):', currentUserId, 'Type:', typeof currentUserId)
      
      // Filter meetings where schedule.user_id matches logged-in user
      const userAssignedMeetings = []
      
      allSchedules.forEach((schedule, index) => {
        const scheduleUserId = parseInt(schedule.user_id)
        const loggedInUserId = parseInt(currentUserId)
        
        console.log(`\nSchedule #${index + 1} (ID: ${schedule.id})`)
        console.log(`  - user_id: ${schedule.user_id} (${typeof schedule.user_id}) → parsed: ${scheduleUserId}`)
        console.log(`  - visitor_id: ${schedule.visitor_id}`)
        console.log(`  - Logged-in user: ${currentUserId} (${typeof currentUserId}) → parsed: ${loggedInUserId}`)
        console.log(`  - Match? ${scheduleUserId === loggedInUserId ? '✅ YES' : '❌ NO'}`)
        
        if (scheduleUserId === loggedInUserId) {
          console.log(`  ✅ ADDING to exhibitor meetings`)
          userAssignedMeetings.push(schedule)
        }
      })
      
      console.log('\n📊 FINAL RESULTS:')
      console.log('Total matched meetings:', userAssignedMeetings.length)
      console.log('Matched meeting IDs:', userAssignedMeetings.map(m => m.id))
      console.log('=== END DEBUG ===\n')
      
      console.log('📋 STATE SUMMARY:')
      console.log('  - meetings (My Meetings tab):', meetings.length, 'items')
      console.log('  - exhibitorMeetings (Meeting Requests tab):', userAssignedMeetings.length, 'items')
      console.log('  - schedules (All Schedules tab):', allSchedules.length, 'items')
      
      setExhibitorMeetings(userAssignedMeetings)
    } catch (err) {
      setError('Failed to load meetings')
      console.error('Error loading data:', err)
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
      case 'canceled':
      case 'cancel':
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const pendingMeetingsCount = exhibitorMeetings.filter(m => {
    const status = m.status?.toLowerCase()
    return status === 'pending' && status !== 'cancelled' && status !== 'canceled' && status !== 'cancel'
  }).length

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
                            {meeting.name || t('meetingRequest')}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {meeting.company || ''}
                          </p>
                          <p className="text-xs text-gray-400">
                            {meeting.email || ''}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status?.toLowerCase() === 'cancel' ? t('cancelled') : 
                         meeting.status?.toLowerCase() === 'canceled' ? t('cancelled') :
                         meeting.status?.toLowerCase() === 'cancelled' ? t('cancelled') :
                         (meeting.status ? t(meeting.status.toLowerCase()) || meeting.status : t('pending'))}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {meeting.time || t('tbd')}
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
                          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-all"
                        >
                          {actionLoading === meeting.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          {t('approve')}
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
                      {meeting.status || t('pending')}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noSchedules')}</h3>
              <p className="text-gray-500">{t('scheduledMeetingsAppear')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule, index) => (
                <div key={schedule.id || index} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{schedule.title || t('schedule')}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                      {schedule.status || t('scheduled')}
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
