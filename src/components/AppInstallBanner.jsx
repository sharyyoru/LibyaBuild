import { useState, useEffect } from 'react'
import { X, Download, Smartphone, CheckCircle } from 'lucide-react'

const AppInstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    // Check if running on Android
    const userAgent = navigator.userAgent.toLowerCase()
    const android = userAgent.includes('android')
    setIsAndroid(android)

    // Check if app is already installed (PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if banner was dismissed recently
    const dismissed = localStorage.getItem('appBannerDismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const dayInMs = 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < dayInMs) {
        return
      }
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show banner for Android users after short delay
    if (android) {
      setTimeout(() => setShowBanner(true), 2000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      // PWA install
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowBanner(false)
      }
      setDeferredPrompt(null)
    } else if (isAndroid) {
      // Redirect to APK download or Play Store
      window.open('/downloads/libya-build-2026.apk', '_blank')
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('appBannerDismissed', Date.now().toString())
    setShowBanner(false)
  }

  if (!showBanner || isInstalled) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl p-4 shadow-xl">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <img src="/media/App Icons-14.svg" alt="Libya Build" className="w-10 h-10" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm">Get the Libya Build App</h3>
            <p className="text-white/80 text-xs mt-0.5">
              {isAndroid 
                ? 'Download our Android app for the best experience'
                : 'Install for offline access & push notifications'
              }
            </p>
          </div>
          
          <button
            onClick={handleInstall}
            className="bg-white text-primary-600 px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
        </div>

        {isAndroid && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 text-white/90 text-xs">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span>Works offline • Fast loading • Push notifications</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppInstallBanner
