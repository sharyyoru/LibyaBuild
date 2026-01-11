import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import NativeWrapper from './components/NativeWrapper'
import ProtectedRoute from './components/ProtectedRoute'
import AdminApp from './admin/AdminApp'
import Login from './pages/Login'
import Scanner from './pages/Scanner'
import Home from './pages/Home'
import Exhibitors from './pages/Exhibitors'
import ExhibitorDetail from './pages/ExhibitorDetail'
import FloorPlan from './pages/FloorPlan'
import Speakers from './pages/Speakers'
import SpeakerDetail from './pages/SpeakerDetail'
import News from './pages/News'
import Schedule from './pages/Schedule'
import MeetingScheduler from './pages/MeetingScheduler'
import Tickets from './pages/Tickets'
import Workshops from './pages/Workshops'
import BusinessCards from './pages/BusinessCards'
import QA from './pages/QA'
import LeadRetrieval from './pages/LeadRetrieval'
import Navigation from './pages/Navigation'
import Profile from './pages/Profile'
import Matchmaking from './pages/Matchmaking'
import ChatList from './pages/ChatList'
import Chat from './pages/Chat'
import HelpDesk from './pages/HelpDesk'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <NativeWrapper>
      {isLoading && <LoadingScreen onLoadComplete={() => setIsLoading(false)} />}
      <AuthProvider>
        <AppProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Admin Portal Routes */}
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/exhibitor/*" element={<AdminApp />} />
              <Route path="/partner/*" element={<AdminApp />} />
              <Route path="/agent/*" element={<AdminApp />} />

              {/* Protected Mobile App Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Home />} />
                <Route path="exhibitors" element={<Exhibitors />} />
                <Route path="exhibitors/:id" element={<ExhibitorDetail />} />
                <Route path="floor-plan" element={<FloorPlan />} />
                <Route path="speakers" element={<Speakers />} />
                <Route path="speakers/:id" element={<SpeakerDetail />} />
                <Route path="news" element={<News />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="meetings" element={<MeetingScheduler />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="workshops" element={<Workshops />} />
                <Route path="business-cards" element={<BusinessCards />} />
                <Route path="qa" element={<QA />} />
                <Route path="lead-retrieval" element={<LeadRetrieval />} />
                <Route path="navigation" element={<Navigation />} />
                <Route path="matchmaking" element={<Matchmaking />} />
                <Route path="chats" element={<ChatList />} />
                <Route path="chat/:userId" element={<Chat />} />
                <Route path="help" element={<HelpDesk />} />
                <Route path="profile" element={<Profile />} />
                <Route path="scanner" element={<Scanner />} />
              </Route>
            </Routes>
          </Router>
        </AppProvider>
      </AuthProvider>
    </NativeWrapper>
  )
}

export default App
