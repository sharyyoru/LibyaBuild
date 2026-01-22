import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Building2, Briefcase, Heart, Calendar, Mail, Settings, LogOut, Globe, Sparkles, QrCode, Shield, Loader2, Trash2, AlertTriangle, X, Camera, Upload } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import { updateProfile, getVisitorMeetings, getExhibitorFavorites, getIndustries } from '../services/eventxApi'
import { saveUserProfile, getUserProfile, uploadProfilePhoto, deleteProfilePhoto, saveUserInterests, getUserInterests } from '../lib/supabase'
import { clsx } from 'clsx'

const sectors = [
  'Architecture',
  'Building & Construction Materials',
  'Engineering',
  'Interior Design',
  'Mechanical',
  'Real Estate',
  'Windows, Door & Facades'
]

const countries = [
  'Libya', 'Egypt', 'Tunisia', 'Algeria', 'Morocco',
  'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain',
  'Turkey', 'Italy', 'Germany', 'China', 'USA', 'UK'
]

const Profile = () => {
  const navigate = useNavigate()
  const { userProfile, setUserProfile, favorites, tickets, meetings: localMeetings } = useApp()
  const { user, logout, deleteAccount, isStaff, userLevel } = useAuth()
  const { language, changeLanguage } = useLanguage()
  const { t } = useTranslation(language)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [meetings, setMeetings] = useState([])
  const [apiFavorites, setApiFavorites] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [supabaseProfile, setSupabaseProfile] = useState(null)
  const [industries, setIndustries] = useState([])
  const [selectedIndustries, setSelectedIndustries] = useState([])
  const fileInputRef = useRef(null)
  
  // Initialize form data from user or userProfile
  const initialData = {
    name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : userProfile.name || '',
    role: user?.job_title || userProfile.role || '',
    company: user?.company || userProfile.company || '',
    sector: userProfile.sector || '',
    country: user?.country || userProfile.country || '',
    bio: userProfile.bio || '',
    persona: userProfile.persona || 'visitor',
    interests: userProfile.interests || [],
    email: user?.email || '',
    mobile: user?.mobile || user?.phone || '',
    emailPublic: false,
    mobilePublic: false
  }
  
  const [formData, setFormData] = useState(initialData)

  useEffect(() => {
    loadProfileData()
    loadIndustries()
  }, [])

  const loadProfileData = async () => {
    setIsLoading(true)
    try {
      const userId = user?.id || user?.user_id || user?.visitor_id
      
      const [meetingsData, favoritesData, supabaseProfileData] = await Promise.all([
        getVisitorMeetings(new Date().toISOString().split('T')[0]).catch(() => []),
        getExhibitorFavorites().catch(() => ({ data: [] })),
        userId ? getUserProfile(userId).catch(() => ({ data: null })) : Promise.resolve({ data: null })
      ])
      
      const meetingList = meetingsData.data || meetingsData.meetings || meetingsData || []
      setMeetings(Array.isArray(meetingList) ? meetingList : localMeetings)
      
      const favList = favoritesData.data || favoritesData.favorites || []
      setApiFavorites(Array.isArray(favList) ? favList : [])
      
      // Load Supabase profile data and interests
      if (supabaseProfileData.data) {
        setSupabaseProfile(supabaseProfileData.data)
        setFormData(prev => ({
          ...prev,
          email: supabaseProfileData.data.email || prev.email,
          mobile: supabaseProfileData.data.mobile || prev.mobile,
          emailPublic: supabaseProfileData.data.email_public || false,
          mobilePublic: supabaseProfileData.data.mobile_public || false
        }))
        if (supabaseProfileData.data.profile_photo_url) {
          setImagePreview(supabaseProfileData.data.profile_photo_url)
        }
      }
      
      // Load user interests
      if (userId) {
        const interestsResult = await getUserInterests(userId).catch(() => ({ data: [] }))
        if (interestsResult.data) {
          const industryIds = interestsResult.data.map(i => i.industry_id)
          setSelectedIndustries(industryIds)
        }
      }
    } catch (err) {
      console.error('Failed to load profile data:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadIndustries = async () => {
    try {
      const response = await getIndustries()
      const industryList = response.data || response.industries || response || []
      setIndustries(Array.isArray(industryList) ? industryList : [])
    } catch (err) {
      console.error('Failed to load industries:', err)
    }
  }

  const personas = [
    { id: 'visitor', label: 'Visitor', icon: User, description: 'Browse and network' },
    { id: 'exhibitor', label: 'Exhibitor', icon: Building2, description: 'Showcase products' },
    { id: 'media', label: 'Media', icon: Mail, description: 'Press coverage' }
  ]
  
  // Determine user persona based on company type
  const getUserPersona = () => {
    if (user?.company_id) {
      // Check if user is exhibitor based on company relationship
      return 'exhibitor'
    }
    // Default to visitor
    return 'visitor'
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    
    try {
      const userId = user?.id || user?.user_id || user?.visitor_id
      
      // Parse name into first and last
      const nameParts = formData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Upload profile image to Supabase if changed
      let photoUrl = imagePreview
      let photoPath = supabaseProfile?.profile_photo_path
      
      if (profileImage && userId) {
        // Delete old photo if exists
        if (photoPath) {
          await deleteProfilePhoto(photoPath).catch(err => console.warn('Could not delete old photo:', err))
        }
        
        // Upload new photo
        const uploadResult = await uploadProfilePhoto(userId, profileImage)
        if (uploadResult.data) {
          photoUrl = uploadResult.data.url
          photoPath = uploadResult.data.path
        }
      }
      
      // Save to EventX API
      await updateProfile({
        firstName,
        lastName,
        email: formData.email || user?.email,
        company: formData.company,
        jobTitle: formData.role,
        image: profileImage
      })
      
      // Save to Supabase user_profiles and interests
      if (userId) {
        await saveUserProfile(userId, {
          email: formData.email,
          email_public: formData.emailPublic,
          mobile: formData.mobile,
          mobile_public: formData.mobilePublic,
          profile_photo_path: photoPath,
          profile_photo_url: photoUrl
        })
        
        // Save user interests
        await saveUserInterests(userId, selectedIndustries)
      }
      
      setUserProfile(formData)
      setIsEditing(false)
      setProfileImage(null)
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError(err.message || 'Failed to save profile')
      // Still save locally
      setUserProfile(formData)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleIndustry = (industryId) => {
    setSelectedIndustries(prev => 
      prev.includes(industryId)
        ? prev.filter(id => id !== industryId)
        : [...prev, industryId]
    )
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setDeleteError('')
    
    try {
      const result = await deleteAccount()
      
      if (result.success) {
        // Navigate to login page after successful deletion
        navigate('/login', { replace: true })
      } else {
        setDeleteError(result.error || 'Failed to delete account')
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Header title={t('profile')} showBack={false} />
      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : user?.image ? (
                  <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {!isEditing ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userProfile.name || t('yourName')}
                </h2>
                <p className="text-gray-600 mb-1">{userProfile.role || t('yourRole')}</p>
                <p className="text-gray-500 text-sm mb-2">{userProfile.company || t('yourCompany')}</p>
                {userProfile.sector && (
                  <div className="flex gap-2">
                    <Badge variant="primary" size="sm">{userProfile.sector}</Badge>
                    {userProfile.country && <Badge size="sm">{userProfile.country}</Badge>}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('yourName')}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder={t('yourRole')}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder={t('yourCompany')}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t('selectSector')}</option>
                  {sectors.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t('selectCountry')}</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={t('briefBio')}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('email')}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">{t('showEmailOnCard')}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, emailPublic: !formData.emailPublic })}
                    className={clsx(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      formData.emailPublic ? 'bg-primary-600' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        formData.emailPublic ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder={t('mobile')}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">{t('showMobileOnCard')}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mobilePublic: !formData.mobilePublic })}
                    className={clsx(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      formData.mobilePublic ? 'bg-primary-600' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        formData.mobilePublic ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {imagePreview && isEditing && (
            <div className="mb-4">
              <button
                onClick={handleRemoveImage}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 mx-auto"
              >
                <X className="w-4 h-4" />
                {t('removePhoto')}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}
          
          {!isEditing ? (
            <Button fullWidth variant="outline" onClick={() => setIsEditing(true)}>
              {t('editProfile')}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" fullWidth onClick={() => {
                setFormData(initialData)
                setIsEditing(false)
              }} disabled={isSaving}>
                {t('cancel')}
              </Button>
              <Button fullWidth onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t('saving')}</> : t('saveChanges')}
              </Button>
            </div>
          )}
        </Card>

        {isEditing && (
          <>
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                {t('selectYourPersona')}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{t('personaDescription')}</p>
              <div className="grid grid-cols-3 gap-2">
                {personas.map(persona => {
                  const Icon = persona.icon
                  const currentPersona = getUserPersona()
                  const isSelected = currentPersona === persona.id
                  return (
                    <div
                      key={persona.id}
                      className={`p-3 rounded-xl border-2 ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 bg-gray-50 opacity-50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                      <p className={`text-xs font-semibold ${isSelected ? 'text-primary-600' : 'text-gray-700'}`}>
                        {persona.label}
                      </p>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                <Shield className="w-3 h-3 inline mr-1" />
                {t('personaCannotChange') || 'Your persona is determined by your registration type and cannot be changed'}
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">{t('interests')}</h3>
              <p className="text-sm text-gray-600 mb-3">{t('selectIndustriesInterest') || 'Select industries you are interested in'}</p>
              {industries.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500 text-sm">Loading industries...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {industries.map(industry => {
                    const industryId = industry.id
                    const industryName = language === 'ar' ? (industry.ar_name || industry.name) : industry.name
                    const isSelected = selectedIndustries.includes(industryId)
                    return (
                      <button
                        key={industryId}
                        onClick={() => toggleIndustry(industryId)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        }`}
                      >
                        {industryName}
                      </button>
                    )
                  })}
                </div>
              )}
            </Card>
          </>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {apiFavorites.length || (favorites.exhibitors?.length || 0) + (favorites.sessions?.length || 0) + (favorites.speakers?.length || 0)}
            </p>
            <p className="text-xs text-gray-600">{t('favorites')}</p>
          </Card>

          <Card className="p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{meetings.length || localMeetings.length}</p>
            <p className="text-xs text-gray-600">{t('meetings')}</p>
          </Card>

          <Card className="p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
            <p className="text-xs text-gray-600">{t('tickets')}</p>
          </Card>
        </div>

        {/* Staff Scanner Access */}
        {isStaff && (
          <Card className="p-4 bg-gradient-to-r from-primary-600 to-accent-600 border-0">
            <div className="flex items-center gap-3 text-white mb-3">
              <Shield className="w-6 h-6" />
              <div>
                <p className="font-bold">{t('staffAccess')}</p>
                <p className="text-sm text-white/80">{t('scannerPrivileges')}</p>
              </div>
            </div>
            <button 
              className="w-full py-3 px-4 bg-white rounded-xl font-bold text-primary-600 hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors"
              onClick={() => navigate('/scanner')}
            >
              <QrCode className="w-5 h-5" />
              {t('openScanner')}
            </button>
          </Card>
        )}

        <div>
          <h3 className="font-bold text-gray-900 mb-3">{t('settings')}</h3>
          <div className="space-y-2">
            <Card className="p-4">
              <button className="w-full flex items-center gap-3 text-left">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="flex-1 font-medium text-gray-900">{t('appSettings')}</span>
              </button>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="flex-1 font-medium text-gray-900">{t('selectLanguage')}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      language === 'en'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => changeLanguage('ar')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      language === 'ar'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    AR
                  </button>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <button className="w-full flex items-center gap-3 text-left">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="flex-1 font-medium text-gray-900">{t('notifications')}</span>
              </button>
            </Card>
            <Card className="p-4 border-red-100">
              <button 
                className="w-full flex items-center gap-3 text-left"
                onClick={() => logout()}
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="flex-1 font-medium text-red-600">{t('signOut')}</span>
              </button>
            </Card>
          </div>
        </div>

        {/* Delete Account Section */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">{t('dangerZone')}</h3>
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800">{t('deleteAccount')}</p>
                <p className="text-sm text-red-600 mt-1">{t('deleteAccountWarning')}</p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('deleteMyAccount')}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{t('deleteAccount')}</h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteError('')
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isDeleting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{t('areYouSure')}</p>
                  <p className="text-sm text-gray-600 mt-1">{t('deleteAccountConfirm')}</p>
                </div>
              </div>

              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                  {deleteError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteError('')
                  }}
                  disabled={isDeleting}
                  className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('deleting')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      {t('deleteAccount')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <Card className="p-4 text-center bg-gray-50">
          <p className="text-sm text-gray-600 mb-1">{t('libyaBuildEventApp')}</p>
          <p className="text-xs text-gray-500">{t('version')}</p>
        </Card>
      </div>
    </>
  )
}

export default Profile
