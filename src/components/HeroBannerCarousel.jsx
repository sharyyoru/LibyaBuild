import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'
import { heroBanners } from '../data/mockData'

const HeroBannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext()
    }, 6000)
    return () => clearInterval(timer)
  }, [currentIndex])

  const handleNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % heroBanners.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handlePrevious = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const currentBanner = heroBanners[currentIndex]

  return (
    <div className="relative">
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Glass Border Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-white/10 to-white/5 p-[1px] pointer-events-none z-10">
          <div className="w-full h-full rounded-3xl bg-transparent" />
        </div>

        {/* Banner Content */}
        <div
          onClick={() => navigate(currentBanner.link)}
          className="relative h-52 cursor-pointer group overflow-hidden"
        >
          {/* Image with Full Detail Visibility - No Cropping */}
          <div className="absolute inset-0">
            <img
              key={currentIndex}
              src={encodeURI(currentBanner.image)}
              alt={currentBanner.title}
              className="w-full h-full object-cover transition-all duration-[6000ms] ease-linear scale-100 group-hover:scale-105"
              onError={(e) => {
                console.error('Banner image failed to load:', currentBanner.image)
                console.error('Encoded URL:', encodeURI(currentBanner.image))
                e.target.style.display = 'block'
                e.target.style.backgroundColor = '#f3f4f6'
                e.target.style.border = '2px dashed #d1d5db'
              }}
              onLoad={() => console.log('Banner image loaded successfully:', currentBanner.image)}
            />
          </div>

          {/* Minimal Gradient Overlays - Maximum background visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          
          {/* Remove all other overlays and glow effects for maximum image visibility */}

          {/* Content - Minimal Overlay */}
          <div className="absolute inset-0">
          </div>

          {/* Navigation Arrows */}
          {heroBanners.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div 
            key={currentIndex}
            className="h-full bg-gradient-to-r from-primary-400 to-accent-400 animate-progress"
          />
        </div>
      </div>

      {/* Pagination Dots - Blue color */}
      {heroBanners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {heroBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary-600 w-6'
                  : 'bg-gray-300 w-1.5 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HeroBannerCarousel
