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
      {/* Fancy Header Label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white/90 text-sm font-medium">Featured Highlights</span>
        </div>
        <div className="flex items-center gap-1.5">
          {heroBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/30 w-1.5 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

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
          {/* Image with Ken Burns Effect */}
          <div className="absolute inset-0">
            <img
              key={currentIndex}
              src={currentBanner.image}
              alt={currentBanner.title}
              className="w-full h-full object-cover transition-all duration-[6000ms] ease-linear scale-100 group-hover:scale-110 animate-kenburns"
            />
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 to-transparent" />
          
          {/* Animated Glow Effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary-500/30 rounded-full blur-3xl animate-pulse delay-1000" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            {/* Category Tag */}
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/20">
                <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse" />
                {currentBanner.category || 'Featured'}
              </span>
            </div>

            {/* Title with Animation */}
            <h2 
              key={`title-${currentIndex}`}
              className="text-2xl font-bold text-white mb-2 leading-tight animate-slideUp"
            >
              {currentBanner.title}
            </h2>
            
            {/* Subtitle */}
            <p 
              key={`sub-${currentIndex}`}
              className="text-white/80 text-sm mb-3 line-clamp-2 animate-slideUp animation-delay-100"
            >
              {currentBanner.subtitle}
            </p>

            {/* CTA Button */}
            <div className="flex items-center gap-2">
              <span className="text-white/90 text-sm font-medium group-hover:text-white transition-colors">
                Learn More
              </span>
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
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
    </div>
  )
}

export default HeroBannerCarousel
