import { useParams, Link } from 'react-router-dom'
import { MapPin, Mail, Phone, Globe, Heart, Calendar } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { exhibitors } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { clsx } from 'clsx'

const ExhibitorDetail = () => {
  const { id } = useParams()
  const { isFavorite, toggleFavorite } = useApp()
  const exhibitor = exhibitors.find(e => e.id === parseInt(id))

  if (!exhibitor) return <div>Exhibitor not found</div>

  return (
    <>
      <Header 
        title={exhibitor.name}
        action={
          <button
            onClick={() => toggleFavorite('exhibitors', exhibitor.id)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart
              className={clsx(
                'w-6 h-6',
                isFavorite('exhibitors', exhibitor.id)
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400'
              )}
            />
          </button>
        }
      />
      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={exhibitor.logo}
              alt={exhibitor.name}
              className="w-20 h-20 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{exhibitor.name}</h2>
              <Badge variant="primary">{exhibitor.category}</Badge>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{exhibitor.description}</p>
          <div className="flex flex-wrap gap-2">
            {exhibitor.tags.map(tag => (
              <Badge key={tag} size="sm">{tag}</Badge>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            Location
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Booth:</span>
              <span className="font-semibold text-gray-900">{exhibitor.booth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hall:</span>
              <span className="font-semibold text-gray-900">{exhibitor.hall}</span>
            </div>
          </div>
          <Link to="/floor-plan">
            <Button variant="outline" fullWidth className="mt-4">
              View on Floor Plan
            </Button>
          </Link>
        </Card>

        <Card className="p-4">
          <h3 className="font-bold text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-3">
            <a href={`mailto:${exhibitor.contact.email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
              <Mail className="w-5 h-5 text-primary-600" />
              <span className="text-gray-900">{exhibitor.contact.email}</span>
            </a>
            <a href={`tel:${exhibitor.contact.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
              <Phone className="w-5 h-5 text-primary-600" />
              <span className="text-gray-900">{exhibitor.contact.phone}</span>
            </a>
            <a href={`https://${exhibitor.contact.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
              <Globe className="w-5 h-5 text-primary-600" />
              <span className="text-gray-900">{exhibitor.contact.website}</span>
            </a>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/meetings">
            <Button variant="outline" fullWidth icon={Calendar}>
              Book Meeting
            </Button>
          </Link>
          <Link to="/business-cards">
            <Button fullWidth>
              Exchange Card
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default ExhibitorDetail
