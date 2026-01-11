import { useEffect, useState } from 'react'

const NativeWrapper = ({ children }) => {
  const [isNative, setIsNative] = useState(false)
  const [platform, setPlatform] = useState('web')

  useEffect(() => {
    // Detect if running in Capacitor native environment
    const detectPlatform = async () => {
      if (window.Capacitor) {
        setIsNative(true)
        setPlatform(window.Capacitor.getPlatform())
        
        // Initialize native plugins if available
        initializeNativePlugins()
      }
    }

    detectPlatform()
  }, [])

  const initializeNativePlugins = async () => {
    try {
      // Status bar configuration for Android
      if (window.Capacitor?.Plugins?.StatusBar) {
        const { StatusBar } = window.Capacitor.Plugins
        await StatusBar.setBackgroundColor({ color: '#2264dc' })
        await StatusBar.setStyle({ style: 'LIGHT' })
      }

      // Splash screen handling
      if (window.Capacitor?.Plugins?.SplashScreen) {
        const { SplashScreen } = window.Capacitor.Plugins
        setTimeout(() => {
          SplashScreen.hide()
        }, 500)
      }

      // Push notifications setup
      if (window.Capacitor?.Plugins?.PushNotifications) {
        const { PushNotifications } = window.Capacitor.Plugins
        
        const result = await PushNotifications.requestPermissions()
        if (result.receive === 'granted') {
          await PushNotifications.register()
        }

        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token:', token.value)
          // Send token to backend for push notifications
          localStorage.setItem('pushToken', token.value)
        })

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received:', notification)
        })
      }

      // Handle hardware back button on Android
      if (window.Capacitor?.Plugins?.App) {
        const { App } = window.Capacitor.Plugins
        
        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back()
          } else {
            App.exitApp()
          }
        })

        // Handle app state changes
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active:', isActive)
        })
      }

    } catch (error) {
      console.error('Error initializing native plugins:', error)
    }
  }

  // Expose platform info via context or global
  useEffect(() => {
    window.__LIBYA_BUILD__ = {
      isNative,
      platform,
      version: '1.0.0'
    }
  }, [isNative, platform])

  return (
    <div 
      className={`native-wrapper ${isNative ? 'is-native' : 'is-web'} platform-${platform}`}
      data-platform={platform}
    >
      {children}
    </div>
  )
}

export default NativeWrapper
