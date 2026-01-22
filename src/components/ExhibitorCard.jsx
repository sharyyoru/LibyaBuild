import { memo } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Heart, Building2, Crown, Award, Star, BadgeCheck } from 'lucide-react'
import Badge from './Badge'
import { clsx } from 'clsx'

const DEFAULT_LOGO = '/media/default-company.svg'

const SPONSOR_CONFIG = {
  platinum: { label: 'Platinum', icon: Crown, bg: 'bg-gradient-to-r from-slate-600 to-slate-800', text: 'text-white' },
  gold: { label: 'Gold', icon: Award, bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', text: 'text-amber-900' },
  silver: { label: 'Silver', icon: Star, bg: 'bg-gradient-to-r from-gray-300 to-gray-400', text: 'text-gray-800' },
}

const ExhibitorCard = memo(({ 
  exhibitor, 
  name, 
  arabicName, 
  logo, 
  sector, 
  country, 
  booth, 
  description, 
  teamCount, 
  sponsorLevel, 
  isPartner, 
  isFavorite, 
  onToggleFavorite,
  t 
}) => {
  const sponsorConfig = sponsorLevel ? SPONSOR_CONFIG[sponsorLevel] : null
  const SponsorIcon = sponsorConfig?.icon

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
      {sponsorConfig && (
        <div className={`${sponsorConfig.bg} ${sponsorConfig.text} px-4 py-2 flex items-center gap-2`}>
          <SponsorIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">{t(sponsorConfig.label.toLowerCase() + 'Sponsor')}</span>
        </div>
      )}
      
      {!sponsorConfig && isPartner && (
        <div className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-4 py-2 flex items-center gap-2">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-semibold">{t('partner')}</span>
        </div>
      )}
      
      <Link to={`/exhibitors/${exhibitor.id}`} className="block p-4">
        <div className="flex gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={logo}
              alt={name}
              className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200"
              loading="lazy"
              onError={(e) => { e.target.src = DEFAULT_LOGO }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{name}</h3>
                {arabicName && (
                  <p className="text-xs text-gray-500 truncate" dir="rtl">{arabicName}</p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onToggleFavorite()
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <Heart
                  className={clsx(
                    'w-5 h-5 transition-all',
                    isFavorite
                      ? 'fill-red-500 text-red-500 scale-110'
                      : 'text-gray-400'
                  )}
                />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {isPartner && (
                <Badge variant="success" size="sm">
                  <BadgeCheck className="w-3 h-3 mr-0.5" />
                  {t('partner')}
                </Badge>
              )}
              <Badge variant="primary" size="sm">
                {sector}
              </Badge>
              <Badge size="sm">{country}</Badge>
            </div>
            {description && (
              <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {booth}
              </span>
              {teamCount > 0 && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {teamCount} {t('team')}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
})

ExhibitorCard.displayName = 'ExhibitorCard'

export default ExhibitorCard
