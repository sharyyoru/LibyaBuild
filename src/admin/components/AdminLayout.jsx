import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  DollarSign, 
  Settings, 
  Package, 
  MessageSquare,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const AdminLayout = () => {
  const { profile, signOut, roleDisplayName } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const getNavItems = () => {
    const roleName = profile?.user_roles?.name

    switch (roleName) {
      case 'super_admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/super/dashboard' },
          { icon: Users, label: 'Users', path: '/admin/super/users' },
          { icon: FileText, label: 'Activities', path: '/admin/super/activities' },
          { icon: Settings, label: 'Settings', path: '/admin/super/settings' },
        ]
      case 'local_sales':
      case 'international_sales':
        const locale = roleName.includes('local') ? 'local' : 'international'
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: `/admin/sales/${locale}/dashboard` },
          { icon: FileText, label: 'Applications', path: `/admin/sales/${locale}/applications` },
          { icon: FileText, label: 'Contracts', path: `/admin/sales/${locale}/contracts` },
          { icon: Users, label: 'Agents', path: `/admin/sales/${locale}/agents` },
          { icon: DollarSign, label: 'Reports', path: `/admin/sales/${locale}/reports` },
        ]
      case 'local_finance':
      case 'international_finance':
        const finLocale = roleName.includes('local') ? 'local' : 'international'
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: `/admin/finance/${finLocale}/dashboard` },
          { icon: FileText, label: 'Invoices', path: `/admin/finance/${finLocale}/invoices` },
          { icon: DollarSign, label: 'Payments', path: `/admin/finance/${finLocale}/payments` },
          { icon: FileText, label: 'Expenses', path: `/admin/finance/${finLocale}/expenses` },
          { icon: DollarSign, label: 'Reports', path: `/admin/finance/${finLocale}/reports` },
        ]
      case 'local_operations':
      case 'international_operations':
        const opsLocale = roleName.includes('local') ? 'local' : 'international'
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: `/admin/operations/${opsLocale}/dashboard` },
          { icon: Package, label: 'Floor Plan', path: `/admin/operations/${opsLocale}/floor-plan` },
          { icon: FileText, label: 'Forms', path: `/admin/operations/${opsLocale}/forms` },
          { icon: Package, label: 'Logistics', path: `/admin/operations/${opsLocale}/logistics` },
        ]
      case 'marketing':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/marketing/dashboard' },
          { icon: FileText, label: 'Banners', path: '/admin/marketing/banners' },
          { icon: DollarSign, label: 'Sponsorships', path: '/admin/marketing/sponsorships' },
          { icon: Users, label: 'Partners', path: '/admin/marketing/partners' },
          { icon: FileText, label: 'Assets', path: '/admin/marketing/assets' },
        ]
      case 'exhibitor':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/exhibitor/dashboard' },
          { icon: FileText, label: 'Forms', path: '/exhibitor/forms' },
          { icon: FileText, label: 'Assets', path: '/exhibitor/assets' },
          { icon: MessageSquare, label: 'Chat', path: '/exhibitor/chat' },
          { icon: DollarSign, label: 'Invoices', path: '/exhibitor/invoices' },
        ]
      case 'partner_with_stand':
      case 'partner_without_stand':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/partner/dashboard' },
          { icon: FileText, label: 'Forms', path: '/partner/forms' },
          { icon: FileText, label: 'Updates', path: '/partner/updates' },
        ]
      case 'agent':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/agent/dashboard' },
          { icon: Users, label: 'Exhibitors', path: '/agent/exhibitors' },
          { icon: DollarSign, label: 'Invoices', path: '/agent/invoices' },
          { icon: FileText, label: 'Assets', path: '/agent/assets' },
          { icon: DollarSign, label: 'Reports', path: '/agent/reports' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img src="/media/App Icons-14.svg" alt="Logo" className="w-8 h-8" />
              <span className="font-bold text-gray-900">Libya Build</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{profile?.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{roleDisplayName}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
