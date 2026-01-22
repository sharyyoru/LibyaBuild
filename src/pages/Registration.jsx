import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, Loader2, ChevronDown, Check } from 'lucide-react'
import { registerVisitor } from '../services/eventxApi'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

const SECTORS = [
  'Architecture',
  'Building & Construction Materials',
  'Engineering',
  'Interior Design',
  'Mechanical',
  'Real Estate',
  'Windows, Door & Facades'
]

const HOW_HEARD = [
  'Email',
  'Facebook',
  'Instagram',
  'LinkedIn',
  'Search Engine',
  'Friend/Colleague',
  'Other'
]

const SALUTATIONS = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']

const Registration = () => {
  const navigate = useNavigate()
  const { language, isRTL } = useLanguage()
  const t = (key) => translations[language]?.[key] || translations.en[key] || key
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)
  
  const [formData, setFormData] = useState({
    salutation: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    mobile: '',
    jobTitle: '',
    country: 'Libya',
    region: '',
    referredEmail: '',
    companySector: [],
    howHeardAboutUs: []
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleSelection = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await registerVisitor({
        salutation: formData.salutation,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        mobile: formData.mobile,
        job: formData.jobTitle,
        country: formData.country,
        region: formData.region,
        referredEmail: formData.referredEmail,
        companySector: formData.companySector,
        howHeardAboutUs: formData.howHeardAboutUs,
        preferLanguage: language || 'en'
      })
      
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Gradient Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/media/newdesign/LB App - Gradient BG.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative z-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('registrationSuccessful')}</h2>
          <p className="text-gray-600 mb-6">
            {t('credentialsSent')} <strong>{formData.email}</strong>
          </p>
          <Link
            to="/login"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            {t('goToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Gradient Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/media/newdesign/LB App - Gradient BG.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className="max-w-lg mx-auto relative z-10">
        <div className="text-center mb-6">
          <img 
            src="/media/newdesign/LB Benghazi Logo.png" 
            alt="Libya Build" 
            className="h-16 mx-auto mb-3"
          />
          <h1 className="text-xl font-bold text-white">{t('eventDates')}</h1>
          <p className="text-white/90 mt-2 text-sm font-medium">{t('benghaziInternational')}</p>
          <p className="text-white/90 text-sm font-medium">{t('conferenceExhibitionsCentre')}</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= s ? 'bg-white text-blue-600' : 'bg-white/30 text-white'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-8 h-1 ${step > s ? 'bg-white' : 'bg-white/30'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('personalInformation')}</h3>
                
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('title')}</label>
                    <select
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
                    >
                      {SALUTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('firstName')} *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
                      placeholder={t('firstNamePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastName')} *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder={t('lastNamePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')} *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder={t('emailPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
                      placeholder={t('phoneOffice')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('mobile')} *</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
                      placeholder={t('mobilePlaceholder')}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.mobile}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t('continue')}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('companyInformation')}</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('company')} *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder={t('companyPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobTitle')} *</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder={t('jobTitlePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('country')} *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
                      placeholder={t('countryPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('region')}</label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
                      placeholder={t('regionPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('companySector')}</label>
                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map(sector => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => toggleSelection('companySector', sector)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          formData.companySector.includes(sector)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    {t('back')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.company || !formData.jobTitle || !formData.country}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {t('continue')}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('additionalInformation')}</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('referredBy')}</label>
                  <input
                    type="email"
                    name="referredEmail"
                    value={formData.referredEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
                    placeholder={t('referredEmailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('howHeardAboutUs')}</label>
                  <div className="flex flex-wrap gap-2">
                    {HOW_HEARD.map(source => (
                      <button
                        key={source}
                        type="button"
                        onClick={() => toggleSelection('howHeardAboutUs', source)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          formData.howHeardAboutUs.includes(source)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {source}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    {t('back')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('registering')}
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        {t('completeRegistration')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('alreadyRegistered')}{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Registration
