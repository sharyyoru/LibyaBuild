import { Link } from 'react-router-dom'
import { Building2, Users, Calendar, Newspaper, MapPin, Ticket, Users2, MessageSquare, QrCode, Navigation as NavigationIcon } from 'lucide-react'
import Card from '../components/Card'
import { newsItems } from '../data/mockData'
import { format } from 'date-fns'

const QuickAction = ({ to, icon: Icon, title, color }) => (
  <Link to={to}>
    <Card className="p-4 h-full">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-900">{title}</span>
      </div>
    </Card>
  </Link>
)

const Home = () => {
  const latestNews = newsItems.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-600 to-primary-700">
      <div className="px-4 pt-8 pb-6 safe-top">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Libya Build</h1>
            <p className="text-primary-100">March 15-17, 2026</p>
          </div>
          <Link to="/tickets">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>

        <Card className="p-4 bg-gradient-to-br from-white to-primary-50 border-0 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Event Starting Soon!</h3>
              <p className="text-sm text-gray-600">3 days of innovation and networking</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-t-[2rem] pt-6 pb-4">
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-4 gap-3">
            <QuickAction to="/exhibitors" icon={Building2} title="Exhibitors" color="bg-blue-500" />
            <QuickAction to="/speakers" icon={Users} title="Speakers" color="bg-purple-500" />
            <QuickAction to="/floor-plan" icon={MapPin} title="Floor Plan" color="bg-green-500" />
            <QuickAction to="/schedule" icon={Calendar} title="Schedule" color="bg-orange-500" />
            <QuickAction to="/tickets" icon={Ticket} title="Tickets" color="bg-red-500" />
            <QuickAction to="/meetings" icon={Users2} title="Meetings" color="bg-indigo-500" />
            <QuickAction to="/business-cards" icon={QrCode} title="Cards" color="bg-teal-500" />
            <QuickAction to="/navigation" icon={NavigationIcon} title="Navigate" color="bg-pink-500" />
          </div>
        </div>

        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Latest Updates</h2>
            <Link to="/news" className="text-sm font-semibold text-primary-600">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {latestNews.map(news => (
              <Card key={news.id} className="p-4">
                <div className="flex gap-3">
                  {news.image && (
                    <img src={news.image} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{news.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{news.summary}</p>
                    <span className="text-xs text-gray-500">{format(new Date(news.date), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
