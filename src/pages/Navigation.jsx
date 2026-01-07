import { useState } from 'react'
import { Navigation as NavigationIcon, MapPin, Bus, Car, Clock, TrendingUp } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { pointsOfInterest, transportSchedule } from '../data/mockData'

const Navigation = () => {
  const [destination, setDestination] = useState(null)
  const [activeTab, setActiveTab] = useState('navigate')

  const startNavigation = (poi) => {
    setDestination(poi)
  }

  return (
    <>
      <Header title="Navigation & Transport" showBack={false} />
      <div className="p-4 space-y-4">
        <Card className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <NavigationIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Wayfinding Active</h3>
              <p className="text-sm text-white/80">GPS-enabled navigation</p>
            </div>
          </div>
          {destination && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-sm text-white/80 mb-1">Navigating to:</p>
              <p className="font-bold">{destination.name}</p>
            </div>
          )}
        </Card>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('navigate')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'navigate'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Navigate
          </button>
          <button
            onClick={() => setActiveTab('transport')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'transport'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Transport
          </button>
        </div>

        {activeTab === 'navigate' && (
          <>
            <Card className="p-0 overflow-hidden">
              <div className="relative bg-gray-100 aspect-[4/3]">
                <svg viewBox="0 0 800 600" className="w-full h-full">
                  <rect width="800" height="600" fill="#f3f4f6" />
                  
                  <rect x="50" y="50" width="700" height="500" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
                  
                  {pointsOfInterest.map(poi => (
                    <g key={poi.id}>
                      <circle
                        cx={poi.coordinates.x}
                        cy={poi.coordinates.y}
                        r="8"
                        fill="#22c55e"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      {destination?.id === poi.id && (
                        <circle
                          cx={poi.coordinates.x}
                          cy={poi.coordinates.y}
                          r="12"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="2"
                        >
                          <animate
                            attributeName="r"
                            values="12;16;12"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="1;0;1"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  ))}
                  
                  <circle cx="100" cy="80" r="10" fill="#3b82f6" stroke="#fff" strokeWidth="3">
                    <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite" />
                  </circle>
                  
                  {destination && (
                    <path
                      d={`M 100 80 Q ${(100 + destination.coordinates.x) / 2} ${(80 + destination.coordinates.y) / 2 - 50} ${destination.coordinates.x} ${destination.coordinates.y}`}
                      stroke="#3b82f6"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="10,5"
                    />
                  )}
                </svg>
              </div>
            </Card>

            {destination && (
              <Card className="p-4 border-2 border-primary-600">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{destination.name}</h3>
                    <p className="text-sm text-gray-600">Estimated: 2 min walk</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setDestination(null)}>
                    Cancel
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-primary-600">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Follow the blue path</span>
                </div>
              </Card>
            )}

            <div>
              <h3 className="font-bold text-gray-900 mb-3">Quick Navigation</h3>
              <div className="grid grid-cols-2 gap-2">
                {pointsOfInterest.slice(0, 8).map(poi => (
                  <Card
                    key={poi.id}
                    onClick={() => startNavigation(poi)}
                    className="p-3 cursor-pointer active:scale-95 transition-transform"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-accent-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 flex-1 line-clamp-1">
                        {poi.name}
                      </span>
                    </div>
                    {destination?.id === poi.id && (
                      <Badge variant="success" size="sm">Active</Badge>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'transport' && (
          <div className="space-y-3">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-blue-50 border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Free Shuttle Service</h3>
                  <p className="text-sm text-gray-600">Multiple routes available</p>
                </div>
              </div>
            </Card>

            {transportSchedule.map(route => (
              <Card key={route.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    route.type === 'shuttle' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {route.type === 'shuttle' ? (
                      <Bus className={`w-6 h-6 ${route.type === 'shuttle' ? 'text-blue-600' : 'text-green-600'}`} />
                    ) : (
                      <Car className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{route.route}</h4>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Every {route.frequency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{route.firstDeparture} - {route.lastDeparture}</span>
                      </div>
                      <p>Duration: {route.duration}</p>
                    </div>
                    <Badge variant={route.status === 'On time' ? 'success' : 'warning'} size="sm">
                      {route.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex gap-3">
                <Car className="w-5 h-5 text-yellow-700 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Parking Information</h4>
                  <p className="text-sm text-gray-600">
                    Main parking: 350/500 spaces available<br />
                    Gate C parking: 180/200 spaces available
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}

export default Navigation
