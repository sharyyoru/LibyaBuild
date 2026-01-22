import { memo } from 'react'
import { Calendar, Clock, MapPin, User, Loader2, Check } from 'lucide-react'
import { clsx } from 'clsx'

const MeetingCard = memo(({ 
  meeting, 
  showActions = false,
  isPending = false,
  actionLoading = false,
  onApprove,
  onReject,
  getStatusColor,
  t 
}) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {meeting.name || meeting.exhibitor_name || meeting.title || t('meetingRequest')}
            </h3>
            {(meeting.company || meeting.company_name) && (
              <p className="text-sm text-gray-500 truncate">
                {meeting.company || meeting.company_name}
              </p>
            )}
            {meeting.email && (
              <p className="text-xs text-gray-400 truncate">
                {meeting.email}
              </p>
            )}
          </div>
        </div>
        <span className={clsx(
          'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap',
          getStatusColor(meeting.status)
        )}>
          {meeting.status?.toLowerCase() === 'cancel' ? t('cancelled') : 
           meeting.status?.toLowerCase() === 'canceled' ? t('cancelled') :
           meeting.status?.toLowerCase() === 'cancelled' ? t('cancelled') :
           (meeting.status ? t(meeting.status.toLowerCase()) || meeting.status : t('pending'))}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {meeting.time || meeting.start_time || t('tbd')}
          </span>
        </div>
        {meeting.location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{meeting.location}</span>
          </div>
        )}
      </div>
      
      {meeting.message && (
        <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3">
          {meeting.message}
        </p>
      )}

      {showActions && isPending && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-all"
          >
            {actionLoading ? (
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
})

MeetingCard.displayName = 'MeetingCard'

export default MeetingCard
