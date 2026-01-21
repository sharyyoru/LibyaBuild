import { useState, useEffect, useRef } from 'react'
import { Ticket, Check, Sparkles, Zap, Crown, User, Building2, Users, Calendar, Printer, RefreshCw } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import { ticketUpgrades } from '../data/mockData'
import { fetchUserAttendance } from '../lib/supabase'

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
  const { tickets, addTicket, userProfile, getAttendanceCount, recordAttendance } = useApp()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation(language)
  const [showUpgrades, setShowUpgrades] = useState(false)
  const [activeQR, setActiveQR] = useState('gate')
  const [dbAttendance, setDbAttendance] = useState(null)
  const [loading, setLoading] = useState(false)
  const printRef = useRef(null)

  const handlePurchase = (upgrade) => {
    addTicket(upgrade)
    setShowUpgrades(false)
  }

  // Fetch attendance from database
  const loadAttendance = async () => {
    if (!userProfile.qrCode) return
    setLoading(true)
    try {
      const { data } = await fetchUserAttendance(userProfile.qrCode)
      if (data) {
        setDbAttendance(data)
        // Sync to local state
        EVENT_DAYS.forEach(day => {
          if (data[day.key] && !userProfile.attendance?.[day.key]) {
            recordAttendance(day.key)
          }
        })
      }
    } catch (err) {
      console.error('Error fetching attendance:', err)
    }
    setLoading(false)
  }

  // Check for attendance updates from database
  useEffect(() => {
    loadAttendance()
    const interval = setInterval(loadAttendance, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [userProfile.qrCode])

  const hasBaseTicket = tickets.some(t => t.name === 'Entry Pass')
  
  const userTypes = userProfile.userTypes || ['visitor']
  const isDelegate = userTypes.includes('delegate')
  const attendance = userProfile.attendance || {}
  const attendedDays = getAttendanceCount ? getAttendanceCount() : 0

  // Get the actual numeric user_id from the API response
  const userId = user?.id || user?.user_id || user?.visitor_id

  // Gate Entry QR - for main entrance
  const gateQRData = JSON.stringify({
    user_id: userId,
    id: userProfile.qrCode,
    email: user?.email || '',
    name: userProfile.name || user?.email?.split('@')[0] || 'Guest',
    types: userTypes,
    attendance: attendance,
    qrType: 'gate'
  })

  // Delegate Access QR - for conference areas (only for delegates)
  const delegateQRData = JSON.stringify({
    user_id: userId,
    id: userProfile.qrCode,
    email: user?.email || '',
    name: userProfile.name || user?.email?.split('@')[0] || 'Guest',
    types: userTypes,
    attendance: attendance,
    qrType: 'delegate'
  })

  const handlePrintBadge = () => {
    const printWindow = window.open('', '_blank')
    const userName = userProfile.name || user?.email?.split('@')[0] || 'Guest'
    const userCompany = userProfile.company || ''
    const userRole = userProfile.role || ''
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('libyaBuild')} - ${t('myBadge')}</title>
        <style>
          @page { size: 3.5in 5.5in; margin: 0; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: linear-gradient(135deg, #2264dc 0%, #06b6d4 100%);
            min-height: 100vh;
            box-sizing: border-box;
          }
          .badge {
            background: white;
            border-radius: 16px;
            padding: 24px;
            width: 280px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          }
          .logo { font-size: 24px; font-weight: bold; color: #2264dc; margin-bottom: 8px; }
          .event { font-size: 12px; color: #666; margin-bottom: 16px; }
          .name { font-size: 22px; font-weight: bold; color: #1f2937; margin-bottom: 4px; }
          .company { font-size: 14px; color: #4b5563; margin-bottom: 4px; }
          .role { font-size: 12px; color: #6b7280; margin-bottom: 16px; }
          .types { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; flex-wrap: wrap; }
          .type { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; color: white; }
          .type-visitor { background: #3b82f6; }
          .type-exhibitor { background: #22c55e; }
          .type-delegate { background: #a855f7; }
          .qr-section { margin: 16px 0; }
          .qr-label { font-size: 10px; color: #9ca3af; margin-bottom: 8px; }
          .qr-container { background: #f9fafb; padding: 12px; border-radius: 12px; display: inline-block; }
          .qr-code { width: 120px; height: 120px; }
          .user-id { font-size: 10px; color: #9ca3af; margin-top: 12px; font-family: monospace; }
          .footer { font-size: 10px; color: #9ca3af; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="badge">
          <div class="logo">${t('libyaBuild')}</div>
          <div class="event">${t('event')}</div>
          <div class="name">${userName}</div>
          ${userCompany ? `<div class="company">${userCompany}</div>` : ''}
          ${userRole ? `<div class="role">${userRole}</div>` : ''}
          <div class="types">
            ${userTypes.map(t => `<span class="type type-${t}">${t.toUpperCase()}</span>`).join('')}
          </div>
          <div class="qr-section">
            <div class="qr-label">${t('gateEntry')}</div>
            <div class="qr-container">
              <svg id="qr-gate" class="qr-code"></svg>
            </div>
          </div>
          ${isDelegate ? `
          <div class="qr-section">
            <div class="qr-label">${t('delegateAccess')}</div>
            <div class="qr-container">
              <svg id="qr-delegate" class="qr-code"></svg>
            </div>
          </div>
          ` : ''}
          <div class="user-id">${userProfile.qrCode}</div>
          <div class="footer">${t('presentBadge')}</div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
        <script>
          QRCode.toString('${gateQRData.replace(/'/g, "\\'")}', { type: 'svg', width: 120 }, function(err, svg) {
            document.getElementById('qr-gate').outerHTML = svg.replace('<svg', '<svg class="qr-code"');
          });
          ${isDelegate ? `
          QRCode.toString('${delegateQRData.replace(/'/g, "\\'")}', { type: 'svg', width: 120 }, function(err, svg) {
            document.getElementById('qr-delegate').outerHTML = svg.replace('<svg', '<svg class="qr-code"');
          });
          ` : ''}
          setTimeout(() => window.print(), 500);
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <>
      <Header title={t('myBadge')} showBack={false} />
      <div className="p-4 space-y-4">
        {/* Badge Design matching screenshot */}
        <Card className="p-6 bg-white border-0 shadow-lg">
          {/* Logo at top */}
          <div className="flex justify-center mb-6">
            <img src="/media/newdesign/Benghazi logo-01.png" alt="Libya Build" className="h-16" onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/media/newdesign/Benghazi logo-01.jpg';
            }} />
          </div>

          {/* User Details - Name, Job Title, Company, Country */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1 uppercase">
              {userProfile.name || user?.first_name || user?.email?.split('@')[0] || 'Guest'}
            </h2>
            {userProfile.role && (
              <p className="text-base font-semibold text-gray-700 uppercase">{userProfile.role}</p>
            )}
            {userProfile.company && (
              <p className="text-base font-semibold text-gray-700 uppercase">{userProfile.company}</p>
            )}
            {userProfile.country && (
              <p className="text-base font-semibold text-gray-700 uppercase">{userProfile.country}</p>
            )}
            <p className="text-sm text-gray-500 mt-2 font-mono">{userProfile.qrCode}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <QRCodeSVG
              value={gateQRData}
              size={180}
              level="H"
            />
          </div>

          {/* User Type Badge - VISITOR/EXHIBITOR/DELEGATE */}
          <div className="mt-6">
            {userTypes.map(type => {
              const config = USER_TYPE_CONFIG[type]
              if (!config) return null
              return (
                <div 
                  key={type}
                  className="bg-gradient-to-r from-cyan-400 via-blue-500 to-gray-900 text-white py-4 rounded-2xl text-center"
                >
                  <p className="text-2xl font-bold uppercase tracking-wider">{t(type)}</p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Buttons removed per user request */}

        {showUpgrades && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900">{t('availableUpgrades')}</h3>
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
                    {t('purchase')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tickets.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">{t('purchaseHistory')}</h3>
            <div className="space-y-3">
              {tickets.map(ticket => (
                <Card key={ticket.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                      <p className="text-sm">{t('scanToCheckIn')}</p>
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
