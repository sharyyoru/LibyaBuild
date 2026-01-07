import { useState } from 'react'
import { User, Building2, Briefcase, Heart, Calendar, Mail, Settings, LogOut } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'

const Profile = () => {
  const { userProfile, setUserProfile, favorites, tickets, meetings } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(userProfile)

  const handleSave = () => {
    setUserProfile(formData)
    setIsEditing(false)
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
                <p className="text-gray-500 text-sm">{userProfile.company || 'Your Company'}</p>
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
              </div>
            )}
          </div>

          {!isEditing ? (
            <Button fullWidth variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" fullWidth onClick={() => {
                setFormData(userProfile)
                setIsEditing(false)
              }}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </Card>

        {isEditing && (
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
        )}

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(favorites.exhibitors?.length || 0) + (favorites.sessions?.length || 0) + (favorites.speakers?.length || 0)}
            </p>
            <p className="text-xs text-gray-600">Favorites</p>
          </Card>

          <Card className="p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
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
              <button className="w-full flex items-center gap-3 text-left">
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
