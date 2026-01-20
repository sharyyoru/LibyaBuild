import { Link } from 'react-router-dom'
import { MessageSquare, Search, Users } from 'lucide-react'
import { useState } from 'react'
import Header from '../components/Header'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

const ChatList = () => {
  const { chats } = useApp()
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  const filtered = (chats || []).filter(chat =>
    chat?.userName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Header title="Messages" showBack={false} />
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">
              {search ? 'No matching conversations' : 'No conversations yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {search ? 'Try adjusting your search term' : 'Start networking with exhibitors to begin chatting'}
            </p>
            {!search && (
              <Link
                to="/matchmaking"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                <Users className="w-5 h-5" />
                Find Matches
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
                      <img
                        src={chat.userAvatar}
                        alt={chat.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
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
