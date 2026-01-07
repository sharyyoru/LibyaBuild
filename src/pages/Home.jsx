import { Link } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import Card from '../components/Card'
import { newsItems } from '../data/mockData'
import { format } from 'date-fns'

const QuickAction = ({ to, icon, title }) => (
  <Link to={to}>
    <Card className="p-3 h-full">
      <div className="flex flex-col items-center gap-2 text-center">
        <img src={icon} alt={title} className="w-12 h-12 object-contain" />
        <span className="text-xs font-semibold text-gray-900 leading-tight">{title}</span>
      </div>
    </Card>
  </Link>
)

const Home = () => {
  const latestNews = newsItems.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-accent-500">
      <div className="relative overflow-hidden">
        <img 
          src="/media/Banner 2.jpg" 
          alt="Libya Build" 
          className="w-full h-48 object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-center justify-between px-4 safe-top">
          <div className="flex items-center gap-3">
            <img src="/media/App Icons-14.svg" alt="Libya Build" className="w-16 h-16" />
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Libya Build</h1>
              <p className="text-white/90 text-sm">March 15-17, 2026</p>
            </div>
          </div>
          <Link to="/tickets">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>
      </div>

      <div className="px-4 py-6">
        <Card className="p-4 bg-gradient-to-br from-white to-accent-50 border-0 shadow-xl">
          <div className="flex items-center gap-3">
            <img src="/media/PNG/App Icons-09.png" alt="Event" className="w-16 h-16" />
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
            <QuickAction to="/exhibitors" icon="/media/PNG/App Icons-02.png" title="Exhibitors" />
            <QuickAction to="/speakers" icon="/media/PNG/App Icons-11.png" title="Speakers" />
            <QuickAction to="/floor-plan" icon="/media/PNG/App Icons-12.png" title="Floor Plan" />
            <QuickAction to="/schedule" icon="/media/PNG/App Icons-09.png" title="Schedule" />
            <QuickAction to="/tickets" icon="/media/PNG/App Icons-08.png" title="Tickets" />
            <QuickAction to="/meetings" icon="/media/PNG/App Icons-15.png" title="Meetings" />
            <QuickAction to="/business-cards" icon="/media/PNG/App Icons-01.png" title="Cards" />
            <QuickAction to="/navigation" icon="/media/PNG/App Icons-03.png" title="Navigate" />
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
