import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

const QRScanner = ({ onScan, onClose, isProcessing }) => {
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)
  const [isStarting, setIsStarting] = useState(true)
  const [error, setError] = useState(null)
  const [cameras, setCameras] = useState([])
  const [activeCamera, setActiveCamera] = useState(null)

  useEffect(() => {
    startScanner()
    
    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    setIsStarting(true)
    setError(null)

    try {
      // Get available cameras
      const devices = await Html5Qrcode.getCameras()
      
      if (!devices || devices.length === 0) {
        setError('No camera found. Please ensure camera access is allowed.')
        setIsStarting(false)
        return
      }

      setCameras(devices)
      
      // Prefer back camera
      const backCamera = devices.find(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('environment')
      )
      const cameraId = backCamera?.id || devices[0].id
      setActiveCamera(cameraId)

      // Initialize scanner
      html5QrCodeRef.current = new Html5Qrcode('qr-reader')
      
      await html5QrCodeRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1
        },
        (decodedText) => {
          // Successfully scanned
          handleScanSuccess(decodedText)
        },
        (errorMessage) => {
          // Scan error - ignore, it's normal when no QR code is in view
        }
      )

      setIsStarting(false)
    } catch (err) {
      console.error('Scanner error:', err)
      setError(err.message || 'Failed to start camera. Please check permissions.')
      setIsStarting(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
  }

  const handleScanSuccess = async (decodedText) => {
    // Stop scanner to prevent multiple scans
    await stopScanner()
    // Call parent handler
    onScan(decodedText)
  }

  const switchCamera = async () => {
    if (cameras.length <= 1) return
    
    await stopScanner()
    
    const currentIndex = cameras.findIndex(c => c.id === activeCamera)
    const nextIndex = (currentIndex + 1) % cameras.length
    const nextCamera = cameras[nextIndex]
    
    setActiveCamera(nextCamera.id)
    setIsStarting(true)

    try {
      html5QrCodeRef.current = new Html5Qrcode('qr-reader')
      
      await html5QrCodeRef.current.start(
        nextCamera.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1
        },
        (decodedText) => {
          handleScanSuccess(decodedText)
        },
        () => {}
      )
      
      setIsStarting(false)
    } catch (err) {
      setError('Failed to switch camera')
      setIsStarting(false)
    }
  }

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Scan QR Code</h3>
        <div className="flex items-center gap-2">
          {cameras.length > 1 && (
            <button 
              onClick={switchCamera}
              disabled={isStarting || isProcessing}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Switch camera"
            >
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Scanner Container */}
      <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden mb-4">
        {/* QR Reader Element */}
        <div 
          id="qr-reader" 
          ref={scannerRef}
          className="w-full h-full"
          style={{ 
            position: 'relative',
            overflow: 'hidden'
          }}
        />

        {/* Scanning overlay */}
        {!error && !isStarting && !isProcessing && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner markers */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-400 rounded-br-lg" />
            </div>
            {/* Scanning line animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 overflow-hidden">
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-pulse" 
                   style={{ animation: 'scanLine 2s ease-in-out infinite' }} />
            </div>
          </div>
        )}

        {/* Loading state */}
        {isStarting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mb-3" />
            <p className="text-white text-sm">Starting camera...</p>
          </div>
        )}

        {/* Processing state */}
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mb-3" />
            <p className="text-white text-sm">Processing QR code...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-white text-sm text-center mb-4">{error}</p>
            <button
              onClick={startScanner}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-sm text-gray-600 text-center">
        Point your camera at a QR code to scan
      </p>

      {/* Add CSS for scan line animation */}
      <style>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(250px); }
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1rem;
        }
        #qr-reader__scan_region {
          min-height: 100% !important;
        }
        #qr-reader__dashboard {
          display: none !important;
        }
      `}</style>
    </div>
  )
}

export default QRScanner
