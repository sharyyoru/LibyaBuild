import { Link } from 'react-router-dom'
import { Sparkles, Building2, Globe, MessageSquare } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { exhibitors } from '../data/mockData'
import { useApp } from '../context/AppContext'

const Matchmaking = () => {
  const { userProfile, startChat } = useApp()

  const getSuggestedExhibitors = () => {
    if (!userProfile.sector) return exhibitors.slice(0, 4)
    
    const sameSector = exhibitors.filter(e => e.sector === userProfile.sector)
    const relatedSectors = exhibitors.filter(e => 
      userProfile.interests?.some(interest => 
        e.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
      )
    )
    
    const combined = [...new Set([...sameSector, ...relatedSectors])]
    return combined.slice(0, 6)
  }

  const suggested = getSuggestedExhibitors()

  const handleStartChat = (exhibitor) => {
    startChat(exhibitor.id, exhibitor.name, exhibitor.logo)
    alert(`Chat started with ${exhibitor.name}! Check your messages.`)
  }

  return (
    <>
      <Header title="Business Matchmaking" />
      <div className="p-4 space-y-4">
        <Card className="p-4 bg-gradient-to-br from-primary-600 to-accent-500 text-white border-0">
          <div className="flex items-center gap-3">
            <img src="/media/PNG/App Icons-15.png" alt="Matchmaking" className="w-12 h-12" />
            <div className="flex-1">
              <h3 className="font-bold text-lg">AI-Powered Matching</h3>
              <p className="text-sm text-white/80">
                {suggested.length} exhibitors match your profile
              </p>
            </div>
            <Sparkles className="w-8 h-8 text-white/80" />
          </div>
        </Card>

        {!userProfile.sector && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> Complete your profile with your sector and interests to get better match recommendations!
            </p>
            <Link to="/profile">
              <Button variant="outline" size="sm" className="mt-3">
                Complete Profile
              </Button>
            </Link>
          </Card>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              Suggested for You
            </h3>
            {userProfile.sector && (
              <Badge variant="primary" size="sm">
                Based on {userProfile.sector}
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            {suggested.map(exhibitor => (
              <Card key={exhibitor.id} className="p-4">
                <div className="flex gap-3 mb-3">
                  <img
                    src={exhibitor.logo}
                    alt={exhibitor.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1">{exhibitor.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Building2 className="w-3 h-3" />
                      <span>{exhibitor.booth}</span>
                      <span>•</span>
                      <Globe className="w-3 h-3" />
                      <span>{exhibitor.country}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="primary" size="sm">{exhibitor.sector}</Badge>
                      {exhibitor.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} size="sm">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {exhibitor.description}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Link to={`/exhibitors/${exhibitor.id}`}>
                    <Button variant="outline" size="sm" fullWidth>
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    fullWidth
                    icon={MessageSquare}
                    onClick={() => handleStartChat(exhibitor)}
                  >
                    Start Chat
                  </Button>
                </div>

                {exhibitor.sector === userProfile.sector && (
                  <div className="mt-3 p-2 bg-accent-50 rounded-lg text-center">
                    <p className="text-xs text-accent-700 font-medium">
                      ⚡ Perfect match - Same industry sector
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">How Matchmaking Works</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">1.</span>
              <span>We analyze your selected sector and interests from your profile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">2.</span>
              <span>Our AI matches you with relevant exhibitors and partners</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">3.</span>
              <span>Start chatting or schedule meetings directly through the app</span>
            </li>
          </ul>
        </Card>
      </div>
    </>
  )
}

export default Matchmaking
