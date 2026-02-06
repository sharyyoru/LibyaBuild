import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

const sponsorSlides = [
  {
    id: 1,
    image: '/media/1920-length-x-1080-height.jpg',
    alt: 'Libya Build Sponsor',
    link: '/sponsorships'
  },
  {
    id: 2,
    image: '/media/scep.jpeg',
    alt: 'SCEP Sponsor',
    link: '/sponsorships'
  }
]

const SponsorshipCarousel = ({ t }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sponsorSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sponsorSlides.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sponsorSlides.length) % sponsorSlides.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide()
    }
    if (touchStartX.current - touchEndX.current < -50) {
      prevSlide()
    }
  }

  return (
    <div className="px-4 mb-6">
      <div 
        className="relative overflow-hidden rounded-3xl cursor-pointer group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Carousel Wrapper */}
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {sponsorSlides.map((slide) => (
            <div key={slide.id} className="min-w-full relative">
              <Link to={slide.link}>
                <div className="relative overflow-hidden rounded-3xl">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="w-full h-auto object-cover transition-all duration-300 rounded-3xl"
                  />
                  
                  <div className="absolute inset-0 bg-black/5" />
                  
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/30 transition-all">
                      <span className="text-white text-sm font-medium">
                        {t('viewProfile')}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {sponsorSlides.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault()
                prevSlide()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30 z-10"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                nextSlide()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30 z-10"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {sponsorSlides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {sponsorSlides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault()
                  goToSlide(index)
                }}
                className={clsx(
                  'transition-all duration-300',
                  currentSlide === index
                    ? 'w-8 h-2 bg-white rounded-full'
                    : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/70'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SponsorshipCarousel
