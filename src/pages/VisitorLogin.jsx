import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Loader2, UserPlus, ArrowLeft, Lock, ChevronDown } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'
import { useAuth } from '../context/AuthContext'
import { registerVisitor, setAuthToken } from '../services/eventxApi'

const COUNTRY_CODES = [
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
  { code: '+355', country: 'Albania', flag: '🇦🇱' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+501', country: 'Belize', flag: '🇧🇿' },
  { code: '+229', country: 'Benin', flag: '🇧🇯' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+387', country: 'Bosnia', flag: '🇧🇦' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+238', country: 'Cape Verde', flag: '🇨🇻' },
  { code: '+236', country: 'Central African Rep', flag: '🇨🇫' },
  { code: '+235', country: 'Chad', flag: '🇹🇩' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' },
  { code: '+242', country: 'Congo', flag: '🇨🇬' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+679', country: 'Fiji', flag: '🇫🇯' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+224', country: 'Guinea', flag: '🇬🇳' },
  { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾' },
  { code: '+509', country: 'Haiti', flag: '🇭🇹' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', country: 'Iran', flag: '🇮🇷' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+225', country: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+7', country: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+856', country: 'Laos', flag: '🇱🇦' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  { code: '+218', country: 'Libya', flag: '🇱🇾' },
  { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+853', country: 'Macau', flag: '🇲🇴' },
  { code: '+389', country: 'Macedonia', flag: '🇲🇰' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻' },
  { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+356', country: 'Malta', flag: '🇲🇹' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩' },
  { code: '+377', country: 'Monaco', flag: '🇲🇨' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+850', country: 'North Korea', flag: '🇰🇵' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+970', country: 'Palestine', flag: '🇵🇸' },
  { code: '+507', country: 'Panama', flag: '🇵🇦' },
  { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+211', country: 'South Sudan', flag: '🇸🇸' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷' },
  { code: '+268', country: 'Swaziland', flag: '🇸🇿' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+963', country: 'Syria', flag: '🇸🇾' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
  { code: '+992', country: 'Tajikistan', flag: '🇹🇯' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+993', country: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿' },
  { code: '+678', country: 'Vanuatu', flag: '🇻🇺' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' }
]

const VisitorLogin = () => {
  const navigate = useNavigate()
  const { language, isRTL } = useLanguage()
  const { login } = useAuth()
  const t = (key) => translations[language]?.[key] || translations.en[key] || key

  const [mode, setMode] = useState('login') // 'login', 'register', 'createPassword'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Registration form
  const [regStep, setRegStep] = useState(1)
  const [regData, setRegData] = useState({
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

  // Create password form (first time login)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tempUserData, setTempUserData] = useState(null)
  
  // Country code dropdowns
  const [phoneCode, setPhoneCode] = useState('+218')
  const [mobileCode, setMobileCode] = useState('+218')
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false)
  const [showMobileDropdown, setShowMobileDropdown] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Use AuthContext login method to properly update auth state
      localStorage.setItem('user_type', 'visitor')
      const result = await login(email, password)
      
      if (result.success) {
        // AuthContext has updated user state, navigate to home
        navigate('/', { replace: true })
      } else {
        setError(result.error || t('invalidCredentials'))
      }
    } catch (err) {
      setError(err.message || t('invalidCredentials'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await registerVisitor({
        salutation: regData.salutation,
        firstName: regData.firstName,
        lastName: regData.lastName,
        email: regData.email,
        company: regData.company,
        phone: regData.phone ? `${phoneCode}${regData.phone}` : '',
        mobile: `${mobileCode}${regData.mobile}`,
        job: regData.jobTitle,
        country: regData.country,
        region: regData.region,
        referredEmail: regData.referredEmail,
        companySector: regData.companySector,
        howHeardAboutUs: regData.howHeardAboutUs,
        preferLanguage: language || 'en'
      })
      
      // Registration successful - credentials sent via email
      setError('')
      alert(language === 'ar' 
        ? 'تم التسجيل بنجاح! تم إرسال بيانات الدخول إلى بريدك الإلكتروني.' 
        : 'Registration successful! Your login credentials have been sent to your email.')
      setMode('login')
      setEmail(regData.email)
      setRegStep(1)
    } catch (err) {
      // Display clear error message from backend validation
      const errorMessage = err.message || (language === 'ar' 
        ? 'فشل التسجيل. يرجى المحاولة مرة أخرى.' 
        : 'Registration failed. Please try again.');
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError(t('passwordRequirements'))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    setIsLoading(true)

    try {
      // API call to set new password would go here
      // For now, proceed with login
      const userData = {
        email: tempUserData?.email || email,
        token: tempUserData?.token,
        userType: 'visitor',
        ...tempUserData
      }
      
      localStorage.setItem('eventx_user', JSON.stringify(userData))
      localStorage.setItem('user_type', 'visitor')
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to set password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegDataChange = (field, value) => {
    setRegData(prev => ({ ...prev, [field]: value }))
  }

  const toggleRegSelection = (field, value) => {
    setRegData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

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

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-accent-500 py-8 px-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => mode === 'login' ? navigate('/onboarding') : setMode('login')}
          className={`flex items-center gap-1 text-white/80 hover:text-white mb-6 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="text-sm">{t('back')}</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src="/media/App Icons-14.svg" 
            alt="Libya Build" 
            className="w-16 h-16 mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-white">{t('libyaBuild')}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-4">{t('signIn')}</h2>
              
              <div>
                <label className={labelClass}>{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder={t('enterEmail')}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className={labelClass}>{t('password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} ${isRTL ? 'pl-12' : 'pr-12'}`}
                    placeholder={t('enterPassword')}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('signingIn')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {t('signIn')}
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="text-sm text-gray-600 text-center mb-3">{t('dontHaveAccount')}</p>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  {t('registerNow')}
                </button>
              </div>
            </form>
          )}

          {/* Registration Form - 3 Steps */}
          {mode === 'register' && (
            <div>
              {/* Step Indicators */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        regStep >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {s}
                      </div>
                      {s < 3 && <div className={`w-8 h-1 ${regStep > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Step 1: Personal Information */}
                {regStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-4">{t('personalInformation')}</h2>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className={labelClass}>{t('title')}</label>
                        <select
                          value={regData.salutation}
                          onChange={(e) => handleRegDataChange('salutation', e.target.value)}
                          className={inputClass}
                        >
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Ms">Ms</option>
                          <option value="Dr">Dr</option>
                          <option value="Prof">Prof</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className={labelClass}>{t('firstName')} *</label>
                        <input
                          type="text"
                          value={regData.firstName}
                          onChange={(e) => handleRegDataChange('firstName', e.target.value)}
                          required
                          className={inputClass}
                          placeholder={t('firstNamePlaceholder')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>{t('lastName')} *</label>
                      <input
                        type="text"
                        value={regData.lastName}
                        onChange={(e) => handleRegDataChange('lastName', e.target.value)}
                        required
                        className={inputClass}
                        placeholder={t('lastNamePlaceholder')}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>{t('email')} *</label>
                      <input
                        type="email"
                        value={regData.email}
                        onChange={(e) => handleRegDataChange('email', e.target.value)}
                        required
                        className={inputClass}
                        placeholder={t('emailPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>{t('phone')}</label>
                      <div className="flex gap-2">
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowPhoneDropdown(!showPhoneDropdown)}
                            className="px-2 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 flex items-center gap-1 text-sm font-medium w-[90px]"
                            dir="ltr"
                          >
                            <span>{COUNTRY_CODES.find(c => c.code === phoneCode)?.flag}</span>
                            <span className="text-xs">{phoneCode}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </button>
                          {showPhoneDropdown && (
                            <div className={`absolute top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto w-64 ${isRTL ? 'right-0' : 'left-0'}`}>
                              {COUNTRY_CODES.map(item => (
                                <button
                                  key={item.code + item.country}
                                  type="button"
                                  onClick={() => {
                                    setPhoneCode(item.code)
                                    setShowPhoneDropdown(false)
                                  }}
                                  className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-left"
                                  dir="ltr"
                                >
                                  <span>{item.flag}</span>
                                  <span className="font-medium">{item.code}</span>
                                  <span className="text-gray-500 text-xs flex-1">{item.country}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="tel"
                          value={regData.phone}
                          onChange={(e) => {
                            let value = e.target.value
                            if (value.startsWith('0')) value = value.substring(1)
                            handleRegDataChange('phone', value)
                          }}
                          className="flex-1 min-w-0 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          placeholder={t('phoneOffice')}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>{t('mobile')} *</label>
                      <div className="flex gap-2">
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowMobileDropdown(!showMobileDropdown)}
                            className="px-2 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 flex items-center gap-1 text-sm font-medium w-[90px]"
                            dir="ltr"
                          >
                            <span>{COUNTRY_CODES.find(c => c.code === mobileCode)?.flag}</span>
                            <span className="text-xs">{mobileCode}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </button>
                          {showMobileDropdown && (
                            <div className={`absolute top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto w-64 ${isRTL ? 'right-0' : 'left-0'}`}>
                              {COUNTRY_CODES.map(item => (
                                <button
                                  key={item.code + item.country}
                                  type="button"
                                  onClick={() => {
                                    setMobileCode(item.code)
                                    setShowMobileDropdown(false)
                                  }}
                                  className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-left"
                                  dir="ltr"
                                >
                                  <span>{item.flag}</span>
                                  <span className="font-medium">{item.code}</span>
                                  <span className="text-gray-500 text-xs flex-1">{item.country}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="tel"
                          value={regData.mobile}
                          onChange={(e) => {
                            let value = e.target.value
                            if (value.startsWith('0')) value = value.substring(1)
                            handleRegDataChange('mobile', value)
                          }}
                          required
                          className="flex-1 min-w-0 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          placeholder={t('mobilePlaceholder')}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      disabled={!regData.firstName || !regData.lastName || !regData.email || !regData.mobile}
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {t('continue')}
                    </button>
                  </div>
                )}

                {/* Step 2: Company Information */}
                {regStep === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-4">{t('companyInformation')}</h2>

                    <div>
                      <label className={labelClass}>{t('company')} *</label>
                      <input
                        type="text"
                        value={regData.company}
                        onChange={(e) => handleRegDataChange('company', e.target.value)}
                        required
                        className={inputClass}
                        placeholder={t('companyPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>{t('jobTitle')} *</label>
                      <input
                        type="text"
                        value={regData.jobTitle}
                        onChange={(e) => handleRegDataChange('jobTitle', e.target.value)}
                        required
                        className={inputClass}
                        placeholder={t('jobTitlePlaceholder')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>{t('country')} *</label>
                        <input
                          type="text"
                          value={regData.country}
                          onChange={(e) => handleRegDataChange('country', e.target.value)}
                          required
                          className={inputClass}
                          placeholder={t('countryPlaceholder')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('region')}</label>
                        <input
                          type="text"
                          value={regData.region}
                          onChange={(e) => handleRegDataChange('region', e.target.value)}
                          className={inputClass}
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
                            onClick={() => toggleRegSelection('companySector', sector)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              regData.companySector.includes(sector)
                                ? 'bg-primary-600 text-white'
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
                        onClick={() => setRegStep(1)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                      >
                        {t('back')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegStep(3)}
                        disabled={!regData.company || !regData.jobTitle || !regData.country}
                        className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {t('continue')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Additional Information */}
                {regStep === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-4">{t('additionalInformation')}</h2>

                    <div>
                      <label className={labelClass}>{t('referredBy')}</label>
                      <input
                        type="email"
                        value={regData.referredEmail}
                        onChange={(e) => handleRegDataChange('referredEmail', e.target.value)}
                        className={inputClass}
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
                            onClick={() => toggleRegSelection('howHeardAboutUs', source)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              regData.howHeardAboutUs.includes(source)
                                ? 'bg-primary-600 text-white'
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
                        onClick={() => setRegStep(2)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                      >
                        {t('back')}
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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

                <p className="text-center text-sm text-gray-500">
                  {t('alreadyHaveAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setRegStep(1); }}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    {t('signInHere')}
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* Create Password Form (First Time Login) */}
          {mode === 'createPassword' && (
            <form onSubmit={handleCreatePassword} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('createPassword')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('createPasswordDesc')}</p>
              </div>

              <div>
                <label className={labelClass}>{t('newPassword')} *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 mt-1">{t('passwordRequirements')}</p>
              </div>

              <div>
                <label className={labelClass}>{t('confirmPassword')} *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('settingPassword')}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {t('setPassword')}
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/60 text-sm mt-6">
          {t('allRightsReserved')}
        </p>
      </div>
    </div>
  )
}

export default VisitorLogin
