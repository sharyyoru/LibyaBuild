import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QrCode, Sparkles, Plane, FileText, Hotel, Bell, ChevronRight, Calendar, MapPin, Users, Zap, ArrowRight, Clock, Star } from 'lucide-react'
import HeroBannerCarousel from '../components/HeroBannerCarousel'
import PromotionalBanner from '../components/PromotionalBanner'
import AppInstallBanner from '../components/AppInstallBanner'
import { newsItems, exhibitors } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'
import { clsx } from 'clsx'

const QuickAction = ({ to, icon, title, gradient, delay = 0, comingSoon = false }) => {
  const content = (
    <div className="group relative">
      {/* Glass Card */}
      <div className={clsx(
        'relative overflow-hidden rounded-2xl p-3 transition-all duration-300',
        'bg-white/80 backdrop-blur-sm border border-gray-100/50',
        comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-0.5 active:scale-95'
      )}>
        {/* Coming Soon Badge */}
        {comingSoon && (
          <div className="absolute -top-1 -right-1 z-10">
            <span className="inline-flex px-2 py-0.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[9px] font-bold rounded-full shadow-lg">
              Coming Soon
            </span>
          </div>
        )}
        
        {/* Gradient Background on Hover */}
        {!comingSoon && (
          <div className={clsx(
            'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
            gradient || 'bg-gradient-to-br from-primary-50 to-accent-50'
          )} />
        )}
        
        <div className="relative flex flex-col items-center gap-2 text-center">
          <div className={clsx(
            'w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center transition-transform duration-300',
            !comingSoon && 'group-hover:scale-110'
          )}>
            <img src={icon} alt={title} className="w-9 h-9 object-contain" />
          </div>
          <span className={clsx(
            'text-xs font-semibold leading-tight transition-colors',
            comingSoon ? 'text-gray-500' : 'text-gray-700 group-hover:text-gray-900'
          )}>{title}</span>
        </div>
      </div>
    </div>
  )
  
  if (comingSoon) {
    return <div className="block" style={{ animationDelay: `${delay}ms` }}>{content}</div>
  }
  
  return (
    <Link to={to} className="block" style={{ animationDelay: `${delay}ms` }}>
      {content}
    </Link>
  )
}

const ExtraServiceCard = ({ to, icon: Icon, title, description, gradient, comingSoon = false }) => {
  const content = (
    <div className={clsx(
      'relative overflow-hidden rounded-2xl p-4 transition-all duration-300',
      comingSoon ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]',
      gradient
    )}>
      {/* Coming Soon Badge */}
      {comingSoon && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex px-2.5 py-1 bg-white/90 backdrop-blur-sm text-purple-700 text-[10px] font-bold rounded-full shadow-lg border border-white/50">
            Coming Soon
          </span>
        </div>
      )}
      
      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      
      {/* Animated Orbs */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-white/10 rounded-full blur-xl" />
      
      <div className="relative flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <p className="text-white/70 text-xs">{description}</p>
        </div>
        {!comingSoon && <ChevronRight className="w-5 h-5 text-white/50" />}
      </div>
    </div>
  )
  
  if (comingSoon) {
    return <div className="block">{content}</div>
  }
  
  return (
    <Link to={to} className="block">
      {content}
    </Link>
  )
}

const Home = () => {
  const [activeTab, setActiveTab] = useState('quick')
  const latestNews = newsItems.slice(0, 1)
  const { userProfile } = useApp()

  const getSuggestedExhibitors = () => {
    if (!userProfile.sector) return []
    return exhibitors.filter(e => e.sector === userProfile.sector).slice(0, 3)
  }

  const suggested = getSuggestedExhibitors()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-5 w-24 h-24 bg-primary-300/20 rounded-full blur-2xl animate-float-delayed" />
        <div className="absolute -bottom-10 left-1/2 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="relative px-4 pt-6 pb-6 safe-top">
          {/* Top Header Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Logo with Glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg" />
                <div className="relative w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl p-2 border border-white/30">
                  <img src="/media/App Icons-14.svg" alt="Libya Build" className="w-full h-full" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Libya Build</h1>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>April 20-23, 2026</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Link to="/notifications">
                <div className="relative w-11 h-11 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 hover:bg-white/25 transition-all active:scale-95">
                  <Bell className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-primary-600">3</span>
                </div>
              </Link>
              <Link to="/tickets">
                <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 hover:bg-white/25 transition-all active:scale-95">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
              </Link>
            </div>
          </div>

          {/* Event Stats Bar */}
          <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1 -mx-4 px-4">
            {[
              { icon: Users, label: 'Exhibitors', value: '200+' },
              { icon: MapPin, label: 'Venue', value: 'Tripoli' },
              { icon: Clock, label: 'Days Left', value: '45' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 whitespace-nowrap">
                <stat.icon className="w-4 h-4 text-accent-300" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white font-bold text-sm">{stat.value}</span>
                  <span className="text-white/60 text-xs">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Hero Banner Carousel */}
          <HeroBannerCarousel />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="relative -mt-4 z-10">
        <div className="bg-gray-50 rounded-t-[2rem] pt-6 pb-24">
          {/* Quick Access Section */}
          <div className="px-4 mb-6">
            {/* Section Header with Tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('quick')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                  activeTab === 'quick'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                )}
              >
                <Zap className="w-4 h-4" />
                Quick Access
              </button>
              <button
                onClick={() => setActiveTab('extra')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                  activeTab === 'extra'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                )}
              >
                <Star className="w-4 h-4" />
                Services
              </button>
              <Link 
                to="/matchmaking"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/25 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                AI Match
              </Link>
            </div>

            {/* Quick Access Grid */}
            {activeTab === 'quick' && (
              <div className="grid grid-cols-4 gap-2.5">
                <QuickAction to="/partners" icon="/media/PNG/App Icons-13.png" title="Partners" delay={0} />
                <QuickAction to="/sponsorships" icon="/media/PNG/App Icons-14.png" title="Sponsorships" delay={50} />
                <QuickAction to="/speakers" icon="/media/PNG/App Icons-11.png" title="Speakers" delay={100} />
                <QuickAction to="/schedule" icon="/media/PNG/App Icons-09.png" title="Schedule" delay={150} />
                <QuickAction to="/tickets" icon="/media/PNG/App Icons-08.png" title="Tickets" delay={200} />
                <QuickAction to="/meetings" icon="/media/PNG/App Icons-15.png" title="Meetings" delay={250} />
                <QuickAction to="/business-cards" icon="/media/PNG/App Icons-01.png" title="Cards" delay={300} />
                <QuickAction to="/navigation" icon="/media/PNG/App Icons-03.png" title="Navigate" delay={350} comingSoon={true} />
                {/* Floor Plan removed from display but keeping code for later use */}
                {/* <QuickAction to="/floor-plan" icon="/media/PNG/App Icons-12.png" title="Floor Plan" delay={100} /> */}
              </div>
            )}

            {/* Extra Services */}
            {activeTab === 'extra' && (
              <div className="space-y-3">
                <ExtraServiceCard 
                  to="/flight-tickets" 
                  icon={Plane} 
                  title="Flight Tickets" 
                  description="Book your flights to Tripoli"
                  gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <ExtraServiceCard 
                  to="/visa-application" 
                  icon={FileText} 
                  title="Visa Application" 
                  description="Apply for your visa online"
                  gradient="bg-gradient-to-r from-emerald-500 to-teal-600"
                />
                <ExtraServiceCard 
                  to="/hotel-request" 
                  icon={Hotel} 
                  title="Hotel Booking" 
                  description="Find accommodation nearby"
                  gradient="bg-gradient-to-r from-purple-500 to-violet-600"
                  comingSoon={true}
                />
              </div>
            )}
          </div>

          {/* Promotional Banner */}
          <div className="px-4 mb-6">
            <Link to="/sponsorships">
              <div className="relative overflow-hidden rounded-3xl h-48 cursor-pointer group">
                {/* Full Background Image - No Zoom, Full Details Visible */}
                <img
                  src="/media/1920-length-x-1080-height.jpg"
                  alt="Libya Build Promotion"
                  className="w-full h-full object-contain transition-all duration-300"
                />
                
                {/* Minimal Overlay for Future Carousel Functionality */}
                <div className="absolute inset-0 bg-black/5" />
                
                {/* Sponsored Tag - Top Left Corner */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/80 backdrop-blur-md rounded-full text-xs font-medium text-white border border-blue-400/50">
                    <Star className="w-3 h-3" />
                    Sponsored
                  </span>
                </div>
                
                {/* View Profile Button - Bottom Right Corner */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/30 transition-all">
                    <span className="text-white text-sm font-medium">
                      View Profile
                    </span>
                    <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* AI Matchmaking CTA */}
          {suggested.length === 0 && (
            <div className="px-4 mb-6">
              <Link to="/matchmaking">
                <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-purple-600 via-primary-600 to-accent-600">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">AI Matchmaking</h3>
                      <p className="text-white/80 text-sm">Find your perfect business partners</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Suggested Exhibitors */}
          {suggested.length > 0 && (
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  Suggested for You
                </h2>
                <Link to="/matchmaking" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
                {suggested.map(exhibitor => (
                  <Link key={exhibitor.id} to={`/exhibitors/${exhibitor.id}`} className="snap-start">
                    <div className="min-w-[260px] p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={exhibitor.logo} alt={exhibitor.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{exhibitor.name}</h4>
                          <p className="text-sm text-gray-500">{exhibitor.booth}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg">{exhibitor.sector}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{exhibitor.country}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Latest Updates */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Latest Updates</h2>
              <Link to="/news" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {latestNews.map((news, index) => (
                <div 
                  key={news.id} 
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex gap-4">
                    {news.image && (
                      <div className="relative flex-shrink-0">
                        <img src={news.image} alt="" className="w-20 h-20 rounded-xl object-cover" />
                        {index === 0 && (
                          <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-accent-500 text-white text-[10px] font-bold rounded-full">NEW</span>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">{news.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{news.summary}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {format(new Date(news.date), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AppInstallBanner />
    </div>
  )
}

export default Home
