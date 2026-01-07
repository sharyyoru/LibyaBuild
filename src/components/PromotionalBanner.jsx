import { useNavigate } from 'react-router-dom'
import { Star, Clock } from 'lucide-react'
import Card from './Card'
import Badge from './Badge'
import { promotionalBanners, exhibitors } from '../data/mockData'
import { differenceInHours } from 'date-fns'

const PromotionalBanner = () => {
  const navigate = useNavigate()
  const activeBanner = promotionalBanners.find(
    b => new Date(b.expiresAt) > new Date()
  )

  if (!activeBanner) return null

  const exhibitor = exhibitors.find(e => e.id === activeBanner.exhibitorId)
  const hoursLeft = differenceInHours(new Date(activeBanner.expiresAt), new Date())

  return (
    <Card className="overflow-hidden border-2 border-primary-200">
      <div className="relative">
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <Badge variant="primary" className="shadow-lg">
            <Star className="w-3 h-3 mr-1 inline fill-current" />
            Sponsored
          </Badge>
          {hoursLeft < 24 && (
            <Badge variant="warning" className="shadow-lg">
              <Clock className="w-3 h-3 mr-1 inline" />
              {hoursLeft}h left
            </Badge>
          )}
        </div>
        
        <img
          src={activeBanner.image}
          alt={activeBanner.title}
          className="w-full h-40 object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-xl font-bold text-white mb-1">{activeBanner.title}</h3>
          <p className="text-white/90 text-sm mb-3">{activeBanner.description}</p>
          <button
            onClick={() => navigate(`/exhibitors/${activeBanner.exhibitorId}`)}
            className="self-start px-4 py-2 bg-white text-primary-600 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </Card>
  )
}

export default PromotionalBanner
