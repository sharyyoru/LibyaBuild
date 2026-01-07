import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Activity, Settings, TrendingUp, AlertCircle } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import Card from '../../../components/Card'

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeActivities: 0,
    pendingTasks: 0,
    completedToday: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [usersResult, activitiesResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(5)
      ])

      setStats({
        totalUsers: usersResult.count || 0,
        activeActivities: activitiesResult.data?.filter(a => a.status === 'in_progress').length || 0,
        pendingTasks: activitiesResult.data?.filter(a => a.status === 'pending').length || 0,
        completedToday: activitiesResult.data?.filter(a => 
          a.status === 'completed' && 
          new Date(a.completed_at).toDateString() === new Date().toDateString()
        ).length || 0
      })

      setRecentActivities(activitiesResult.data || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, color, link }) => (
    <Link to={link}>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    </Link>
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your system overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers}
          color="bg-blue-500"
          link="/admin/super/users"
        />
        <StatCard
          icon={Activity}
          title="Active Tasks"
          value={stats.activeActivities}
          color="bg-green-500"
          link="/admin/super/activities"
        />
        <StatCard
          icon={AlertCircle}
          title="Pending Tasks"
          value={stats.pendingTasks}
          color="bg-yellow-500"
          link="/admin/super/activities"
        />
        <StatCard
          icon={TrendingUp}
          title="Completed Today"
          value={stats.completedToday}
          color="bg-purple-500"
          link="/admin/super/activities"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                  activity.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
          <Link to="/admin/super/activities" className="block mt-4 text-center text-primary-600 font-semibold">
            View All Activities →
          </Link>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/super/users/create">
              <button className="w-full p-4 bg-primary-50 hover:bg-primary-100 rounded-lg text-left transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-gray-900">Create New User</span>
                </div>
              </button>
            </Link>
            <Link to="/admin/super/activities/create">
              <button className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Create Activity</span>
                </div>
              </button>
            </Link>
            <Link to="/admin/super/settings">
              <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">System Settings</span>
                </div>
              </button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
