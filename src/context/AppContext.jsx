import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : { exhibitors: [], sessions: [], speakers: [] }
  })

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile')
    return saved ? JSON.parse(saved) : {
      name: '',
      company: '',
      role: '',
      sector: '',
      persona: 'visitor',
      country: '',
      interests: [],
      qrCode: `USER-${Date.now()}`,
      bio: '',
      userTypes: ['visitor'],
      attendance: {
        day1: false,
        day2: false,
        day3: false,
        day4: false
      }
    }
  })

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('tickets')
    return saved ? JSON.parse(saved) : []
  })

  const [meetings, setMeetings] = useState(() => {
    const saved = localStorage.getItem('meetings')
    return saved ? JSON.parse(saved) : []
  })

  const [businessCards, setBusinessCards] = useState(() => {
    const saved = localStorage.getItem('businessCards')
    return saved ? JSON.parse(saved) : []
  })

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('chats')
    return saved ? JSON.parse(saved) : []
  })

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('messages')
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
  }, [userProfile])

  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets))
  }, [tickets])

  useEffect(() => {
    localStorage.setItem('meetings', JSON.stringify(meetings))
  }, [meetings])

  useEffect(() => {
    localStorage.setItem('businessCards', JSON.stringify(businessCards))
  }, [businessCards])

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats))
  }, [chats])

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages))
  }, [messages])

  const toggleFavorite = (type, id) => {
    setFavorites(prev => {
      const items = prev[type] || []
      const exists = items.includes(id)
      return {
        ...prev,
        [type]: exists ? items.filter(i => i !== id) : [...items, id]
      }
    })
  }

  const isFavorite = (type, id) => {
    return favorites[type]?.includes(id) || false
  }

  const addTicket = (ticket) => {
    setTickets(prev => [...prev, { ...ticket, id: Date.now(), purchasedAt: new Date().toISOString() }])
  }

  const addMeeting = (meeting) => {
    setMeetings(prev => [...prev, { ...meeting, id: Date.now(), status: 'pending' }])
  }

  const updateMeeting = (id, updates) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  }

  const addBusinessCard = (card) => {
    setBusinessCards(prev => [...prev, { ...card, scannedAt: new Date().toISOString() }])
  }

  const startChat = (userId, userName, userAvatar) => {
    const existingChat = chats.find(c => c.userId === userId)
    if (!existingChat) {
      setChats(prev => [...prev, {
        id: Date.now(),
        userId,
        userName,
        userAvatar,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unread: 0
      }])
      setMessages(prev => ({ ...prev, [userId]: [] }))
    }
    return userId
  }

  const sendMessage = (userId, content) => {
    const newMessage = {
      id: Date.now(),
      content,
      sender: 'me',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), newMessage]
    }))
    setChats(prev => prev.map(chat =>
      chat.userId === userId
        ? { ...chat, lastMessage: content, lastMessageTime: newMessage.timestamp }
        : chat
    ))
  }

  const updateUserTypes = (types) => {
    setUserProfile(prev => ({ ...prev, userTypes: types }))
  }

  const recordAttendance = (day) => {
    setUserProfile(prev => ({
      ...prev,
      attendance: { ...prev.attendance, [day]: true }
    }))
  }

  const getAttendanceCount = () => {
    const attendance = userProfile.attendance || {}
    return Object.values(attendance).filter(Boolean).length
  }

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    userProfile,
    setUserProfile,
    updateUserTypes,
    recordAttendance,
    getAttendanceCount,
    tickets,
    addTicket,
    meetings,
    addMeeting,
    updateMeeting,
    businessCards,
    addBusinessCard,
    chats,
    messages,
    startChat,
    sendMessage
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
