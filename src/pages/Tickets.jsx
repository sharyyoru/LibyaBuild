import { useState } from 'react'
import { Ticket, Check, Sparkles, Zap, Crown, User, Building2, Users, Calendar } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ticketUpgrades } from '../data/mockData'

const EVENT_DAYS = [
  { key: 'day1', label: 'Day 1', date: 'Mar 15' },
  { key: 'day2', label: 'Day 2', date: 'Mar 16' },
  { key: 'day3', label: 'Day 3', date: 'Mar 17' },
  { key: 'day4', label: 'Day 4', date: 'Mar 18' }
]

const USER_TYPE_CONFIG = {
  visitor: { label: 'Visitor', color: 'bg-blue-500', icon: User },
  exhibitor: { label: 'Exhibitor', color: 'bg-green-500', icon: Building2 },
  delegate: { label: 'Delegate', color: 'bg-purple-500', icon: Users }
}

const Tickets = () => {
  const { tickets, addTicket, userProfile, getAttendanceCount } = useApp()
  const { user } = useAuth()
  const [showUpgrades, setShowUpgrades] = useState(false)

  const handlePurchase = (upgrade) => {
    addTicket(upgrade)
    setShowUpgrades(false)
  }

  const hasBaseTicket = tickets.some(t => t.name === 'Entry Pass')
  
  const userTypes = userProfile.userTypes || ['visitor']
  const attendance = userProfile.attendance || {}
  const attendedDays = getAttendanceCount ? getAttendanceCount() : 0

  const qrData = JSON.stringify({
    id: userProfile.qrCode,
    email: user?.email || '',
    name: userProfile.name || user?.email?.split('@')[0] || 'Guest',
    types: userTypes,
    attendance: attendance
  })

  return (
    <>
      <Header title="My Tickets" showBack={false} />
      <div className="p-4 space-y-4">
        <Card className="p-6 bg-gradient-to-br from-primary-600 to-accent-500 text-white border-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold mb-1">Digital Entry Pass</h3>
              <p className="text-white/80 text-sm">Libya Build 2026</p>
            </div>
            <img src="/media/PNG/App Icons-08.png" alt="Ticket" className="w-10 h-10" />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {userTypes.map(type => {
              const config = USER_TYPE_CONFIG[type]
              if (!config) return null
              const Icon = config.icon
              return (
                <span 
                  key={type}
                  className={`${config.color} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                </span>
              )
            })}
          </div>
          
          <div className="bg-white rounded-2xl p-4 mb-4">
            <QRCodeSVG
              value={qrData}
              size={200}
              className="mx-auto"
              level="H"
            />
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-primary-100 mb-1">Scan at entrance</p>
            <p className="font-mono text-xs opacity-75">{userProfile.qrCode}</p>
          </div>

          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Attendance Tracker
              </span>
              <span className="text-sm font-bold">{attendedDays}/4 Days</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_DAYS.map(day => (
                <div 
                  key={day.key}
                  className={`text-center p-2 rounded-lg ${
                    attendance[day.key] 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white/20 text-white/60'
                  }`}
                >
                  <p className="text-xs font-medium">{day.label}</p>
                  <p className="text-[10px]">{day.date}</p>
                  {attendance[day.key] && <Check className="w-3 h-3 mx-auto mt-1" />}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {!showUpgrades && (
          <Button
            fullWidth
            variant="outline"
            icon={Sparkles}
            onClick={() => setShowUpgrades(true)}
          >
            Upgrade Your Experience
          </Button>
        )}

        {showUpgrades && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900">Available Upgrades</h3>
            {ticketUpgrades.map(upgrade => (
              <Card key={upgrade.id} className="p-4 border-2 border-primary-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    {upgrade.id === 3 ? (
                      <Crown className="w-6 h-6 text-white" />
                    ) : upgrade.id === 2 ? (
                      <Zap className="w-6 h-6 text-white" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{upgrade.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{upgrade.description}</p>
                    <Badge size="sm">{upgrade.duration}</Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {upgrade.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-accent-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-2xl font-bold text-primary-600">{upgrade.price}</span>
                    <span className="text-gray-600 ml-1">{upgrade.currency}</span>
                  </div>
                  <Button onClick={() => handlePurchase(upgrade)}>
                    Purchase
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tickets.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Purchase History</h3>
            <div className="space-y-3">
              {tickets.map(ticket => (
                <Card key={ticket.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                      <p className="text-sm text-gray-600">{ticket.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">{ticket.price} {ticket.currency}</p>
                      <Badge variant="success" size="sm">Active</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Tickets
