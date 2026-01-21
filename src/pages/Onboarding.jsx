import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Users, Building2, ChevronRight, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

const Onboarding = () => {
  const navigate = useNavigate()
  const { language, changeLanguage, isLanguageSelected } = useLanguage()
  const [step, setStep] = useState(isLanguageSelected ? 2 : 1)
  const [selectedLang, setSelectedLang] = useState(language || 'en')
  
  const t = (key) => translations[selectedLang]?.[key] || translations.en[key] || key
  const isRTL = selectedLang === 'ar'

  useEffect(() => {
    // If already logged in, redirect to home
    const token = localStorage.getItem('eventx_token')
    const userType = localStorage.getItem('user_type')
    if (token && userType) {
      navigate('/')
    }
  }, [navigate])

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang)
  }

  const handleLanguageContinue = () => {
    changeLanguage(selectedLang)
    setStep(2)
  }

  const handleUserTypeSelect = (type) => {
    localStorage.setItem('user_type', type)
    if (type === 'visitor') {
      navigate('/login/visitor')
    } else {
      navigate('/login/exhibitor')
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Gradient Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/media/newdesign/LB App - Gradient BG.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/media/newdesign/LB Benghazi Logo.png" 
            alt="Libya Build" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-white">20-23 April 2026</h1>
          <p className="text-white/90 mt-2 text-sm font-medium">Benghazi International</p>
          <p className="text-white/90 text-sm font-medium">Conference & Exhibitions Centre</p>
        </div>

        {/* Step 1: Language Selection */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('selectLanguage')}</h2>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleLanguageSelect('en')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  selectedLang === 'en'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <span className="font-medium text-gray-900">English</span>
                </div>
                {selectedLang === 'en' && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              <button
                onClick={() => handleLanguageSelect('ar')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  selectedLang === 'ar'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇱🇾</span>
                  <span className="font-medium text-gray-900">العربية</span>
                </div>
                {selectedLang === 'ar' && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            </div>

            <button
              onClick={handleLanguageContinue}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {t('continue')}
              <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {/* Step 2: User Type Selection */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fadeIn">
            <button
              onClick={handleBack}
              className={`flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              <span className="text-sm">{t('back')}</span>
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t('welcomeTo')}</h2>
              <p className="text-primary-600 font-semibold">{t('libyaBuild')}</p>
              <p className="text-gray-500 mt-2 text-sm">{t('selectUserType')}</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleUserTypeSelect('visitor')}
                className="w-full p-5 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-all">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{t('iAmVisitor')}</h3>
                    <p className="text-sm text-gray-500">{t('visitorDesc')}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-all flex-shrink-0 mt-3 ${isRTL ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <button
                onClick={() => handleUserTypeSelect('exhibitor')}
                className="w-full p-5 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-all">
                    <Building2 className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{t('iAmExhibitor')}</h3>
                    <p className="text-sm text-gray-500">{t('exhibitorDesc')}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-all flex-shrink-0 mt-3 ${isRTL ? 'rotate-180' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-white/70 text-sm mt-6">
          2026 Libya Build. All rights reserved
        </p>
      </div>
    </div>
  )
}

export default Onboarding
