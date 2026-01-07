import { useState } from 'react'
import { Ticket, Check, Sparkles, Zap, Crown } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { ticketUpgrades } from '../data/mockData'

const Tickets = () => {
  const { tickets, addTicket, userProfile } = useApp()
  const [showUpgrades, setShowUpgrades] = useState(false)

  const handlePurchase = (upgrade) => {
    addTicket(upgrade)
    setShowUpgrades(false)
  }

  const hasBaseTicket = tickets.some(t => t.name === 'Entry Pass')

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
          
          <div className="bg-white rounded-2xl p-4 mb-4">
            <QRCodeSVG
              value={userProfile.qrCode}
              size={200}
              className="mx-auto"
              level="H"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-primary-100 mb-1">Scan at entrance</p>
            <p className="font-mono text-xs opacity-75">{userProfile.qrCode}</p>
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
