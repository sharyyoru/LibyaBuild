import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, User, Briefcase, Mail, Phone, Download, Camera, X, MessageCircle, Scan, CreditCard, Loader2, Eye, EyeOff, Trash2, Share2, Check, AlertCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import { getPublicUserProfile, saveScannedCard, getScannedCards, deleteScannedCard, getUserProfile } from '../lib/supabase'

// Simple OCR service for business card scanning
const extractBusinessCardData = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  
  // Extract email
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/gi
  const emails = text.match(emailRegex) || []
  
  // Extract phone numbers
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}/g
  const phones = text.match(phoneRegex) || []
  
  // Try to identify name (usually first non-email, non-phone line)
  let name = ''
  let company = ''
  let role = ''
  
  for (const line of lines) {
    if (emails.some(e => line.includes(e))) continue
    if (phones.some(p => line.includes(p))) continue
    if (line.toLowerCase().includes('www.') || line.toLowerCase().includes('http')) continue
    
    // First meaningful line is likely the name
    if (!name && line.length > 2 && line.length < 50) {
      name = line
      continue
    }
    
    // Second line could be role or company
    if (name && !role && line.length > 2) {
      // Check if it looks like a role
      const roleKeywords = ['manager', 'director', 'ceo', 'cto', 'engineer', 'developer', 'consultant', 'executive', 'specialist', 'coordinator', 'officer', 'head', 'lead']
      if (roleKeywords.some(k => line.toLowerCase().includes(k))) {
        role = line
        continue
      }
    }
    
    // Otherwise it might be company
    if (name && !company && line.length > 2) {
      company = line
    }
  }
  
  return {
    name: name || 'Unknown',
    company: company || '',
    role: role || '',
    email: emails[0] || '',
    phone: phones[0] || ''
  }
}

// Scanned User Profile Modal
const UserProfileModal = ({ user, onClose, onStartChat }) => {
  if (!user) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-600 to-accent-600 p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {user.profilePhotoUrl ? (
            <img 
              src={user.profilePhotoUrl} 
              alt={user.name} 
              className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-white/30"
            />
          ) : (
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-12 h-12 text-white" />
            </div>
          )}
          
          <h2 className="text-xl font-bold">{user.name}</h2>
          {user.role && <p className="text-white/80 text-sm">{user.role}</p>}
          {user.company && <p className="text-white/80 text-sm">{user.company}</p>}
        </div>
        
        {/* Contact Info */}
        <div className="p-6 space-y-4">
          {user.email ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
              </div>
              <Eye className="w-4 h-4 text-green-500" />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-60">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-400 italic">Private</p>
              </div>
              <EyeOff className="w-4 h-4 text-gray-400" />
            </div>
          )}
          
          {user.phone ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Mobile</p>
                <p className="text-sm font-medium text-gray-900">{user.phone}</p>
              </div>
              <Eye className="w-4 h-4 text-green-500" />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-60">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Mobile</p>
                <p className="text-sm text-gray-400 italic">Private</p>
              </div>
              <EyeOff className="w-4 h-4 text-gray-400" />
            </div>
          )}
          
          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onStartChat(user)}
              className="py-3 px-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const BusinessCards = () => {
  const navigate = useNavigate()
  const { userProfile, businessCards, addBusinessCard } = useApp()
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  
  const [activeTab, setActiveTab] = useState('myCard') // 'myCard', 'scan', 'collected'
  const [scanMode, setScanMode] = useState(null) // 'qr', 'ocr'
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [scannedCards, setScannedCards] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [manualInput, setManualInput] = useState('')
  const [extendedProfile, setExtendedProfile] = useState(null)
  
  // Load scanned cards and user's extended profile
  useEffect(() => {
    if (user?.id) {
      loadScannedCards()
      loadExtendedProfile()
    }
  }, [user?.id])
  
  const loadScannedCards = async () => {
    const { data } = await getScannedCards(user.id)
    setScannedCards(data || [])
  }
  
  const loadExtendedProfile = async () => {
    const { data } = await getUserProfile(user.id)
    setExtendedProfile(data)
  }
  
  // Handle QR code scan result
  const handleQRScan = async (qrData) => {
    setIsProcessing(true)
    setError('')
    
    try {
      let parsedData
      try {
        parsedData = JSON.parse(qrData)
      } catch {
        // Not JSON, treat as user ID
        parsedData = { userId: qrData }
      }
      
      // If we have a user ID, fetch their public profile
      if (parsedData.userId || parsedData.user_id || parsedData.qr) {
        const userId = parsedData.userId || parsedData.user_id || parsedData.qr
        const { data: publicProfile } = await getPublicUserProfile(userId)
        
        const cardData = {
          scannedUserId: userId,
          name: parsedData.name || 'Event Attendee',
          company: parsedData.company || '',
          role: parsedData.role || '',
          email: publicProfile?.email || '',
          phone: publicProfile?.mobile || '',
          source: 'qr',
          rawData: qrData,
          profilePhotoUrl: publicProfile?.profile_photo_url
        }
        
        // Save to database
        await saveScannedCard(user.id, cardData)
        
        // Add to local state
        addBusinessCard({
          id: Date.now(),
          ...cardData,
          scannedAt: new Date().toISOString()
        })
        
        // Show user profile modal
        setSelectedUser({
          ...cardData,
          email: publicProfile?.email,
          phone: publicProfile?.mobile
        })
        
        await loadScannedCards()
        setSuccess('Contact added successfully!')
        setScanMode(null)
      } else {
        // Regular business card data
        const cardData = {
          name: parsedData.name || 'Unknown',
          company: parsedData.company || '',
          role: parsedData.role || parsedData.title || '',
          email: parsedData.email || '',
          phone: parsedData.phone || parsedData.mobile || '',
          source: 'qr',
          rawData: qrData
        }
        
        await saveScannedCard(user.id, cardData)
        addBusinessCard({
          id: Date.now(),
          ...cardData,
          scannedAt: new Date().toISOString()
        })
        
        await loadScannedCards()
        setSuccess('Contact added successfully!')
        setScanMode(null)
      }
    } catch (err) {
      console.error('QR scan error:', err)
      setError('Failed to process QR code')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Handle OCR image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsProcessing(true)
    setError('')
    
    try {
      // Use OCR.space free API for text extraction
      const formData = new FormData()
      formData.append('file', file)
      formData.append('apikey', 'K88888888888888') // Free tier API key
      formData.append('language', 'eng')
      formData.append('isOverlayRequired', 'false')
      
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.ParsedResults && result.ParsedResults[0]) {
        const text = result.ParsedResults[0].ParsedText
        const extractedData = extractBusinessCardData(text)
        
        const cardData = {
          ...extractedData,
          source: 'ocr',
          rawData: text
        }
        
        await saveScannedCard(user.id, cardData)
        addBusinessCard({
          id: Date.now(),
          ...cardData,
          scannedAt: new Date().toISOString()
        })
        
        await loadScannedCards()
        setSuccess(`Card scanned! Found: ${extractedData.name}`)
        setScanMode(null)
      } else {
        setError('Could not read text from image. Please try again.')
      }
    } catch (err) {
      console.error('OCR error:', err)
      setError('Failed to scan business card. Please try again.')
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }
  
  // Handle manual QR input
  const handleManualInput = () => {
    if (manualInput.trim()) {
      handleQRScan(manualInput.trim())
      setManualInput('')
    }
  }
  
  // Delete a scanned card
  const handleDeleteCard = async (cardId) => {
    await deleteScannedCard(cardId)
    await loadScannedCards()
  }
  
  // Start chat with user
  const handleStartChat = (contactUser) => {
    setSelectedUser(null)
    if (contactUser.scannedUserId) {
      navigate(`/chat/${contactUser.scannedUserId}`)
    }
  }
  
  // Generate QR code value
  const qrValue = JSON.stringify({
    userId: user?.id,
    qr: userProfile.qrCode,
    name: userProfile.name || 'Event Attendee',
    company: userProfile.company || '',
    role: userProfile.role || ''
  })

  return (
    <>
      <Header title="Business Cards" />
      <div className="p-4 space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {[
            { id: 'myCard', label: 'My Card', icon: CreditCard },
            { id: 'scan', label: 'Scan', icon: Scan },
            { id: 'collected', label: 'Collected', icon: User }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setScanMode(null); setError(''); setSuccess('') }}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <Check className="w-5 h-5 flex-shrink-0" />
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* My Card Tab */}
        {activeTab === 'myCard' && (
          <>
            <Card className="p-6 bg-gradient-to-br from-primary-600 to-accent-500 text-white border-0 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">My Digital Card</h3>
                    <p className="text-sm text-white/80">Let others scan to connect</p>
                  </div>
                  <img src="/media/PNG/App Icons-01.png" alt="Business Card" className="w-12 h-12" />
                </div>
                
                <div className="bg-white rounded-2xl p-4 mb-4">
                  <QRCodeSVG
                    value={qrValue}
                    size={180}
                    className="mx-auto"
                    level="H"
                    includeMargin
                  />
                </div>

                <div className="text-center space-y-1">
                  <p className="font-bold text-lg">{userProfile.name || 'Your Name'}</p>
                  <p className="text-sm text-white/80">{userProfile.role || 'Your Role'}</p>
                  <p className="text-sm text-white/80">{userProfile.company || 'Your Company'}</p>
                </div>
                
                {/* Privacy indicators */}
                <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{extendedProfile?.email_public ? 'Public' : 'Private'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{extendedProfile?.mobile_public ? 'Public' : 'Private'}</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" fullWidth icon={Share2}>
                Share Card
              </Button>
              <Button variant="secondary" fullWidth icon={Download}>
                Save Image
              </Button>
            </div>
          </>
        )}

        {/* Scan Tab */}
        {activeTab === 'scan' && (
          <>
            {!scanMode ? (
              <div className="space-y-4">
                <Card className="p-6 text-center">
                  <Scan className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Scan Business Card</h3>
                  <p className="text-gray-600 text-sm mb-6">Choose how you want to scan</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setScanMode('qr')}
                      className="p-4 bg-primary-50 rounded-2xl border-2 border-primary-200 hover:border-primary-400 transition-colors"
                    >
                      <QrCode className="w-10 h-10 text-primary-600 mx-auto mb-2" />
                      <p className="font-semibold text-primary-700">QR Code</p>
                      <p className="text-xs text-primary-600/70">Scan digital cards</p>
                    </button>
                    <button
                      onClick={() => setScanMode('ocr')}
                      className="p-4 bg-accent-50 rounded-2xl border-2 border-accent-200 hover:border-accent-400 transition-colors"
                    >
                      <Camera className="w-10 h-10 text-accent-600 mx-auto mb-2" />
                      <p className="font-semibold text-accent-700">Photo</p>
                      <p className="text-xs text-accent-600/70">Scan physical cards</p>
                    </button>
                  </div>
                </Card>
              </div>
            ) : scanMode === 'qr' ? (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Scan QR Code</h3>
                  <button onClick={() => setScanMode(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="aspect-square bg-gray-900 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-4 border-2 border-white/50 rounded-xl" />
                  <div className="text-center text-white">
                    <QrCode className="w-16 h-16 opacity-30 mx-auto mb-2" />
                    <p className="text-sm opacity-60">Position QR code in frame</p>
                    <p className="text-xs opacity-40 mt-1">Camera integration coming soon</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">Or enter the code manually:</p>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Paste QR code data or user ID..."
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button 
                    fullWidth 
                    onClick={handleManualInput}
                    disabled={!manualInput.trim() || isProcessing}
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                    ) : (
                      'Add Contact'
                    )}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Scan Business Card Photo</h3>
                  <button onClick={() => setScanMode(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-primary-400 hover:bg-primary-50 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-3" />
                      <p className="font-medium text-gray-700">Processing image...</p>
                      <p className="text-sm text-gray-500">Extracting contact info</p>
                    </>
                  ) : (
                    <>
                      <Camera className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="font-medium text-gray-700">Tap to take photo</p>
                      <p className="text-sm text-gray-500">or upload from gallery</p>
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  We'll extract name, email, phone, and company from the card
                </p>
              </Card>
            )}
          </>
        )}

        {/* Collected Cards Tab */}
        {activeTab === 'collected' && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">
              Collected Cards ({scannedCards.length + businessCards.length})
            </h3>
            
            {scannedCards.length === 0 && businessCards.length === 0 ? (
              <Card className="p-8 text-center">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No business cards yet</p>
                <p className="text-sm text-gray-400 mt-1">Start scanning to build your network!</p>
                <Button 
                  variant="primary" 
                  className="mt-4"
                  onClick={() => setActiveTab('scan')}
                >
                  Scan Your First Card
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {[...scannedCards, ...businessCards].map(card => (
                  <Card key={card.id} className="p-4 relative overflow-hidden">
                    {/* Source indicator */}
                    <div className={clsx(
                      'absolute top-0 right-0 px-2 py-0.5 text-[10px] font-medium rounded-bl-lg',
                      card.source === 'qr' ? 'bg-primary-100 text-primary-700' : 'bg-accent-100 text-accent-700'
                    )}>
                      {card.source === 'qr' ? 'QR' : 'OCR'}
                    </div>
                    
                    <div className="flex items-start gap-3">
                      {card.profilePhotoUrl ? (
                        <img 
                          src={card.profilePhotoUrl} 
                          alt={card.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-7 h-7 text-primary-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900">{card.name}</h4>
                        {card.role && <p className="text-sm text-gray-600">{card.role}</p>}
                        
                        <div className="mt-2 space-y-1">
                          {card.company && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate">{card.company}</span>
                            </div>
                          )}
                          {card.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate">{card.email}</span>
                            </div>
                          )}
                          {card.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{card.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-400">
                            {format(new Date(card.created_at || card.scannedAt), 'MMM d, h:mm a')}
                          </p>
                          <div className="flex gap-2">
                            {card.scanned_user_id && (
                              <button
                                onClick={() => navigate(`/chat/${card.scanned_user_id}`)}
                                className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)}
        onStartChat={handleStartChat}
      />
    </>
  )
}

export default BusinessCards
