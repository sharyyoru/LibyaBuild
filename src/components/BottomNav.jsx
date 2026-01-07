import { NavLink } from 'react-router-dom'
import { Home, Building2, Calendar, Map, User } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/exhibitors', icon: Building2, label: 'Exhibitors' },
  { path: '/schedule', icon: Calendar, label: 'Schedule' },
  { path: '/navigation', icon: Map, label: 'Map' },
  { path: '/profile', icon: User, label: 'Profile' },
]

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 active:text-primary-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-5 h-5', isActive && 'fill-current')} strokeWidth={isActive ? 2 : 2} />
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
