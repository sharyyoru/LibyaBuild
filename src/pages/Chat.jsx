import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Send, ArrowLeft, MoreVertical } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { exhibitors } from '../data/mockData'
import { format } from 'date-fns'

const Chat = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { chats, messages, sendMessage } = useApp()
  const [newMessage, setNewMessage] = useState('')

  const chat = chats.find(c => c.userId === parseInt(userId))
  const chatMessages = messages[userId] || []
  const exhibitor = exhibitors.find(e => e.id === parseInt(userId))

  if (!chat && !exhibitor) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Chat not found</p>
      </div>
    )
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      sendMessage(parseInt(userId), newMessage)
      setNewMessage('')
    }
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
        <img
          src={chat?.userAvatar || exhibitor?.logo}
          alt={chat?.userName || exhibitor?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">
            {chat?.userName || exhibitor?.name}
          </h2>
          <p className="text-xs text-gray-500">
            {exhibitor?.booth || 'Exhibitor'}
          </p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreVertical className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  msg.sender === 'me'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === 'me' ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {format(new Date(msg.timestamp), 'h:mm a')}
                </p>
              </div>
            </div>
          ))
        )}
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
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat
