import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'
import { QrCode, History, Camera, CheckCircle, XCircle, User, Building2, Users, Calendar, ArrowLeft, Trash2, StopCircle, RefreshCw } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'

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

const SCAN_TYPES = {
  gate: { label: 'Gate Entry', color: 'bg-primary-600' },
  delegate: { label: 'Delegate Access', color: 'bg-purple-600' }
}

const getCurrentDay = () => {
  const today = new Date().toISOString().split('T')[0]
  const day = EVENT_DAYS.find(d => d.date === today)
  return day ? day.key : 'day1'
}

const Scanner = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('scan')
  const [scanType, setScanType] = useState('gate')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [manualCode, setManualCode] = useState('')
  const [todayScans, setTodayScans] = useState(0)
  const [scanHistory, setScanHistory] = useState([])
  const [cameraReady, setCameraReady] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const scanIntervalRef = useRef(null)

  useEffect(() => {
    loadScanHistory()
    return () => {
      stopScanning()
    }
  }, [])

  const loadScanHistory = () => {
    const history = JSON.parse(localStorage.getItem('scanHistory') || '[]')
    setScanHistory(history)
    const today = new Date().toDateString()
    const todayCount = history.filter(s => new Date(s.timestamp).toDateString() === today).length
    setTodayScans(todayCount)
  }

  const startScanning = async () => {
    try {
      setScanError(null)
      setScanResult(null)
      setCameraReady(false)
      setScanning(true)
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setCameraReady(true)
          // Start QR code scanning interval
          scanIntervalRef.current = setInterval(scanQRCode, 200) // Scan every 200ms
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      setScanError('Camera access denied. Please allow camera access and try again.')
      setScanning(false)
    }
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      })
      
      if (code) {
        // QR Code found!
        handleQRCodeFound(code.data)
      }
    }
  }

  const handleQRCodeFound = (decodedText) => {
    // Vibrate if available
    if (navigator.vibrate) {
      navigator.vibrate(200)
    }
    
    // Stop scanning
    stopScanning()
    
    // Process the QR data
    const userData = processQRData(decodedText)
    const result = recordScan(userData)
    setScanResult(result)
  }

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setScanning(false)
    setCameraReady(false)
  }

  const processQRData = (qrString) => {
    try {
      const data = JSON.parse(qrString)
      return data
    } catch {
      return { id: qrString, name: 'Unknown', types: ['visitor'], attendance: {} }
    }
  }

  const recordScan = (userData) => {
    const currentDay = getCurrentDay()
    const isDelegate = userData.types?.includes('delegate')
    
    // For delegate scans, check if user is actually a delegate
    if (scanType === 'delegate' && !isDelegate) {
      return {
        success: false,
        error: 'User is not a delegate. Access denied.',
        userData
      }
    }

    const scanRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      scanType: scanType,
      userId: userData.id,
      userName: userData.name,
      userEmail: userData.email || '',
      userTypes: userData.types || ['visitor'],
      day: currentDay,
      attendanceBefore: { ...userData.attendance },
      success: true
    }

    // Update user's attendance in localStorage (simulate sync)
    const allUsers = JSON.parse(localStorage.getItem('scannedUsers') || '{}')
    if (!allUsers[userData.id]) {
      allUsers[userData.id] = { ...userData, attendance: {} }
    }
    
    if (scanType === 'gate') {
      allUsers[userData.id].attendance[currentDay] = true
    } else if (scanType === 'delegate') {
      allUsers[userData.id].delegateAccess = allUsers[userData.id].delegateAccess || {}
      allUsers[userData.id].delegateAccess[currentDay] = true
    }
    
    localStorage.setItem('scannedUsers', JSON.stringify(allUsers))

    // Save scan to history
    const history = JSON.parse(localStorage.getItem('scanHistory') || '[]')
    history.unshift(scanRecord)
    localStorage.setItem('scanHistory', JSON.stringify(history.slice(0, 500)))

    loadScanHistory()

    return {
      success: true,
      day: currentDay,
      scanType: scanType,
      userData: { ...userData, attendance: allUsers[userData.id].attendance },
      message: scanType === 'gate' 
        ? `Checked in for ${currentDay.replace('day', 'Day ')}`
        : `Delegate access granted for ${currentDay.replace('day', 'Day ')}`
    }
  }

  const handleManualScan = () => {
    if (!manualCode.trim()) return
    
    const userData = processQRData(manualCode)
    const result = recordScan(userData)
    setScanResult(result)
    setManualCode('')
  }

  const simulateScan = () => {
    const mockData = {
      id: `USER-${Date.now()}`,
      email: 'test@example.com',
      name: 'Test User',
      types: ['visitor', 'delegate'],
      attendance: {}
    }
    const result = recordScan(mockData)
    setScanResult(result)
  }

  const clearHistory = () => {
    localStorage.removeItem('scanHistory')
    loadScanHistory()
  }

  const clearResult = () => {
    setScanResult(null)
    stopScanning()
  }

  return (
    <>
      <Header title="Scanner" showBack={true} />
      
      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'scan' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            <QrCode className="w-4 h-4 inline mr-2" />
            Scan
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'history' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            History
          </button>
        </div>

        {activeTab === 'scan' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 text-center">
                <p className="text-gray-500 text-sm">Today's Scans</p>
                <p className="text-3xl font-bold text-primary-600">{todayScans}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-gray-500 text-sm">Current Day</p>
                <p className="text-3xl font-bold text-accent-600">{getCurrentDay().replace('day', 'Day ')}</p>
              </Card>
            </div>

            {/* Scan Type Selector */}
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">Scan Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SCAN_TYPES).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setScanType(key)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      scanType === key
                        ? `border-primary-600 ${config.color} text-white`
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {scanType === 'gate' 
                  ? 'Scan for main event entry - marks daily attendance'
                  : 'Scan for delegate-only areas - requires delegate status'}
              </p>
            </Card>

            {/* Scan Result */}
            {scanResult && (
              <Card className={`p-4 ${scanResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {scanResult.success ? (
                    <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-bold ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {scanResult.success ? 'Scan Successful!' : 'Scan Failed'}
                    </h3>
                    <p className={`text-sm ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {scanResult.message || scanResult.error}
                    </p>
                    {scanResult.userData && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm"><strong>Name:</strong> {scanResult.userData.name}</p>
                        <p className="text-sm"><strong>Email:</strong> {scanResult.userData.email}</p>
                        <div className="flex gap-1 mt-1">
                          {scanResult.userData.types?.map(type => {
                            const config = USER_TYPE_CONFIG[type]
                            return config ? (
                              <span key={type} className={`${config.color} text-white text-xs px-2 py-0.5 rounded-full`}>
                                {config.label}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={clearResult} className="text-gray-400 hover:text-gray-600">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            )}

            {/* Camera Scanner */}
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary-600" />
                QR Scanner
              </h3>
              
              {/* Video element for camera feed */}
              {scanning && (
                <div className="relative mb-3 rounded-xl overflow-hidden bg-black" style={{ minHeight: '300px' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ minHeight: '300px' }}
                  />
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-56 h-56 border-2 border-white rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-400 rounded-br-lg" />
                    </div>
                  </div>
                  {/* Scanning indicator */}
                  {cameraReady && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Scanning...
                    </div>
                  )}
                </div>
              )}
              
              {/* Hidden canvas for QR processing */}
              <canvas ref={canvasRef} className="hidden" />
              
              {scanning ? (
                <Button fullWidth variant="secondary" onClick={stopScanning}>
                  <StopCircle className="w-5 h-5 mr-2" />
                  Stop Scanning
                </Button>
              ) : (
                <Button fullWidth onClick={startScanning}>
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera Scanner
                </Button>
              )}
              
              {scanError && (
                <p className="text-red-500 text-sm mt-2">{scanError}</p>
              )}
            </Card>

            {/* Manual Entry */}
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">Manual Entry</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter QR code or paste JSON..."
                  className="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button onClick={handleManualScan}>Scan</Button>
              </div>
            </Card>

            {/* Test Button */}
            <Button fullWidth variant="outline" onClick={simulateScan}>
              Test Scan (Demo)
            </Button>
          </>
        )}

        {activeTab === 'history' && (
          <>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Scan History</h3>
              <button
                onClick={clearHistory}
                className="text-red-600 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>

            {scanHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No scans yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {scanHistory.map((scan) => (
                  <Card key={scan.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{scan.userName}</p>
                        <p className="text-xs text-gray-500">{scan.userEmail}</p>
                        <div className="flex gap-1 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            scan.scanType === 'gate' ? 'bg-primary-100 text-primary-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {SCAN_TYPES[scan.scanType]?.label || 'Gate Entry'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {scan.day?.replace('day', 'Day ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(scan.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default Scanner
