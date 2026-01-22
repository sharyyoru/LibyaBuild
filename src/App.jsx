import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import NativeWrapper from './components/NativeWrapper'
import ProtectedRoute from './components/ProtectedRoute'
import StaffRoute from './components/StaffRoute'
import AdminApp from './admin/AdminApp'
import Onboarding from './pages/Onboarding'
import VisitorLogin from './pages/VisitorLogin'
import ExhibitorLogin from './pages/ExhibitorLogin'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
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
import Registration from './pages/Registration'
import TravelServices from './pages/TravelServices'
import Notifications from './pages/Notifications'
import MyMeetings from './pages/MyMeetings'
import Favorites from './pages/Favorites'
import FlightTickets from './pages/FlightTickets'
import VisaApplication from './pages/VisaApplication'
import HotelRequest from './pages/HotelRequest'
import Partners from './pages/Partners'
import PartnerDetail from './pages/PartnerDetail'
import Sponsorship from './pages/Sponsorship'
import SponsorshipDetail from './pages/SponsorshipDetail'
import SharedCard from './pages/SharedCard'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <NativeWrapper>
      {isLoading && <LoadingScreen onLoadComplete={() => setIsLoading(false)} />}
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <Router>
              <Routes>
                {/* Onboarding & Auth Routes */}
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login/visitor" element={<VisitorLogin />} />
                <Route path="/login/exhibitor" element={<ExhibitorLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/card/:hash" element={<SharedCard />} />

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
                <Route path="partners" element={<Partners />} />
                <Route path="partners/:id" element={<PartnerDetail />} />
                <Route path="sponsorships" element={<Sponsorship />} />
                <Route path="sponsorships/:id" element={<SponsorshipDetail />} />
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
                <Route path="scanner" element={<StaffRoute><Scanner /></StaffRoute>} />
                <Route path="travel" element={<TravelServices />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="my-meetings" element={<MyMeetings />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="flight-tickets" element={<FlightTickets />} />
                <Route path="visa-application" element={<VisaApplication />} />
                <Route path="hotel-request" element={<HotelRequest />} />
              </Route>
            </Routes>
            </Router>
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </NativeWrapper>
  )
}

export default App
