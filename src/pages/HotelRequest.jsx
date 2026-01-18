import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Hotel, Plus, Minus, Loader2, CheckCircle, AlertCircle, Bed } from 'lucide-react'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { submitHotelRequest } from '../services/eventxApi'

const HotelRequest = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    guestName: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    companyName: user?.company || '',
    email: user?.email || '',
    mobileNo: user?.mobile || '',
    checkInDate: '',
    checkOutDate: '',
  })
  
  const [rooms, setRooms] = useState([
    { roomType: 'single', quantity: 1 }
  ])

  const roomTypes = [
    { value: 'single', label: 'Single Room', description: '1 bed for 1 guest' },
    { value: 'double', label: 'Double Room', description: '1 bed for 2 guests' },
    { value: 'twin', label: 'Twin Room', description: '2 beds for 2 guests' },
    { value: 'suite', label: 'Suite', description: 'Premium room with extras' },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRoomChange = (index, field, value) => {
    const newRooms = [...rooms]
    newRooms[index][field] = value
    setRooms(newRooms)
  }

  const addRoom = () => {
    setRooms([...rooms, { roomType: 'single', quantity: 1 }])
  }

  const removeRoom = (index) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index))
    }
  }

  const incrementQuantity = (index) => {
    const newRooms = [...rooms]
    newRooms[index].quantity = Math.min(10, newRooms[index].quantity + 1)
    setRooms(newRooms)
  }

  const decrementQuantity = (index) => {
    const newRooms = [...rooms]
    newRooms[index].quantity = Math.max(1, newRooms[index].quantity - 1)
    setRooms(newRooms)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSubmitStatus(null)

    try {
      const hotelData = {
        ...formData,
        rooms: rooms,
      }

      await submitHotelRequest(hotelData)
      setSubmitStatus('success')
    } catch (err) {
      setError(err.message || 'Failed to submit hotel request')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalRooms = rooms.reduce((sum, room) => sum + room.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="px-4 pt-12 pb-6 safe-top">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Hotel Booking</h1>
              <p className="text-white/80 text-sm">Request accommodation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 -mt-4">
        {/* Info Card */}
        <Card className="p-4 mb-6 bg-purple-50 border border-purple-100">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Hotel className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">Hotel Accommodation</h3>
              <p className="text-sm text-purple-700 mt-1">
                Request hotel rooms near the Libya Build venue for your stay.
              </p>
            </div>
          </div>
        </Card>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <Card className="p-4 mb-6 bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Hotel request submitted successfully!</p>
            </div>
          </Card>
        )}

        {submitStatus === 'error' && (
          <Card className="p-4 mb-6 bg-red-50 border border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </Card>
        )}

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guest Name *
              </label>
              <input
                type="text"
                name="guestName"
                value={formData.guestName}
                onChange={handleInputChange}
                placeholder="Full name"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Your company"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile *
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  placeholder="+971 50 123 4567"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Room Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Rooms Required *
                </label>
                <span className="text-sm text-purple-600 font-medium">{totalRooms} room{totalRooms !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="space-y-3">
                {rooms.map((room, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <select
                          value={room.roomType}
                          onChange={(e) => handleRoomChange(index, 'roomType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        >
                          {roomTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label} - {type.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decrementQuantity(index)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-semibold">{room.quantity}</span>
                        <button
                          type="button"
                          onClick={() => incrementQuantity(index)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {rooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoom(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRoom}
                className="mt-3 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Room Type
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Bed className="w-5 h-5" />
                  Submit Hotel Request
                </>
              )}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default HotelRequest
