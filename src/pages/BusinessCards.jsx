import { useState } from 'react'
import { QrCode, User, Briefcase, Mail, Phone, Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'

const BusinessCards = () => {
  const { userProfile, businessCards, addBusinessCard } = useApp()
  const [showScanner, setShowScanner] = useState(false)
  const [scannedCode, setScannedCode] = useState('')

  const handleScan = () => {
    if (scannedCode.trim()) {
      addBusinessCard({
        id: Date.now(),
        qrCode: scannedCode,
        name: 'Scanned Contact',
        company: 'Sample Company',
        role: 'Business Professional',
        email: 'contact@example.com',
        phone: '+218 21 XXX XXXX'
      })
      setScannedCode('')
      setShowScanner(false)
    }
  }

  return (
    <>
      <Header title="Business Cards" />
      <div className="p-4 space-y-4">
        <Card className="p-6 bg-gradient-to-br from-primary-600 to-accent-500 text-white border-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">My Digital Card</h3>
              <p className="text-sm text-white/80">Share your contact information</p>
            </div>
            <img src="/media/PNG/App Icons-01.png" alt="Business Card" className="w-12 h-12" />
          </div>
          
          <div className="bg-white rounded-2xl p-4 mb-4">
            <QRCodeSVG
              value={JSON.stringify({
                qr: userProfile.qrCode,
                name: userProfile.name || 'Event Attendee',
                company: userProfile.company || 'Company Name',
                role: userProfile.role || 'Professional'
              })}
              size={180}
              className="mx-auto"
              level="H"
            />
          </div>

          <div className="text-center space-y-1">
            <p className="font-bold text-lg">{userProfile.name || 'Your Name'}</p>
            <p className="text-sm text-white/80">{userProfile.role || 'Your Role'}</p>
            <p className="text-sm text-white/80">{userProfile.company || 'Your Company'}</p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            fullWidth
            icon={QrCode}
            onClick={() => setShowScanner(!showScanner)}
          >
            Scan Card
          </Button>
          <Button
            variant="secondary"
            fullWidth
            icon={Download}
          >
            Save Card
          </Button>
        </div>

        {showScanner && (
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3">Scan QR Code</h3>
            <div className="aspect-square bg-gray-100 rounded-2xl mb-4 flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Camera view would appear here</p>
              </div>
            </div>
            <input
              type="text"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              placeholder="Or enter code manually..."
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" fullWidth onClick={() => setShowScanner(false)}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleScan}>
                Add Contact
              </Button>
            </div>
          </Card>
        )}

        <div>
          <h3 className="font-bold text-gray-900 mb-3">
            Collected Cards ({businessCards.length})
          </h3>
          {businessCards.length === 0 ? (
            <Card className="p-8 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No business cards yet</p>
              <p className="text-sm text-gray-400 mt-1">Start networking!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {businessCards.map(card => (
                <Card key={card.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900">{card.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{card.role}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Briefcase className="w-3 h-3" />
                        <span>{card.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{card.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{card.phone}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Scanned {format(new Date(card.scannedAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default BusinessCards
