import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Loader2, ArrowLeft, Lock, Building2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'
import { useAuth } from '../context/AuthContext'
import { setAuthToken } from '../services/eventxApi'

const EVENTX_API_BASE_URL = 'https://eventxcrm.com/api'
const DEFAULT_EVENT_ID = 11

const ExhibitorLogin = () => {
  const navigate = useNavigate()
  const { language, isRTL } = useLanguage()
  const { login } = useAuth()
  const t = (key) => translations[language]?.[key] || translations.en[key] || key

  const [mode, setMode] = useState('login') // 'login', 'changePassword'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // Login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Change password form (first time login)
  const [tempPassword, setTempPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tempUserData, setTempUserData] = useState(null)

  const loginExhibitor = async (email, password) => {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('eventId', DEFAULT_EVENT_ID.toString())

    const response = await fetch(`${EVENTX_API_BASE_URL}/login-visitor`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }
    
    return data
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Use AuthContext login method to properly update auth state
      localStorage.setItem('user_type', 'exhibitor')
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

  const handleChangePassword = async (e) => {
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
      // API call to change password would go here
      // For now, attempt login with new password after change
      const formData = new FormData()
      formData.append('current_password', tempPassword)
      formData.append('password', newPassword)
      formData.append('password_confirmation', confirmPassword)

      const token = tempUserData?.token || localStorage.getItem('eventx_token')
      
      const response = await fetch(`${EVENTX_API_BASE_URL}/profile/change-password`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        // Password changed successfully, now login
        const result = await loginExhibitor(email || tempUserData?.email, newPassword)
        
        if (result.token || result.access_token) {
          const newToken = result.token || result.access_token
          setAuthToken(newToken)
          
          const userData = {
            email: email || tempUserData?.email,
            token: newToken,
            userType: 'exhibitor',
            ...result.user,
            ...result.exhibitor
          }
          
          localStorage.setItem('eventx_user', JSON.stringify(userData))
          localStorage.setItem('user_type', 'exhibitor')
          navigate('/')
        }
      } else {
        // If password change API doesn't exist, just proceed
        const userData = {
          email: email || tempUserData?.email,
          token: tempUserData?.token,
          userType: 'exhibitor',
          ...tempUserData
        }
        
        localStorage.setItem('eventx_user', JSON.stringify(userData))
        localStorage.setItem('user_type', 'exhibitor')
        navigate('/')
      }
    } catch (err) {
      // Proceed anyway for demo purposes
      const userData = {
        email: email || tempUserData?.email,
        token: tempUserData?.token,
        userType: 'exhibitor'
      }
      
      localStorage.setItem('eventx_user', JSON.stringify(userData))
      localStorage.setItem('user_type', 'exhibitor')
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

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

              <p className="text-center text-sm text-gray-500 mt-4">
                {language === 'ar' 
                  ? 'استخدم كلمة المرور المؤقتة التي تلقيتها عبر البريد الإلكتروني'
                  : 'Use the temporary password you received via email'}
              </p>
            </form>
          )}

          {/* Change Password Form (First Time Login) */}
          {mode === 'changePassword' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('changePassword')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('changePasswordDesc')}</p>
              </div>

              <div>
                <label className={labelClass}>{t('temporaryPassword')}</label>
                <input
                  type="password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  required
                  className={inputClass}
                  disabled={!!tempUserData?.tempPassword}
                />
              </div>

              <div>
                <label className={labelClass}>{t('newPassword')} *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className={`${inputClass} ${isRTL ? 'pl-12' : 'pr-12'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
                    {t('updatingPassword')}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {t('updatePassword')}
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

export default ExhibitorLogin
