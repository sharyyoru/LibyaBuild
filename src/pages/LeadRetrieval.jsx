import { useState } from 'react'
import { QrCode, UserPlus, Building2, Download, Filter } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { format } from 'date-fns'

const LeadRetrieval = () => {
  const [showScanner, setShowScanner] = useState(false)
  const [scannedCode, setScannedCode] = useState('')
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(3)
  const [filter, setFilter] = useState('all')

  const [leads, setLeads] = useState([
    {
      id: 1,
      name: 'Ahmed Hassan',
      company: 'Construction Corp',
      role: 'Project Manager',
      email: 'ahmed@construction.ly',
      phone: '+218 21 123 4567',
      interests: ['Equipment', 'Materials'],
      rating: 5,
      notes: 'Very interested in bulk cement orders',
      timestamp: new Date('2026-01-07T09:30:00')
    },
    {
      id: 2,
      name: 'Sarah Abdullah',
      company: 'Urban Developers',
      role: 'Architect',
      email: 'sarah@urbandev.ly',
      phone: '+218 21 234 5678',
      interests: ['Smart Systems', 'Green Building'],
      rating: 4,
      notes: 'Looking for sustainable building solutions',
      timestamp: new Date('2026-01-07T10:15:00')
    },
    {
      id: 3,
      name: 'Omar Khalifa',
      company: 'Steel Industries',
      role: 'Procurement Head',
      email: 'omar@steelindustries.ly',
      phone: '+218 21 345 6789',
      interests: ['Steel', 'Materials'],
      rating: 3,
      notes: 'Requested product catalog',
      timestamp: new Date('2026-01-07T11:00:00')
    }
  ])

  const handleScanLead = () => {
    if (scannedCode.trim()) {
      setLeads([
        {
          id: Date.now(),
          name: 'New Contact',
          company: 'Sample Company',
          role: 'Professional',
          email: 'contact@example.com',
          phone: '+218 21 XXX XXXX',
          interests: ['General'],
          rating: rating,
          notes: notes,
          timestamp: new Date()
        },
        ...leads
      ])
      setScannedCode('')
      setNotes('')
      setRating(3)
      setShowScanner(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true
    if (filter === 'hot') return lead.rating >= 4
    if (filter === 'warm') return lead.rating === 3
    if (filter === 'cold') return lead.rating <= 2
    return true
  })

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success'
    if (rating === 3) return 'warning'
    return 'default'
  }

  const exportLeads = () => {
    const data = JSON.stringify(leads, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
  }

  return (
    <>
      <Header title="Lead Retrieval" />
      <div className="p-4 space-y-4">
        <Card className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 border-0">
          <div className="flex items-center gap-3">
            <img src="/media/PNG/App Icons-16.png" alt="Lead Retrieval" className="w-12 h-12" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Exhibitor Mode</h3>
              <p className="text-sm text-gray-600">Scan & manage your leads</p>
            </div>
            <Badge variant="primary">{leads.length}</Badge>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            fullWidth
            icon={QrCode}
            onClick={() => setShowScanner(!showScanner)}
          >
            Scan Badge
          </Button>
          <Button
            variant="secondary"
            fullWidth
            icon={Download}
            onClick={exportLeads}
          >
            Export
          </Button>
        </div>

        {showScanner && (
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3">Scan Attendee Badge</h3>
            <div className="aspect-square bg-gray-100 rounded-2xl mb-4 flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Camera scanner would appear here</p>
              </div>
            </div>
            
            <input
              type="text"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              placeholder="Or enter badge code..."
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lead Quality
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                      rating >= star
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />

            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" fullWidth onClick={() => setShowScanner(false)}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleScanLead}>
                Save Lead
              </Button>
            </div>
          </Card>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {['all', 'hot', 'warm', 'cold'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} Leads
            </button>
          ))}
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-3">Captured Leads</h3>
          {filteredLeads.length === 0 ? (
            <Card className="p-8 text-center">
              <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No leads captured yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map(lead => (
                <Card key={lead.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{lead.name}</h4>
                          <p className="text-sm text-gray-600">{lead.role}</p>
                        </div>
                        <Badge variant={getRatingColor(lead.rating)} size="sm">
                          {'★'.repeat(lead.rating)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Building2 className="w-3 h-3" />
                        <span>{lead.company}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {lead.interests.map(interest => (
                          <Badge key={interest} size="sm">{interest}</Badge>
                        ))}
                      </div>

                      {lead.notes && (
                        <p className="text-sm text-gray-700 p-2 bg-gray-50 rounded-lg mb-2">
                          {lead.notes}
                        </p>
                      )}

                      <p className="text-xs text-gray-500">
                        {format(lead.timestamp, 'MMM d, h:mm a')}
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

export default LeadRetrieval
