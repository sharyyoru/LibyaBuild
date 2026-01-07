import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
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

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
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
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
