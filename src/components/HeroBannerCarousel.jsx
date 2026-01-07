import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { heroBanners } from '../data/mockData'

const HeroBannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroBanners.length)
  }

  const currentBanner = heroBanners[currentIndex]

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      <div
        onClick={() => navigate(currentBanner.link)}
        className="relative h-48 cursor-pointer group"
      >
        <img
          src={currentBanner.image}
          alt={currentBanner.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
          <h2 className="text-2xl font-bold text-white mb-1">{currentBanner.title}</h2>
          <p className="text-white/90 text-sm">{currentBanner.subtitle}</p>
        </div>
      </div>

      {heroBanners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {heroBanners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default HeroBannerCarousel
