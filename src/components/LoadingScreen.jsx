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
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 flex items-center justify-center">
      <div className="relative">
        <div className="logo-container">
          <svg className="logo-svg" viewBox="0 0 500 500" width="120" height="120">
            <defs>
              <style>
                {`
                  .cls-1 { fill: #2264dc; }
                  .cls-2 { fill: #12deec; }
                `}
              </style>
            </defs>
            <path className="cls-1 square square-1" d="M168.5,127.75h30.56c22.5,0,40.75,18.24,40.75,40.75v30.56c0,22.5-18.24,40.75-40.75,40.75h-30.56c-22.5,0-40.75-18.24-40.75-40.75v-30.56c0-22.5,18.24-40.75,40.75-40.75Z"/>
            <path className="cls-2 square square-2" d="M300.94,127.75h30.56c22.5,0,40.75,18.24,40.75,40.75v30.56c0,22.5-18.24,40.75-40.75,40.75h-30.56c-22.5,0-40.75-18.24-40.75-40.75v-30.56c0-22.5,18.24-40.75,40.75-40.75Z"/>
            <path className="cls-2 square square-3" d="M168.5,260.19h30.56c22.5,0,40.75,18.24,40.75,40.75v30.56c0,22.5-18.24,40.75-40.75,40.75h-30.56c-22.5,0-40.75-18.24-40.75-40.75v-30.56c0-22.51,18.24-40.75,40.75-40.75Z"/>
            <path className="cls-1 square square-4" d="M300.94,260.19h30.56c22.5,0,40.75,18.24,40.75,40.75v30.56c0,22.51-18.24,40.75-40.75,40.75h-30.56c-22.5,0-40.75-18.24-40.75-40.75v-30.56c0-22.51,18.24-40.75,40.75-40.75Z"/>
          </svg>
        </div>
        
        <div className="mt-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Libya Build</h1>
          <div className="flex gap-1 justify-center">
            <div className="loading-dot"></div>
            <div className="loading-dot" style={{ animationDelay: '0.2s' }}></div>
            <div className="loading-dot" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      <style>{`
        .logo-container {
          animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .square {
          animation: pulse 2s ease-in-out infinite;
          transform-origin: center;
        }

        .square-1 {
          animation-delay: 0s;
        }

        .square-2 {
          animation-delay: 0.2s;
        }

        .square-3 {
          animation-delay: 0.4s;
        }

        .square-4 {
          animation-delay: 0.6s;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(0.95);
          }
        }

        .loading-dot {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          40% {
            transform: translateY(-12px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen
