import { Link } from 'react-router-dom'
import { MessageSquare, Search, Users, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import { useAuth } from '../context/AuthContext'
import { getChatContacts, getLastMessageWith, getPublicUserProfile } from '../lib/supabase'
import { format } from 'date-fns'

const ChatList = () => {
  const { language } = useLanguage()
  const { t } = useTranslation(language)
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [contacts, setContacts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadChatContacts()
  }, [])

  const loadChatContacts = async () => {
    const userId = user?.id || user?.user_id || user?.visitor_id
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      // Get all scanned contacts
      const { data: scannedContacts } = await getChatContacts(userId)
      
      if (!scannedContacts || scannedContacts.length === 0) {
        setContacts([])
        setIsLoading(false)
        return
      }

      // Enrich with profile data and last message
      const enrichedContacts = await Promise.all(
        scannedContacts.map(async (contact) => {
          const { data: profile } = await getPublicUserProfile(contact.scanned_user_id)
          const { data: lastMsg } = await getLastMessageWith(userId, contact.scanned_user_id)
          
          return {
            id: contact.scanned_user_id,
            userId: contact.scanned_user_id,
            userName: contact.name || profile?.name || 'Contact',
            userAvatar: profile?.profile_photo_url || '/media/default-avatar.png',
            company: contact.company || profile?.company || 'Company',
            lastMessage: lastMsg?.message || null,
            lastMessageTime: lastMsg?.created_at || contact.created_at,
            unread: 0
          }
        })
      )

      setContacts(enrichedContacts)
    } catch (err) {
      console.error('Failed to load chat contacts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = (contacts || []).filter(chat =>
    chat?.userName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Header title={t('chatList')} showBack={false} />
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search') + '...'}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {isLoading ? (
          <Card className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
            <p className="text-gray-500">{t('loading')}</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">
              {search ? 'No matching conversations' : 'No conversations yet'}
            </h3>
            <p className="text-gray-500 mb-2">{t('noChats')}</p>
            <p className="text-sm text-gray-400 mt-1">Scan business cards to start chatting</p>
            {!search && (
              <Link
                to="/business-cards"
                className="inline-flex items-center gap-2 px-6 py-3 mt-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                <User className="w-5 h-5" />
                Scan Business Cards
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(chat => (
              <Link key={chat.id} to={`/chat/${chat.userId}`}>
                <Card className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {chat.userAvatar ? (
                        <img
                          src={chat.userAvatar}
                          alt={chat.userName}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = '/media/default-avatar.png'
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                      )}
                      {chat.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{chat.userName}</h4>
                        <span className="text-xs text-gray-500">
                          {chat.lastMessageTime ? format(new Date(chat.lastMessageTime), 'h:mm a') : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage || 'Start a conversation'}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ChatList
