import { useState } from 'react'
import { Navigation, MapPin, Coffee, Droplets, AlertCircle, DoorOpen, Heart as HeartIcon } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { exhibitors, pointsOfInterest } from '../data/mockData'
import { clsx } from 'clsx'

const POIIcon = ({ type }) => {
  const icons = {
    entrance: DoorOpen,
    info: AlertCircle,
    prayer: HeartIcon,
    medical: AlertCircle,
    food: Coffee,
    restroom: Droplets,
    exit: DoorOpen,
    lounge: Coffee
  }
  const Icon = icons[type] || MapPin
  return <Icon className="w-4 h-4" />
}

const FloorPlan = () => {
  const [showPOI, setShowPOI] = useState(true)
  const [selectedHall, setSelectedHall] = useState('all')

  const halls = ['all', 'Hall A', 'Hall B', 'Hall C', 'Hall D']

  return (
    <>
      <Header title="Floor Plan" showBack={false} />
      <div className="p-4 space-y-4">
        <Card className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Blue Dot Navigation</h3>
              <p className="text-sm text-gray-600">Your location is being tracked</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {halls.map(hall => (
            <button
              key={hall}
              onClick={() => setSelectedHall(hall)}
              className={clsx(
                'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors',
                selectedHall === hall
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              )}
            >
              {hall === 'all' ? 'All Halls' : hall}
            </button>
          ))}
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="relative bg-gray-100 aspect-[4/3] overflow-hidden">
            <svg viewBox="0 0 800 600" className="w-full h-full">
              <rect width="800" height="600" fill="#f3f4f6" />
              
              <rect x="50" y="50" width="300" height="200" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
              <text x="200" y="140" textAnchor="middle" fill="#374151" fontSize="20" fontWeight="bold">Hall A</text>
              
              <rect x="400" y="50" width="350" height="200" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
              <text x="575" y="140" textAnchor="middle" fill="#374151" fontSize="20" fontWeight="bold">Hall B</text>
              
              <rect x="50" y="300" width="300" height="250" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
              <text x="200" y="415" textAnchor="middle" fill="#374151" fontSize="20" fontWeight="bold">Hall C</text>
              
              <rect x="400" y="300" width="350" height="250" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
              <text x="575" y="415" textAnchor="middle" fill="#374151" fontSize="20" fontWeight="bold">Hall D</text>
              
              {exhibitors.map(ex => (
                <g key={ex.id}>
                  <circle
                    cx={ex.coordinates.x}
                    cy={ex.coordinates.y}
                    r="8"
                    fill="#dc3b26"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={ex.coordinates.x}
                    y={ex.coordinates.y - 15}
                    textAnchor="middle"
                    fill="#374151"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {ex.booth}
                  </text>
                </g>
              ))}
              
              {showPOI && pointsOfInterest.map(poi => (
                <circle
                  key={poi.id}
                  cx={poi.coordinates.x}
                  cy={poi.coordinates.y}
                  r="6"
                  fill="#22c55e"
                  stroke="#fff"
                  strokeWidth="2"
                />
              ))}
              
              <circle cx="100" cy="80" r="10" fill="#3b82f6" stroke="#fff" strokeWidth="3">
                <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-900">Legend</span>
              <button
                onClick={() => setShowPOI(!showPOI)}
                className="text-sm font-medium text-primary-600"
              >
                {showPOI ? 'Hide' : 'Show'} POI
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Your Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                <span>Exhibitors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent-600"></div>
                <span>Points of Interest</span>
              </div>
            </div>
          </div>
        </Card>

        <div>
          <h3 className="font-bold text-gray-900 mb-3">Points of Interest</h3>
          <div className="grid grid-cols-2 gap-2">
            {pointsOfInterest.slice(0, 8).map(poi => (
              <Card key={poi.id} className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center text-accent-600">
                    <POIIcon type={poi.type} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 flex-1 line-clamp-1">{poi.name}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Button fullWidth icon={Navigation}>
          Navigate to Location
        </Button>
      </div>
    </>
  )
}

export default FloorPlan
