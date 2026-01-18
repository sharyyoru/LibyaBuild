import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Building2, Briefcase, Heart, Calendar, Mail, Settings, LogOut, Globe, Sparkles, QrCode, Shield, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { updateProfile, getVisitorMeetings, getExhibitorFavorites } from '../services/eventxApi'

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
  const { user, logout, isStaff, userLevel } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [meetings, setMeetings] = useState([])
  const [apiFavorites, setApiFavorites] = useState([])
  
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
    } catch (err) {
      console.error('Failed to load profile data:', err)
    } finally {
      setIsLoading(false)
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

  return (
    <>
      <Header title="Profile" showBack={false} />
      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            {!isEditing ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userProfile.name || 'Your Name'}
                </h2>
                <p className="text-gray-600 mb-1">{userProfile.role || 'Your Role'}</p>
                <p className="text-gray-500 text-sm mb-2">{userProfile.company || 'Your Company'}</p>
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

        <Card className="p-4 text-center bg-gray-50">
          <p className="text-sm text-gray-600 mb-1">Libya Build Event App</p>
          <p className="text-xs text-gray-500">Version 1.0.0</p>
        </Card>
      </div>
    </>
  )
}

export default Profile
