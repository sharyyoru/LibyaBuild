import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User, Briefcase, Mail, Phone, MessageCircle, ArrowLeft, CheckCircle, EyeOff, X } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { getPublicUserProfile, saveScannedCard } from '../lib/supabase'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'

const SharedCard = () => {
  const { hash } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation(language)
  const [cardData, setCardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

  useEffect(() => {
    if (hash) {
      loadCardFromHash(hash)
    } else {
      setError('Invalid card link')
      setIsLoading(false)
    }
  }, [hash])

  const loadCardFromHash = async (cardHash) => {
    try {
      // Decode the hash
      const decoded = JSON.parse(atob(cardHash))
      const sharedUserId = decoded.userId

      if (!sharedUserId) {
        setError('Invalid card data')
        setIsLoading(false)
        return
      }

      // Fetch the public profile of the shared user
      const { data: profile, error: profileError } = await getPublicUserProfile(sharedUserId)
      
      if (profileError || !profile) {
        setError('Could not load card information')
        setIsLoading(false)
        return
      }

      setCardData({
        userId: sharedUserId,
        name: profile.name || 'Event Attendee',
        company: profile.company || 'Company',
        role: profile.role || 'Professional',
        email: profile.email_public ? profile.email : null,
        mobile: profile.mobile_public ? profile.mobile : null,
        photo: profile.profile_photo_url
      })
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading card:', err)
      setError('Failed to load card. The link may be invalid or expired.')
      setIsLoading(false)
    }
  }

  const handleSaveCard = async () => {
    const currentUserId = user?.id || user?.user_id || user?.visitor_id
    
    if (!currentUserId) {
      alert('Please log in to save this contact')
      navigate('/login')
      return
    }

    if (!cardData) {
      alert('No card data available')
      return
    }

    setIsSaving(true)

    try {
      const saveData = {
        scannedUserId: cardData.userId,
        name: cardData.name,
        company: cardData.company,
        role: cardData.role,
        email: cardData.email,
        phone: cardData.mobile,
        source: 'shared_link',
        rawData: JSON.stringify(cardData)
      }

      const { data: savedCard, error } = await saveScannedCard(currentUserId, saveData)
      
      if (error) {
        console.error('Error saving card:', error)
        alert('Failed to save contact. You may have already saved this contact.')
        setIsSaving(false)
        return
      }

      if (savedCard) {
        setIsSaved(true)
        setTimeout(() => {
          navigate('/business-cards')
        }, 1500)
      }
    } catch (err) {
      console.error('Failed to save card:', err)
      alert('Error saving contact. Please try again.')
      setIsSaving(false)
    }
  }

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      alert('Please enter a code')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Try to parse as JSON (QR code data)
      const qrData = JSON.parse(manualCode)
      const sharedUserId = qrData.userId

      if (!sharedUserId) {
        setError('Invalid code format')
        setIsLoading(false)
        return
      }

      // Fetch the public profile
      const { data: profile, error: profileError } = await getPublicUserProfile(sharedUserId)
      
      if (profileError || !profile) {
        setError('Could not find contact')
        setIsLoading(false)
        return
      }

      setCardData({
        userId: sharedUserId,
        name: qrData.name || profile.name || 'Event Attendee',
        company: qrData.company || profile.company || 'Company',
        role: qrData.role || profile.role || 'Professional',
        email: profile.email_public ? profile.email : (qrData.email || null),
        mobile: profile.mobile_public ? profile.mobile : (qrData.mobile || null),
        photo: profile.profile_photo_url
      })
      setIsLoading(false)
      setShowManualInput(false)
    } catch (err) {
      console.error('Error parsing code:', err)
      setError('Invalid code format. Please check and try again.')
      setIsLoading(false)
    }
  }

  const handleStartChat = () => {
    if (cardData?.userId) {
      navigate(`/chat/${cardData.userId}`)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header title="Shared Card" />
        <div className="p-4">
          <Card className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
            <p className="text-gray-500">Loading card...</p>
          </Card>
        </div>
      </>
    )
  }

  if (error && !showManualInput) {
    return (
      <>
        <Header title="Shared Card" />
        <div className="p-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Unable to Load Card</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button 
                fullWidth 
                onClick={() => setShowManualInput(true)}
              >
                Enter Code Manually
              </Button>
              <Button 
                variant="outline" 
                fullWidth 
                onClick={() => navigate('/business-cards')}
              >
                Go to Business Cards
              </Button>
            </div>
          </Card>
        </div>
      </>
    )
  }

  if (showManualInput) {
    return (
      <>
        <Header title="Enter Card Code" />
        <div className="p-4">
          <Card className="p-6">
            <button
              onClick={() => setShowManualInput(false)}
              className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <h3 className="font-bold text-gray-900 mb-2">Enter Card Code</h3>
            <p className="text-sm text-gray-600 mb-4">
              Paste the QR code data or card code you received
            </p>
            
            <textarea
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder='Paste code here (e.g., {"userId":"...","name":"..."})'
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px] font-mono text-sm"
            />
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="secondary" 
                fullWidth 
                onClick={() => {
                  setShowManualInput(false)
                  setError(null)
                  setManualCode('')
                }}
              >
                Cancel
              </Button>
              <Button 
                fullWidth 
                onClick={handleManualSubmit}
                disabled={!manualCode.trim() || isLoading}
              >
                {isLoading ? 'Loading...' : 'Submit'}
              </Button>
            </div>
          </Card>
        </div>
      </>
    )
  }

  if (isSaved) {
    return (
      <>
        <Header title="Contact Saved" />
        <div className="p-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Contact Saved!</h3>
            <p className="text-gray-600">Redirecting to Business Cards...</p>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Shared Business Card" />
      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="text-center mb-6">
            {cardData?.photo ? (
              <img 
                src={cardData.photo} 
                alt={cardData.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary-100"
              />
            ) : (
              <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-12 h-12 text-primary-600" />
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{cardData?.name}</h2>
            <p className="text-gray-600 mb-1">{cardData?.role}</p>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Briefcase className="w-4 h-4" />
              <span>{cardData?.company}</span>
            </div>
          </div>

          <div className="space-y-3 mb-6 pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Contact Information
            </h3>
            
            {cardData?.email ? (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <a 
                    href={`mailto:${cardData.email}`}
                    className="text-sm text-primary-600 hover:underline break-all"
                  >
                    {cardData.email}
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <EyeOff className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm text-gray-400">Not shared publicly</p>
                </div>
              </div>
            )}

            {cardData?.mobile ? (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mobile</p>
                  <a 
                    href={`tel:${cardData.mobile}`}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    {cardData.mobile}
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <EyeOff className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mobile</p>
                  <p className="text-sm text-gray-400">Not shared publicly</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button 
              fullWidth 
              onClick={handleSaveCard}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save to My Contacts'}
            </Button>
            
            {isSaved && (
              <Button 
                variant="secondary" 
                fullWidth 
                icon={MessageCircle}
                onClick={handleStartChat}
              >
                Start Chat
              </Button>
            )}
            
            <Button 
              variant="outline" 
              fullWidth 
              onClick={() => navigate('/business-cards')}
            >
              Go to Business Cards
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900 text-center">
            💡 After saving, you can chat with this contact from your Business Cards page
          </p>
        </Card>
      </div>
    </>
  )
}

export default SharedCard
