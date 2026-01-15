import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || null
  })

  const [isRTL, setIsRTL] = useState(language === 'ar')

  useEffect(() => {
    if (language) {
      localStorage.setItem('app_language', language)
      setIsRTL(language === 'ar')
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = language
    }
  }, [language])

  const changeLanguage = (lang) => {
    setLanguage(lang)
  }

  const value = {
    language,
    isRTL,
    changeLanguage,
    isLanguageSelected: !!language
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
