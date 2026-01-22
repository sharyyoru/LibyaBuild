import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plane, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import { storeFlightDetails } from '../services/eventxApi'

const FlightTickets = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { language, isRTL } = useLanguage()
  const { t } = useTranslation(language)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    flightNo: '',
    departureCity: '',
    arrivalDate: '',
    arrivalTime: '',
  })
  
  const [flightTicketFile, setFlightTicketFile] = useState(null)
  const [passportFile, setPassportFile] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      if (type === 'flightTicket') {
        setFlightTicketFile(file)
      } else if (type === 'passport') {
        setPassportFile(file)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSubmitStatus(null)

    try {
      const flightData = {
        flightNo: formData.flightNo,
        departureCity: formData.departureCity,
        arrivalDate: formData.arrivalDate,
        arrivalTime: formData.arrivalTime,
      }

      await storeFlightDetails(flightData, flightTicketFile, passportFile)
      setSubmitStatus('success')
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          flightNo: '',
          departureCity: '',
          arrivalDate: '',
          arrivalTime: '',
        })
        setFlightTicketFile(null)
        setPassportFile(null)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to submit flight details')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="px-4 pt-12 pb-6 safe-top">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{t('flightTickets')}</h1>
              <p className="text-white/80 text-sm">{t('submitFlightDetailsHeader')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 -mt-4">
        {/* Info Card */}
        <Card className="p-4 mb-6 bg-blue-50 border border-blue-100">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">{t('flightInformation')}</h3>
              <p className="text-sm text-blue-700 mt-1">
                {t('flightInformationDesc')}
              </p>
            </div>
          </div>
        </Card>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <Card className="p-4 mb-6 bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">{t('flightDetailsSuccess')}</p>
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
                {t('flightNumber')} *
              </label>
              <input
                type="text"
                name="flightNo"
                value={formData.flightNo}
                onChange={handleInputChange}
                placeholder={t('flightNumberPlaceholder')}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('departureCity')} *
              </label>
              <input
                type="text"
                name="departureCity"
                value={formData.departureCity}
                onChange={handleInputChange}
                placeholder={t('departureCityPlaceholder')}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('arrivalDate')} *
                </label>
                <input
                  type="date"
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('arrivalTime')} *
                </label>
                <input
                  type="time"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* File Uploads */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('flightTicketOptional')}
              </label>
              <label className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {flightTicketFile ? flightTicketFile.name : t('uploadFlightTicket')}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'flightTicket')}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('passportCopyOptional')}
              </label>
              <label className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {passportFile ? passportFile.name : t('uploadPassportCopy')}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'passport')}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  <Plane className="w-5 h-5" />
                  {t('submitFlightDetails')}
                </>
              )}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default FlightTickets
