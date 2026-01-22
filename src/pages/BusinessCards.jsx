import { useState, useEffect, useRef } from 'react'
import { QrCode, User, Briefcase, Mail, Phone, Download, Share2, MessageCircle, EyeOff, Camera, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import { saveScannedCard, getScannedCards, getPublicUserProfile, getUserProfile } from '../lib/supabase'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const BusinessCards = () => {
  const { userProfile } = useApp()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation(language)
  const navigate = useNavigate()
  const [showScanner, setShowScanner] = useState(false)
  const [scannedCode, setScannedCode] = useState('')
  const [businessCards, setBusinessCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [myQRData, setMyQRData] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const userId = user?.id || user?.user_id || user?.visitor_id
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      // Load scanned cards from Supabase
      const { data: cards } = await getScannedCards(userId)
      setBusinessCards(cards || [])

      // Load user profile for QR code
      const { data: profile } = await getUserProfile(userId)
      if (profile) {
        setMyQRData({
          userId: userId,
          name: userProfile.name || user?.first_name || 'Event Attendee',
          company: userProfile.company || user?.company || 'Company',
          role: userProfile.role || user?.job_title || 'Professional',
          email: profile.email_public ? profile.email : null,
          mobile: profile.mobile_public ? profile.mobile : null,
          photo: profile.profile_photo_url
        })
      }
    } catch (err) {
      console.error('Failed to load business cards:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScan = async () => {
    if (!scannedCode.trim()) return

    const userId = user?.id || user?.user_id || user?.visitor_id
    if (!userId) return

    try {
      // Parse QR code data
      const qrData = JSON.parse(scannedCode)
      const scannedUserId = qrData.userId

      // Fetch public profile of scanned user
      let publicProfile = null
      if (scannedUserId) {
        const { data } = await getPublicUserProfile(scannedUserId)
        publicProfile = data
      }

      // Save to Supabase
      const cardData = {
        scannedUserId: scannedUserId,
        name: qrData.name || 'Scanned Contact',
        company: qrData.company || 'Company',
        role: qrData.role || 'Professional',
        email: publicProfile?.email || qrData.email || null,
        phone: publicProfile?.mobile || qrData.mobile || null,
        source: 'qr',
        rawData: scannedCode
      }

      const { data: savedCard } = await saveScannedCard(userId, cardData)
      if (savedCard) {
        setBusinessCards(prev => [savedCard, ...prev])
      }

      setScannedCode('')
      setShowScanner(false)
    } catch (err) {
      console.error('Failed to scan card:', err)
      // Fallback to simple save
      const cardData = {
        name: 'Scanned Contact',
        company: 'Company',
        role: 'Professional',
        email: null,
        phone: null,
        source: 'qr',
        rawData: scannedCode
      }
      const { data: savedCard } = await saveScannedCard(userId, cardData)
      if (savedCard) {
        setBusinessCards(prev => [savedCard, ...prev])
      }
      setScannedCode('')
      setShowScanner(false)
    }
  }

  const handleShareCard = async () => {
    const qrString = JSON.stringify(myQRData || {
      userId: user?.id || user?.user_id || user?.visitor_id,
      name: userProfile.name || 'Event Attendee',
      company: userProfile.company || 'Company',
      role: userProfile.role || 'Professional'
    })

    const shareData = {
      title: `${myQRData?.name || 'Business Card'}`,
      text: `Connect with me at Libya Build 2026\n\nQR Code Data:\n${qrString}`,
      url: window.location.origin + '/business-cards'
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        // Fallback: copy QR string to clipboard
        await navigator.clipboard.writeText(qrString)
        alert('Card QR code data copied to clipboard! You can share this with others.')
      } else {
        // Final fallback: show QR string in alert
        alert('QR Code Data:\n\n' + qrString + '\n\nCopy this text to share with others.')
      }
    } catch (err) {
      console.error('Error sharing:', err)
      // Final fallback: copy to clipboard or show
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(qrString)
          alert('Card QR code data copied to clipboard!')
        } else {
          alert('QR Code Data:\n\n' + qrString + '\n\nCopy this text to share with others.')
        }
      } catch (clipErr) {
        console.error('Clipboard error:', clipErr)
        alert('QR Code Data:\n\n' + qrString + '\n\nCopy this text to share with others.')
      }
    }
  }

  const handleStartChat = (card) => {
    if (card.scanned_user_id) {
      navigate(`/chat/${card.scanned_user_id}`)
    }
  }

  const startCamera = async () => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
        
        // Start scanning for QR codes
        scanQRCode()
      }
    } catch (err) {
      console.error('Camera error:', err)
      setCameraError('Could not access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
    setShowScanner(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      try {
        // Simple QR detection - in production, use jsQR library
        // For now, we'll keep the manual entry as primary method
      } catch (err) {
        console.error('QR scan error:', err)
      }
    }

    if (isCameraActive) {
      requestAnimationFrame(scanQRCode)
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <>
      <Header title={t('businessCards')} />
      <div className="p-4 space-y-4">
        <Card className="p-6 bg-gradient-to-br from-primary-600 to-accent-500 text-white border-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">{t('myDigitalCard')}</h3>
              <p className="text-sm text-white/80">{t('shareContactInfo')}</p>
            </div>
            <img src="/media/PNG/App Icons-01.png" alt="Business Card" className="w-12 h-12" />
          </div>
          
          <div className="bg-white rounded-2xl p-4 mb-4">
            <QRCodeSVG
              value={JSON.stringify(myQRData || {
                userId: user?.id || user?.user_id || user?.visitor_id,
                name: userProfile.name || 'Event Attendee',
                company: userProfile.company || 'Company Name',
                role: userProfile.role || 'Professional'
              })}
              size={180}
              className="mx-auto"
              level="H"
            />
          </div>

          <div className="text-center space-y-1">
            <p className="font-bold text-lg">{userProfile.name || 'Your Name'}</p>
            <p className="text-sm text-white/80">{userProfile.role || 'Your Role'}</p>
            <p className="text-sm text-white/80">{userProfile.company || 'Your Company'}</p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            fullWidth
            icon={QrCode}
            onClick={() => setShowScanner(!showScanner)}
          >
            {t('scanCard')}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            icon={Share2}
            onClick={handleShareCard}
          >
            {t('shareCard')}
          </Button>
        </div>

        {showScanner && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">{t('scanQRCode')}</h3>
              <button
                onClick={stopCamera}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="relative aspect-square bg-gray-900 rounded-2xl mb-4 overflow-hidden">
              {!isCameraActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <Camera className="w-16 h-16 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-300 mb-3">{t('cameraView')}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Start Camera
                  </button>
                  {cameraError && (
                    <p className="text-xs text-red-400 mt-2">{cameraError}</p>
                  )}
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 border-4 border-primary-500 border-dashed rounded-2xl pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 bg-black/50 backdrop-blur-sm rounded-xl p-2">
                    <p className="text-xs text-white text-center">Point camera at QR code or enter manually below</p>
                  </div>
                </>
              )}
            </div>
            
            <input
              type="text"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              placeholder={t('enterManually')}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" fullWidth onClick={stopCamera}>
                {t('cancel')}
              </Button>
              <Button fullWidth onClick={handleScan} disabled={!scannedCode.trim()}>
                {t('addContact')}
              </Button>
            </div>
          </Card>
        )}

        <div>
          <h3 className="font-bold text-gray-900 mb-3">
            {t('collectedCards')} ({businessCards.length})
          </h3>
          {isLoading ? (
            <Card className="p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
              <p className="text-gray-500">Loading cards...</p>
            </Card>
          ) : businessCards.length === 0 ? (
            <Card className="p-8 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('noBusinessCards')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('startNetworking')}</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {businessCards.map(card => (
                <Card key={card.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900">{card.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{card.role}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Briefcase className="w-3 h-3" />
                        <span>{card.company}</span>
                      </div>
                      {card.email ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{card.email}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                          <EyeOff className="w-3 h-3" />
                          <span className="text-xs">{t('contactHidden')}</span>
                        </div>
                      )}
                      {card.phone ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{card.phone}</span>
                        </div>
                      ) : null}
                      <p className="text-xs text-gray-400 mt-2">
                        {t('scanned')} {format(new Date(card.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  {card.scanned_user_id && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleStartChat(card)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {t('startChat')}
                      </button>
                      <button
                        onClick={() => {
                          const shareData = { title: card.name, text: `${card.name} - ${card.company}`, url: window.location.href }
                          if (navigator.share) navigator.share(shareData).catch(() => {})
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default BusinessCards
