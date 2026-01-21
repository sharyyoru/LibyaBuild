import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Building2, Briefcase, Heart, Calendar, Mail, Settings, LogOut, Globe, Sparkles, QrCode, Shield, Loader2, Trash2, AlertTriangle, X, Camera, Phone, Eye, EyeOff, Check } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { updateProfile, getVisitorMeetings, getExhibitorFavorites } from '../services/eventxApi'
import { uploadProfilePhoto, deleteProfilePhoto, saveUserProfile, getUserProfile } from '../lib/supabase'
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

// Visibility Toggle Component
const VisibilityToggle = ({ isPublic, onChange, label }) => (
  <button
    type="button"
    onClick={onChange}
    className={clsx(
      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
      isPublic 
        ? 'bg-green-100 text-green-700 border border-green-200' 
        : 'bg-gray-100 text-gray-500 border border-gray-200'
    )}
  >
    {isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
    {isPublic ? 'Public' : 'Private'}
  </button>
)

const Profile = () => {
  const navigate = useNavigate()
  const { userProfile, setUserProfile, favorites, tickets, meetings: localMeetings } = useApp()
  const { user, logout, deleteAccount, isStaff, userLevel } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [meetings, setMeetings] = useState([])
  const [apiFavorites, setApiFavorites] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  
  // Profile photo state
  const fileInputRef = useRef(null)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  
  // Extended profile state
  const [extendedProfile, setExtendedProfile] = useState({
    email: user?.email || '',
    emailPublic: false,
    mobile: '',
    mobilePublic: false,
    profilePhotoPath: null
  })
  
  // Initialize form data from user or userProfile
  const initialData = {
    name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : userProfile.name || '',
    role: user?.job_title || userProfile.role || '',
    company: user?.company || userProfile.company || '',
    sector: userProfile.sector || '',
    country: user?.country || userProfile.country || '',
    bio: userProfile.bio || '',
    persona: userProfile.persona || 'visitor',
    interests: userProfile.interests || []
  }
  
  const [formData, setFormData] = useState(initialData)

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    setIsLoading(true)
    try {
      const [meetingsData, favoritesData] = await Promise.all([
        getVisitorMeetings(new Date().toISOString().split('T')[0]).catch(() => []),
        getExhibitorFavorites().catch(() => ({ data: [] }))
      ])
      
      const meetingList = meetingsData.data || meetingsData.meetings || meetingsData || []
      setMeetings(Array.isArray(meetingList) ? meetingList : localMeetings)
      
      const favList = favoritesData.data || favoritesData.favorites || []
      setApiFavorites(Array.isArray(favList) ? favList : [])
      
      // Load extended profile from Supabase
      if (user?.id) {
        const { data: profileData } = await getUserProfile(user.id)
        if (profileData) {
          setExtendedProfile({
            email: profileData.email || user?.email || '',
            emailPublic: profileData.email_public || false,
            mobile: profileData.mobile || '',
            mobilePublic: profileData.mobile_public || false,
            profilePhotoPath: profileData.profile_photo_path || null
          })
          if (profileData.profile_photo_url) {
            setProfilePhotoUrl(profileData.profile_photo_url)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load profile data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle profile photo selection
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    // Create preview URL immediately for instant feedback
    const previewUrl = URL.createObjectURL(file)
    setProfilePhotoUrl(previewUrl)
    setIsUploadingPhoto(true)
    setError('')

    try {
      // Delete old photo if exists
      if (extendedProfile.profilePhotoPath) {
        await deleteProfilePhoto(extendedProfile.profilePhotoPath)
      }

      // Upload new photo
      const { data, error: uploadError } = await uploadProfilePhoto(user.id, file)
      
      if (uploadError) throw uploadError

      // Update with actual URL from server
      setProfilePhotoUrl(data.url)
      setExtendedProfile(prev => ({
        ...prev,
        profilePhotoPath: data.path
      }))

      // Save to database
      await saveUserProfile(user.id, {
        profile_photo_path: data.path,
        profile_photo_url: data.url
      })
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl)
    } catch (err) {
      console.error('Failed to upload photo:', err)
      setError('Failed to upload photo. Please try again.')
      // Revert to previous photo on error
      setProfilePhotoUrl(extendedProfile.profilePhotoPath ? null : null)
      URL.revokeObjectURL(previewUrl)
    } finally {
      setIsUploadingPhoto(false)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Handle removing profile photo
  const handleRemovePhoto = async () => {
    if (!extendedProfile.profilePhotoPath) return

    setIsUploadingPhoto(true)
    try {
      await deleteProfilePhoto(extendedProfile.profilePhotoPath)
      
      setProfilePhotoUrl(null)
      setExtendedProfile(prev => ({
        ...prev,
        profilePhotoPath: null
      }))

      // Update database
      await saveUserProfile(user.id, {
        profile_photo_path: null,
        profile_photo_url: null
      })
    } catch (err) {
      console.error('Failed to remove photo:', err)
      setError('Failed to remove photo')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const personas = [
    { id: 'visitor', label: 'Visitor', icon: User, description: 'Browse and network' },
    { id: 'exhibitor', label: 'Exhibitor', icon: Building2, description: 'Showcase products' },
    { id: 'media', label: 'Media', icon: Mail, description: 'Press coverage' }
  ]

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    
    try {
      // Parse name into first and last
      const nameParts = formData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      await updateProfile({
        firstName,
        lastName,
        company: formData.company,
        jobTitle: formData.role
      })
      
      // Save extended profile to Supabase
      if (user?.id) {
        await saveUserProfile(user.id, {
          email: extendedProfile.email,
          email_public: extendedProfile.emailPublic,
          mobile: extendedProfile.mobile,
          mobile_public: extendedProfile.mobilePublic,
          profile_photo_path: extendedProfile.profilePhotoPath,
          profile_photo_url: profilePhotoUrl
        })
      }
      
      setUserProfile(formData)
      setIsEditing(false)
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

  const interests = [
    'Construction Equipment',
    'Building Materials',
    'Smart Technology',
    'Architecture',
    'Sustainability',
    'Steel & Metal',
    'Energy Solutions',
    'IoT Systems'
  ]

  const toggleInterest = (interest) => {
    const current = formData.interests || []
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest]
    setFormData({ ...formData, interests: updated })
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
      <Header title="Profile" showBack={false} />
      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            {/* Profile Photo */}
            <div className="relative mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              {profilePhotoUrl ? (
                <div className="relative">
                  <img 
                    src={profilePhotoUrl} 
                    alt="Profile" 
                    className={clsx(
                      "w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg transition-all",
                      isUploadingPhoto && "opacity-50"
                    )}
                  />
                  {/* Upload overlay animation */}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-3xl">
                      <Loader2 className="w-8 h-8 text-white animate-spin mb-1" />
                      <span className="text-white text-xs font-medium">Uploading...</span>
                    </div>
                  )}
                  {isEditing && !isUploadingPhoto && (
                    <button
                      onClick={handleRemovePhoto}
                      disabled={isUploadingPhoto}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className={clsx(
                    "w-24 h-24 bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl flex items-center justify-center",
                    isUploadingPhoto && "opacity-50"
                  )}>
                    <User className="w-12 h-12 text-white" />
                  </div>
                  {/* Upload overlay animation for empty state */}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-3xl">
                      <Loader2 className="w-8 h-8 text-white animate-spin mb-1" />
                      <span className="text-white text-xs font-medium">Uploading...</span>
                    </div>
                  )}
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className={clsx(
                    "absolute -bottom-2 -right-2 w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors",
                    isUploadingPhoto ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-700"
                  )}
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {!isEditing ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userProfile.name || 'Your Name'}
                </h2>
                <p className="text-gray-600 mb-1">{userProfile.role || 'Your Role'}</p>
                <p className="text-gray-500 text-sm mb-2">{userProfile.company || 'Your Company'}</p>
                
                {/* Contact Info Display */}
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {extendedProfile.email && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[150px]">{extendedProfile.email}</span>
                      {extendedProfile.emailPublic ? (
                        <span className="text-green-600 text-xs">(Public)</span>
                      ) : (
                        <span className="text-gray-400 text-xs">(Private)</span>
                      )}
                    </div>
                  )}
                  {extendedProfile.mobile && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{extendedProfile.mobile}</span>
                      {extendedProfile.mobilePublic ? (
                        <span className="text-green-600 text-xs">(Public)</span>
                      ) : (
                        <span className="text-gray-400 text-xs">(Private)</span>
                      )}
                    </div>
                  )}
                </div>

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
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Your Role"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your Company"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                {/* Email with Visibility Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <VisibilityToggle
                      isPublic={extendedProfile.emailPublic}
                      onChange={() => setExtendedProfile(prev => ({ ...prev, emailPublic: !prev.emailPublic }))}
                    />
                  </div>
                  <input
                    type="email"
                    value={extendedProfile.email}
                    onChange={(e) => setExtendedProfile({ ...extendedProfile, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500">
                    {extendedProfile.emailPublic 
                      ? '✓ Visible on your business card' 
                      : 'Hidden from your business card'}
                  </p>
                </div>

                {/* Mobile with Visibility Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Mobile Number
                    </label>
                    <VisibilityToggle
                      isPublic={extendedProfile.mobilePublic}
                      onChange={() => setExtendedProfile(prev => ({ ...prev, mobilePublic: !prev.mobilePublic }))}
                    />
                  </div>
                  <input
                    type="tel"
                    value={extendedProfile.mobile}
                    onChange={(e) => setExtendedProfile({ ...extendedProfile, mobile: e.target.value })}
                    placeholder="+218 91 123 4567"
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500">
                    {extendedProfile.mobilePublic 
                      ? '✓ Visible on your business card' 
                      : 'Hidden from your business card'}
                  </p>
                </div>

                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Sector</option>
                  {sectors.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief bio..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}
          
          {!isEditing ? (
            <Button fullWidth variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" fullWidth onClick={() => {
                setFormData(initialData)
                setIsEditing(false)
              }} disabled={isSaving}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Save Changes'}
              </Button>
            </div>
          )}
        </Card>

        {isEditing && (
          <>
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                Select Your Persona
              </h3>
              <p className="text-sm text-gray-600 mb-3">This determines your app experience</p>
              <div className="grid grid-cols-3 gap-2">
                {personas.map(persona => {
                  const Icon = persona.icon
                  const isSelected = formData.persona === persona.id
                  return (
                    <button
                      key={persona.id}
                      onClick={() => setFormData({ ...formData, persona: persona.id })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                      <p className={`text-xs font-semibold ${isSelected ? 'text-primary-600' : 'text-gray-700'}`}>
                        {persona.label}
                      </p>
                    </button>
                  )
                })}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">Interests</h3>
              <p className="text-sm text-gray-600 mb-3">Select topics for personalized recommendations</p>
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => {
                const isSelected = (formData.interests || []).includes(interest)
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                )
              })}
            </div>
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
            <p className="text-xs text-gray-600">Favorites</p>
          </Card>

          <Card className="p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{meetings.length || localMeetings.length}</p>
            <p className="text-xs text-gray-600">Meetings</p>
          </Card>

          <Card className="p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
            <p className="text-xs text-gray-600">Tickets</p>
          </Card>
        </div>

        {/* Staff Scanner Access */}
        {isStaff && (
          <Card className="p-4 bg-gradient-to-r from-primary-600 to-accent-600 border-0">
            <div className="flex items-center gap-3 text-white mb-3">
              <Shield className="w-6 h-6" />
              <div>
                <p className="font-bold">Staff Access</p>
                <p className="text-sm text-white/80">You have scanner privileges</p>
              </div>
            </div>
            <button 
              className="w-full py-3 px-4 bg-white rounded-xl font-bold text-primary-600 hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors"
              onClick={() => navigate('/scanner')}
            >
              <QrCode className="w-5 h-5" />
              Open Scanner
            </button>
          </Card>
        )}

        <div>
          <h3 className="font-bold text-gray-900 mb-3">Settings</h3>
          <div className="space-y-2">
            <Card className="p-4">
              <button className="w-full flex items-center gap-3 text-left">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="flex-1 font-medium text-gray-900">App Settings</span>
              </button>
            </Card>
            <Card className="p-4">
              <button className="w-full flex items-center gap-3 text-left">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="flex-1 font-medium text-gray-900">Notifications</span>
              </button>
            </Card>
            <Card className="p-4 border-red-100">
              <button 
                className="w-full flex items-center gap-3 text-left"
                onClick={() => logout()}
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="flex-1 font-medium text-red-600">Sign Out</span>
              </button>
            </Card>
          </div>
        </div>

        {/* Delete Account Section */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Danger Zone</h3>
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Delete Account</p>
                <p className="text-sm text-red-600 mt-1">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
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
                <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
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
                  <p className="text-gray-900 font-medium">Are you sure you want to delete your account?</p>
                  <p className="text-sm text-gray-600 mt-1">This will permanently delete your profile, meetings, favorites, and all associated data. You will not be able to recover your account.</p>
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
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <Card className="p-4 text-center bg-gray-50">
          <p className="text-sm text-gray-600 mb-1">Libya Build Event App</p>
          <p className="text-xs text-gray-500">Version 1.0.0</p>
        </Card>
      </div>
    </>
  )
}

export default Profile
