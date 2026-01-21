import { useState } from 'react'
import { Plane, FileText, Hotel, Loader2, Check, ChevronRight, Upload } from 'lucide-react'
import { storeFlightDetails, submitVisaApplication, submitHotelRequest } from '../services/eventxApi'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'

const TravelServices = () => {
  const { language } = useLanguage()
  const { t } = useTranslation(language)
  const [activeTab, setActiveTab] = useState('flight')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')

  const [flightData, setFlightData] = useState({
    passengerName: '',
    nationality: '',
    airlines: '',
    flightNo: '',
    arrivalDate: '',
    arrivalTime: ''
  })

  const [visaData, setVisaData] = useState({
    companyName: '',
    applicantName: '',
    nationality: '',
    passportNo: '',
    mobileNo: '',
    email: '',
    dateOfBirth: '',
    placeOfBirth: '',
    profession: '',
    dateOfExpiry: '',
    dateOfIssue: ''
  })

  const [hotelData, setHotelData] = useState({
    guestName: '',
    companyName: '',
    email: '',
    mobileNo: '',
    checkInDate: '',
    checkOutDate: '',
    roomType: 'single',
    quantity: 1
  })

  const handleFlightSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await storeFlightDetails(flightData)
      setSuccess('flight')
      setFlightData({ passengerName: '', nationality: '', airlines: '', flightNo: '', arrivalDate: '', arrivalTime: '' })
    } catch (err) {
      setError(err.message || 'Failed to submit flight details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVisaSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await submitVisaApplication(visaData)
      setSuccess('visa')
      setVisaData({ companyName: '', applicantName: '', nationality: '', passportNo: '', mobileNo: '', email: '', dateOfBirth: '', placeOfBirth: '', profession: '', dateOfExpiry: '', dateOfIssue: '' })
    } catch (err) {
      setError(err.message || 'Failed to submit visa application')
    } finally {
      setIsLoading(false)
    }
  }

  const handleHotelSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await submitHotelRequest({
        ...hotelData,
        rooms: [{ room_id: hotelData.roomType === 'single' ? 1 : 2, quantity: hotelData.quantity }]
      })
      setSuccess('hotel')
      setHotelData({ guestName: '', companyName: '', email: '', mobileNo: '', checkInDate: '', checkOutDate: '', roomType: 'single', quantity: 1 })
    } catch (err) {
      setError(err.message || 'Failed to submit hotel request')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'flight', label: t('flight'), icon: Plane },
    { id: 'visa', label: t('visa'), icon: FileText },
    { id: 'hotel', label: t('hotel'), icon: Hotel }
  ]

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">{t('travelServices')}</h1>
        <p className="text-white/80 mt-1">{t('bookTravelArrangements')}</p>
      </div>

      <div className="flex bg-white border-b sticky top-0 z-10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSuccess(null); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-3">
            <Check className="w-5 h-5" />
            <span>{success} {t('requestSubmittedSuccessfully')}</span>
          </div>
        )}

        {activeTab === 'flight' && (
          <form onSubmit={handleFlightSubmit} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary-600" />
              {t('flightDetails')}
            </h2>

            <div>
              <label className={labelClass}>{t('passengerName')} *</label>
              <input
                type="text"
                value={flightData.passengerName}
                onChange={(e) => setFlightData(p => ({ ...p, passengerName: e.target.value }))}
                required
                className={inputClass}
                placeholder={t('fullNameOnPassport')}
              />
            </div>

            <div>
              <label className={labelClass}>Nationality *</label>
              <input
                type="text"
                value={flightData.nationality}
                onChange={(e) => setFlightData(p => ({ ...p, nationality: e.target.value }))}
                required
                className={inputClass}
                placeholder={t('yourNationality')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('airlines')} *</label>
                <input
                  type="text"
                  value={flightData.airlines}
                  onChange={(e) => setFlightData(p => ({ ...p, airlines: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder={t('airlineName')}
                />
              </div>
              <div>
                <label className={labelClass}>{t('flightNo')} *</label>
                <input
                  type="text"
                  value={flightData.flightNo}
                  onChange={(e) => setFlightData(p => ({ ...p, flightNo: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder="e.g. LN102"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('arrivalDate')} *</label>
                <input
                  type="date"
                  value={flightData.arrivalDate}
                  onChange={(e) => setFlightData(p => ({ ...p, arrivalDate: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('arrivalTime')} *</label>
                <input
                  type="time"
                  value={flightData.arrivalTime}
                  onChange={(e) => setFlightData(p => ({ ...p, arrivalTime: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plane className="w-5 h-5" />}
              {isLoading ? t('submitting') : t('submitFlightDetails')}
            </button>
          </form>
        )}

        {activeTab === 'visa' && (
          <form onSubmit={handleVisaSubmit} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              {t('visaApplication')}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('applicantName')} *</label>
                <input
                  type="text"
                  value={visaData.applicantName}
                  onChange={(e) => setVisaData(p => ({ ...p, applicantName: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className={labelClass}>Company *</label>
                <input
                  type="text"
                  value={visaData.companyName}
                  onChange={(e) => setVisaData(p => ({ ...p, companyName: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('nationality')} *</label>
                <input
                  type="text"
                  value={visaData.nationality}
                  onChange={(e) => setVisaData(p => ({ ...p, nationality: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder="Nationality"
                />
              </div>
              <div>
                <label className={labelClass}>{t('passportNo')} *</label>
                <input
                  type="text"
                  value={visaData.passportNo}
                  onChange={(e) => setVisaData(p => ({ ...p, passportNo: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder="Passport number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('mobileNo')} *</label>
                <input
                  type="tel"
                  value={visaData.mobileNo}
                  onChange={(e) => setVisaData(p => ({ ...p, mobileNo: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder={t('mobileNumber')}
                />
              </div>
              <div>
                <label className={labelClass}>{t('email')} *</label>
                <input
                  type="email"
                  value={visaData.email}
                  onChange={(e) => setVisaData(p => ({ ...p, email: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder={t('emailAddress')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('dateOfBirth')} *</label>
                <input
                  type="date"
                  value={visaData.dateOfBirth}
                  onChange={(e) => setVisaData(p => ({ ...p, dateOfBirth: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('placeOfBirth')} *</label>
                <input
                  type="text"
                  value={visaData.placeOfBirth}
                  onChange={(e) => setVisaData(p => ({ ...p, placeOfBirth: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder={t('cityCountry')}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('profession')} *</label>
              <input
                type="text"
                value={visaData.profession}
                onChange={(e) => setVisaData(p => ({ ...p, profession: e.target.value }))}
                required
                className={inputClass}
                placeholder={t('profession')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Passport Issue Date *</label>
                <input
                  type="date"
                  value={visaData.dateOfIssue}
                  onChange={(e) => setVisaData(p => ({ ...p, dateOfIssue: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Passport Expiry Date *</label>
                <input
                  type="date"
                  value={visaData.dateOfExpiry}
                  onChange={(e) => setVisaData(p => ({ ...p, dateOfExpiry: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              {isLoading ? t('submitting') : t('submitVisaApplication')}
            </button>
          </form>
        )}

        {activeTab === 'hotel' && (
          <form onSubmit={handleHotelSubmit} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Hotel className="w-5 h-5 text-primary-600" />
              {t('hotelBookingRequest')}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('guestName')} *</label>
                <input
                  type="text"
                  value={hotelData.guestName}
                  onChange={(e) => setHotelData(p => ({ ...p, guestName: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder={t('fullName')}
                />
              </div>
              <div>
                <label className={labelClass}>{t('company')} *</label>
                <input
                  type="text"
                  value={hotelData.companyName}
                  onChange={(e) => setHotelData(p => ({ ...p, companyName: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder={t('companyName')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('email')} *</label>
                <input
                  type="email"
                  value={hotelData.email}
                  onChange={(e) => setHotelData(p => ({ ...p, email: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder={t('emailAddress')}
                />
              </div>
              <div>
                <label className={labelClass}>{t('mobileNo')} *</label>
                <input
                  type="tel"
                  value={hotelData.mobileNo}
                  onChange={(e) => setHotelData(p => ({ ...p, mobileNo: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder={t('mobileNumber')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('checkInDate')} *</label>
                <input
                  type="date"
                  value={hotelData.checkInDate}
                  onChange={(e) => setHotelData(p => ({ ...p, checkInDate: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('checkOutDate')} *</label>
                <input
                  type="date"
                  value={hotelData.checkOutDate}
                  onChange={(e) => setHotelData(p => ({ ...p, checkOutDate: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('roomType')} *</label>
                <select
                  value={hotelData.roomType}
                  onChange={(e) => setHotelData(p => ({ ...p, roomType: e.target.value }))}
                  className={inputClass}
                >
                  <option value="single">{t('singleRoom')}</option>
                  <option value="double">{t('doubleRoom')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('quantity')} *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={hotelData.quantity}
                  onChange={(e) => setHotelData(p => ({ ...p, quantity: parseInt(e.target.value) }))}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Hotel className="w-5 h-5" />}
              {isLoading ? t('submitting') : t('submitHotelRequest')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default TravelServices
