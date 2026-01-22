import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Send, ArrowLeft, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { sendChatMessage, getChatMessages, subscribeToChatMessages } from '../lib/supabase-chat'
import { getPublicUserProfile } from '../lib/supabase'
import { format } from 'date-fns'

const Chat = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)
  const currentUserId = user?.id || user?.user_id || user?.visitor_id

  useEffect(() => {
    loadChatData()
  }, [userId])

  const loadChatData = async () => {
    if (!currentUserId || !userId) return
    
    setIsLoading(true)
    try {
      // Load other user profile
      const { data: userProfile } = await getPublicUserProfile(userId)
      setOtherUser(userProfile)

      // Load messages
      const { data: msgs } = await getChatMessages(currentUserId, userId)
      setMessages(msgs || [])

      // Subscribe to new messages
      const subscription = subscribeToChatMessages(currentUserId, userId, (newMsg) => {
        setMessages(prev => [...prev, newMsg])
        scrollToBottom()
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Error loading chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId || !userId || isSending) return

    setIsSending(true)
    try {
      const { data } = await sendChatMessage(currentUserId, userId, newMessage.trim())
      if (data) {
        setMessages(prev => [...prev, data])
        setNewMessage('')
        scrollToBottom()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 safe-top">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        {otherUser?.profile_photo_url ? (
          <img
            src={otherUser.profile_photo_url}
            alt={otherUser.name || 'User'}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">
            {otherUser?.name || 'User'}
          </h2>
          <p className="text-xs text-gray-500">
            {otherUser?.company || 'Event Attendee'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMyMessage = msg.sender_id === currentUserId
            return (
              <div
                key={msg.id || index}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMyMessage
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isMyMessage ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {format(new Date(msg.created_at), 'h:mm a')}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="bg-white border-t border-gray-200 p-4 safe-bottom"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat
