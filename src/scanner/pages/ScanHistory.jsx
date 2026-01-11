import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Building2, Users, Calendar, Trash2, Clock } from 'lucide-react'

const USER_TYPE_CONFIG = {
  visitor: { label: 'Visitor', color: 'bg-blue-500', icon: User },
  exhibitor: { label: 'Exhibitor', color: 'bg-green-500', icon: Building2 },
  delegate: { label: 'Delegate', color: 'bg-purple-500', icon: Users }
}

const ScanHistory = () => {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const scans = JSON.parse(localStorage.getItem('scanHistory') || '[]')
    setHistory(scans)
  }, [])

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all scan history?')) {
      localStorage.setItem('scanHistory', '[]')
      setHistory([])
    }
  }

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(s => s.day === filter)

  const groupedByDate = filteredHistory.reduce((acc, scan) => {
    const date = new Date(scan.timestamp).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(scan)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="font-bold">Scan History</h1>
          <button
            onClick={clearHistory}
            className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['all', 'day1', 'day2', 'day3', 'day4'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'All' : f.replace('day', 'Day ')}
            </button>
          ))}
        </div>

        <div className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Scans</p>
          <p className="text-3xl font-bold text-primary-400">{filteredHistory.length}</p>
        </div>

        {Object.keys(groupedByDate).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No scans recorded yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, scans]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {date}
                </h3>
                <div className="space-y-2">
                  {scans.map(scan => (
                    <div 
                      key={scan.id}
                      className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{scan.userName}</p>
                          {scan.userEmail && (
                            <p className="text-sm text-gray-400">{scan.userEmail}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(scan.userTypes || ['visitor']).map(type => {
                          const config = USER_TYPE_CONFIG[type]
                          if (!config) return null
                          return (
                            <span 
                              key={type}
                              className={`${config.color} text-white px-2 py-0.5 rounded-full text-xs font-medium`}
                            >
                              {config.label}
                            </span>
                          )
                        })}
                        <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                          {scan.day?.replace('day', 'Day ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ScanHistory
