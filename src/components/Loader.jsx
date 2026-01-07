const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className={`inline-block ${className}`}>
      <div className={`relative ${sizes[size]}`}>
        <svg className="animate-spin-slow" viewBox="0 0 500 500">
          <defs>
            <style>
              {`
                .cls-1 { fill: #2264dc; }
                .cls-2 { fill: #12deec; }
              `}
            </style>
          </defs>
          <path className="cls-1" d="M168.5,127.75h30.56c22.5,0,40.75,18.24,40.75,40.75v30.56c0,22.5-18.24,40.75-40.75,40.75h-30.56c-22.5,0-40.75-18.24-40.75-40.75v-30.56c0-22.5,18.24-40.75,40.75-40.75Z"/>
          <path className="cls-2" d="M300.94,127.75h30.56c22.5,0,40.75,18.24,40.75,40.75v30.56c0,22.5-18.24,40.75-40.75,40.75h-30.56c-22.5,0-40.75-18.24-40.75-40.75v-30.56c0-22.5,18.24-40.75,40.75-40.75Z"/>
          <path className="cls-2" d="M168.5,260.19h30.56c22.5,0,40.75,18.24,40.75,40.75v30.56c0,22.5-18.24,40.75-40.75,40.75h-30.56c-22.5,0-40.75-18.24-40.75-40.75v-30.56c0-22.51,18.24-40.75,40.75-40.75Z"/>
          <path className="cls-1" d="M300.94,260.19h30.56c22.5,0,40.75,18.24,40.75,40.75v30.56c0,22.51-18.24,40.75-40.75,40.75h-30.56c-22.5,0-40.75-18.24-40.75-40.75v-30.56c0-22.51,18.24-40.75,40.75-40.75Z"/>
        </svg>
      </div>
      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default Loader
