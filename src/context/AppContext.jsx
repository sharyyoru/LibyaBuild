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
      interests: [],
      qrCode: `USER-${Date.now()}`
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

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    userProfile,
    setUserProfile,
    tickets,
    addTicket,
    meetings,
    addMeeting,
    updateMeeting,
    businessCards,
    addBusinessCard
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
