import { useEffect, useState } from 'react'

const LoadingScreen = ({ onLoadComplete }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onLoadComplete?.(), 300)
    }, 2500)

    return () => clearTimeout(timer)
  }, [onLoadComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <img 
        src="/media/newdesign/LB App Loading Screen.jpg" 
        alt="Loading" 
        className="w-full h-full object-cover"
      />
    </div>
  )
}

export default LoadingScreen
