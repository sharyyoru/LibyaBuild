import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, ArrowLeft, User, Building2, Users } from 'lucide-react'

const USER_TYPE_CONFIG = {
  visitor: { label: 'Visitor', color: 'bg-blue-500', icon: User },
  exhibitor: { label: 'Exhibitor', color: 'bg-green-500', icon: Building2 },
  delegate: { label: 'Delegate', color: 'bg-purple-500', icon: Users }
}

const ScanResult = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Scan Data</h2>
          <p className="text-gray-400 mb-6">Please scan a QR code first</p>
          <button
            onClick={() => navigate('/scanner')}
            className="bg-primary-600 px-6 py-3 rounded-xl font-medium"
          >
            Back to Scanner
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <button
          onClick={() => navigate('/scanner')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Scanner
        </button>
      </div>

      <div className="p-4">
        <div className={`rounded-2xl p-6 ${result.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
          <div className="text-center mb-6">
            {result.success ? (
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold">
              {result.success ? 'Check-in Successful' : 'Check-in Failed'}
            </h2>
          </div>

          {result.user && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-xl font-bold">{result.user.name}</p>
              </div>

              {result.user.email && (
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="font-medium">{result.user.email}</p>
                </div>
              )}

              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">User Types</p>
                <div className="flex flex-wrap gap-2">
                  {(result.user.types || ['visitor']).map(type => {
                    const config = USER_TYPE_CONFIG[type]
                    if (!config) return null
                    const Icon = config.icon
                    return (
                      <span 
                        key={type}
                        className={`${config.color} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}
                      >
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Checked in for</p>
                <p className="text-xl font-bold text-primary-400">{result.day?.replace('day', 'Day ')}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/scanner')}
            className="w-full mt-6 bg-primary-600 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors"
          >
            Scan Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScanResult
