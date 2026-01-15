import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Mail, Phone, Globe, Heart, Calendar, Building2, ArrowLeft } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import { getExhibitors } from '../services/eventxApi'
import { useApp } from '../context/AppContext'
import { clsx } from 'clsx'

const DEFAULT_LOGO = '/media/default-company.svg'

const ExhibitorDetail = () => {
  const { id } = useParams()
  const { isFavorite, toggleFavorite } = useApp()
  const [exhibitor, setExhibitor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadExhibitor()
  }, [id])

  const loadExhibitor = async () => {
    setIsLoading(true)
    try {
      const data = await getExhibitors()
      const exhibitorList = data.data || data.exhibitors || data || []
      const found = exhibitorList.find(e => e.id === parseInt(id))
      setExhibitor(found)
    } catch (err) {
      console.error('Failed to load exhibitor:', err)
      setError('Failed to load exhibitor details')
    } finally {
      setIsLoading(false)
    }
  }

  const getLogo = () => exhibitor?.logo_url || exhibitor?.logo || exhibitor?.image || DEFAULT_LOGO
  const getName = () => exhibitor?.company_name || exhibitor?.name || exhibitor?.company || 'Unknown'
  const getSector = () => exhibitor?.sector || exhibitor?.industry || exhibitor?.category || 'General'
  const getDescription = () => exhibitor?.description || exhibitor?.about || ''
  const getBooth = () => exhibitor?.booth_number || exhibitor?.booth || 'TBA'
  const getHall = () => exhibitor?.hall || 'TBA'
  const getEmail = () => exhibitor?.email || exhibitor?.contact?.email || exhibitor?.company_email || ''
  const getPhone = () => exhibitor?.phone || exhibitor?.contact?.phone || exhibitor?.mobile || ''
  const getWebsite = () => exhibitor?.website || exhibitor?.contact?.website || exhibitor?.company_website || ''
  const getCountry = () => exhibitor?.country || 'Libya'
  const getTags = () => exhibitor?.tags || exhibitor?.products || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (error || !exhibitor) {
    return (
      <>
        <Header title="Exhibitor" />
        <div className="p-4 text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">{error || 'Exhibitor not found'}</p>
          <Link to="/exhibitors" className="text-primary-600 font-medium">
            Back to Exhibitors
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Header 
        title={getName()}
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
              src={getLogo()}
              alt={getName()}
              className="w-20 h-20 rounded-2xl object-cover bg-gray-100"
              onError={(e) => { e.target.src = DEFAULT_LOGO }}
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{getName()}</h2>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="primary">{getSector()}</Badge>
                <Badge>{getCountry()}</Badge>
              </div>
            </div>
          </div>
          {getDescription() && (
            <p className="text-gray-600 mb-4">{getDescription()}</p>
          )}
          {getTags().length > 0 && (
            <div className="flex flex-wrap gap-2">
              {getTags().map((tag, idx) => (
                <Badge key={idx} size="sm">{typeof tag === 'string' ? tag : tag.name}</Badge>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            Location
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Booth:</span>
              <span className="font-semibold text-gray-900">{getBooth()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hall:</span>
              <span className="font-semibold text-gray-900">{getHall()}</span>
            </div>
          </div>
          <Link to="/floor-plan">
            <Button variant="outline" fullWidth className="mt-4">
              View on Floor Plan
            </Button>
          </Link>
        </Card>

        {(getEmail() || getPhone() || getWebsite()) && (
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3">Contact Information</h3>
            <div className="space-y-3">
              {getEmail() && (
                <a href={`mailto:${getEmail()}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
                  <Mail className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-900 truncate">{getEmail()}</span>
                </a>
              )}
              {getPhone() && (
                <a href={`tel:${getPhone()}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
                  <Phone className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-900">{getPhone()}</span>
                </a>
              )}
              {getWebsite() && (
                <a href={getWebsite().startsWith('http') ? getWebsite() : `https://${getWebsite()}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
                  <Globe className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-900 truncate">{getWebsite()}</span>
                </a>
              )}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link to={`/meetings?exhibitor=${exhibitor.id}`}>
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
