import { useState, useEffect } from 'react'
import { Search, User, Building2, Users, Check, X, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const USER_TYPES = [
  { id: 'visitor', label: 'Visitor', color: 'bg-blue-500', icon: User },
  { id: 'exhibitor', label: 'Exhibitor', color: 'bg-green-500', icon: Building2 },
  { id: 'delegate', label: 'Delegate', color: 'bg-purple-500', icon: Users }
]

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(null)
  const [error, setError] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setUsers([
        { id: '1', email: 'wilson@mutant.ae', name: 'Wilson', user_types: ['visitor'], created_at: new Date().toISOString() },
        { id: '2', email: 'test@example.com', name: 'Test User', user_types: ['visitor', 'delegate'], created_at: new Date().toISOString() }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleUserType = async (userId, typeId) => {
    setSaving(userId)
    const user = users.find(u => u.id === userId)
    if (!user) return

    const currentTypes = user.user_types || []
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter(t => t !== typeId)
      : [...currentTypes, typeId]

    if (newTypes.length === 0) {
      newTypes.push('visitor')
    }

    try {
      const { error: updateError } = await supabase
        .from('app_users')
        .update({ user_types: newTypes })
        .eq('id', userId)

      if (updateError) throw updateError

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, user_types: newTypes } : u
      ))
    } catch (err) {
      console.error('Error updating user:', err)
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, user_types: newTypes } : u
      ))
    } finally {
      setSaving(null)
    }
  }

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Assign user types: Visitor, Exhibitor, Delegate</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by email or name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  {USER_TYPES.map(type => (
                    <th key={type.id} className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {type.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    {USER_TYPES.map(type => {
                      const isActive = (user.user_types || []).includes(type.id)
                      const Icon = type.icon
                      return (
                        <td key={type.id} className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleUserType(user.id, type.id)}
                            disabled={saving === user.id}
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                              isActive 
                                ? `${type.color} text-white` 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            } ${saving === user.id ? 'opacity-50' : ''}`}
                          >
                            {saving === user.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isActive ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">User Types Legend</h3>
        <div className="flex flex-wrap gap-4">
          {USER_TYPES.map(type => {
            const Icon = type.icon
            return (
              <div key={type.id} className="flex items-center gap-2">
                <span className={`${type.color} text-white p-1.5 rounded-full`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-sm text-blue-800">{type.label}</span>
              </div>
            )
          })}
        </div>
        <p className="text-sm text-blue-600 mt-2">
          Users can have multiple types. Click on a type to toggle it on/off.
        </p>
      </div>
    </div>
  )
}

export default UserManagement
