import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Crown, MapPin, Globe, Heart } from 'lucide-react'
import { clsx } from 'clsx'

const SponsorCard = memo(({ 
  sponsor, 
  name, 
  logo, 
  sector, 
  description, 
  booth, 
  country, 
  tierConfig, 
  viewMode,
  isFavorite,
  onToggleFavorite,
  t 
}) => {
  return (
    <Link to={`/exhibitors/${sponsor.id}`}>
      <div className={clsx(
        'bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]',
        viewMode === 'list' ? 'p-4' : 'p-5'
      )}>
        <div className="flex items-center gap-2 mb-3">
          <span className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full text-white',
            tierConfig.bg
          )}>
            <Crown className="w-3.5 h-3.5" />
            {tierConfig.label.toUpperCase()}
          </span>
        </div>

        <div className={clsx(
          'flex gap-4',
          viewMode === 'list' ? 'items-center' : 'items-start'
        )}>
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt={name}
              className={clsx(
                'object-cover bg-gray-100 border border-gray-200 rounded-xl',
                viewMode === 'list' ? 'w-16 h-16' : 'w-20 h-20'
              )}
              loading="lazy"
              onError={(e) => { e.target.src = '/media/default-company.svg' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
              {name}
            </h3>
            <p className={clsx('text-sm font-medium mb-2', tierConfig.text)}>
              {sector}
            </p>
            {description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {booth && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {t('booth')} {booth}
                </span>
              )}
              {country && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {country}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={(e) => { 
              e.preventDefault()
              onToggleFavorite()
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <Heart className={clsx(
              'w-5 h-5 transition-all', 
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            )} />
          </button>
        </div>
      </div>
    </Link>
  )
})

SponsorCard.displayName = 'SponsorCard'

export default SponsorCard
