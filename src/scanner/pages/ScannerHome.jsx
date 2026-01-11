import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, History, Camera, CheckCircle, User, Building2, Users, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const EVENT_DAYS = [
  { key: 'day1', label: 'Day 1', date: '2026-03-15' },
  { key: 'day2', label: 'Day 2', date: '2026-03-16' },
  { key: 'day3', label: 'Day 3', date: '2026-03-17' },
  { key: 'day4', label: 'Day 4', date: '2026-03-18' }
]

const USER_TYPE_CONFIG = {
  visitor: { label: 'Visitor', color: 'bg-blue-500', icon: User },
  exhibitor: { label: 'Exhibitor', color: 'bg-green-500', icon: Building2 },
  delegate: { label: 'Delegate', color: 'bg-purple-500', icon: Users }
}

const getCurrentDay = () => {
  const today = new Date().toISOString().split('T')[0]
  const day = EVENT_DAYS.find(d => d.date === today)
  return day ? day.key : 'day1'
}

const ScannerHome = ({ user }) => {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [manualCode, setManualCode] = useState('')
  const [todayScans, setTodayScans] = useState(0)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    const scans = JSON.parse(localStorage.getItem('scanHistory') || '[]')
    const today = new Date().toDateString()
    const todayCount = scans.filter(s => new Date(s.timestamp).toDateString() === today).length
    setTodayScans(todayCount)
  }, [scanResult])

  const startScanning = async () => {
    try {
      setScanError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setScanning(true)
    } catch (err) {
      setScanError('Camera access denied. Please allow camera permissions.')
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setScanning(false)
  }

  const processQRData = (qrString) => {
    try {
      const data = JSON.parse(qrString)
      return data
    } catch {
      return { id: qrString, name: 'Unknown', types: ['visitor'], attendance: {} }
    }
  }

  const recordScan = async (userData) => {
    const currentDay = getCurrentDay()
    const scanRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      userId: userData.id,
      userName: userData.name,
      userEmail: userData.email || '',
      userTypes: userData.types || ['visitor'],
      day: currentDay,
      attendanceBefore: { ...userData.attendance },
      scannedBy: user.email
    }

    const history = JSON.parse(localStorage.getItem('scanHistory') || '[]')
    history.unshift(scanRecord)
    localStorage.setItem('scanHistory', JSON.stringify(history.slice(0, 500)))

    try {
      await supabase.from('attendance_scans').insert({
        user_id: userData.id,
        user_email: userData.email,
        user_name: userData.name,
        user_types: userData.types,
        day: currentDay,
        scanned_by: user.email,
        scanned_at: new Date().toISOString()
      })
    } catch (err) {
      console.log('Failed to save to database:', err)
    }

    return { ...scanRecord, newDay: currentDay }
  }

  const handleManualScan = async () => {
    if (!manualCode.trim()) return
    
    const userData = processQRData(manualCode)
    const result = await recordScan(userData)
    setScanResult(result)
    setManualCode('')
    setTodayScans(prev => prev + 1)
  }

  const simulateScan = async () => {
    const mockData = {
      id: `USER-${Date.now()}`,
      email: 'test@example.com',
      name: 'Test User',
      types: ['visitor', 'delegate'],
      attendance: { day1: true, day2: false, day3: false, day4: false }
    }
    const result = await recordScan(mockData)
    setScanResult(result)
    setTodayScans(prev => prev + 1)
    stopScanning()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold">Libya Build Scanner</h1>
              <p className="text-xs text-gray-400">Attendance Tracker</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Today's Scans</p>
            <p className="text-3xl font-bold text-primary-400">{todayScans}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Current Day</p>
            <p className="text-3xl font-bold text-accent-400">{getCurrentDay().replace('day', 'Day ')}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary-400" />
            QR Scanner
          </h2>

          {scanning ? (
            <div className="space-y-4">
              <div className="relative aspect-square bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-4 border-primary-500 rounded-xl pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/50 rounded-lg" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={stopScanning}
                  className="flex-1 bg-gray-700 py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={simulateScan}
                  className="flex-1 bg-primary-600 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  Simulate Scan
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startScanning}
              className="w-full bg-primary-600 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-6 h-6" />
              Start Scanning
            </button>
          )}

          {scanError && (
            <div className="mt-4 bg-red-900/30 border border-red-700 rounded-xl p-3 text-red-300 text-sm">
              {scanError}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h2 className="font-bold mb-4">Manual Entry</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Paste QR code data..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <button
              onClick={handleManualScan}
              className="bg-primary-600 px-6 rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Process
            </button>
          </div>
        </div>

        {scanResult && (
          <div className="bg-green-900/30 border border-green-700 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="font-bold text-green-400">Scan Successful</h3>
                <p className="text-sm text-gray-400">{new Date(scanResult.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Attendee</p>
                <p className="font-medium">{scanResult.userName}</p>
                {scanResult.userEmail && <p className="text-sm text-gray-400">{scanResult.userEmail}</p>}
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">User Types</p>
                <div className="flex flex-wrap gap-2">
                  {scanResult.userTypes.map(type => {
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
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Attendance recorded for {scanResult.newDay.replace('day', 'Day ')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setScanResult(null)}
              className="w-full mt-4 bg-gray-700 py-2 rounded-xl font-medium hover:bg-gray-600 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScannerHome
