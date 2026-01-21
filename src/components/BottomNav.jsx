import { NavLink } from 'react-router-dom'
import { Home, Building2, Sparkles, MessageSquare, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'

const BottomNav = () => {
  const { chats } = useApp()
  const { language } = useLanguage()
  const { t } = useTranslation(language)
  const unreadCount = chats.reduce((sum, chat) => sum + (chat.unread || 0), 0)
  
  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/exhibitors', icon: Building2, label: t('exhibitors') },
    { path: '/matchmaking', icon: Sparkles, label: t('match') },
    { path: '/chats', icon: MessageSquare, label: t('chats'), hasBadge: true },
    { path: '/profile', icon: User, label: t('profile') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ path, icon: Icon, label, hasBadge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center gap-1 transition-colors relative',
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 active:text-primary-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={clsx('w-5 h-5', isActive && 'fill-current')} strokeWidth={isActive ? 2 : 2} />
                  {hasBadge && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium truncate max-w-[60px] leading-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
