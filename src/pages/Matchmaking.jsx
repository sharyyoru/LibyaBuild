import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Building2, Globe, MessageSquare, Calendar, Heart, ThumbsUp, ThumbsDown, RefreshCw, Loader2, Check, X, MapPin, Users, Crown, Award, Star, BadgeCheck, ChevronRight, Zap, Target, TrendingUp, Filter } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { getExhibitors, getProfile, getIndustries } from '../services/eventxApi'
import { saveMatch, getUserMatches, updateMatchStatus, getUserInterests } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import { clsx } from 'clsx'

const DEFAULT_LOGO = '/media/default-company.svg'

// Match reason configurations (labels will be translated dynamically)
const MATCH_REASONS = {
  sector: { key: 'sameIndustry', icon: Target, color: 'text-purple-600 bg-purple-50' },
  country: { key: 'sameRegion', icon: Globe, color: 'text-blue-600 bg-blue-50' },
  interest: { key: 'sharedInterest', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  sponsor: { key: 'eventSponsor', icon: Crown, color: 'text-yellow-600 bg-yellow-50' },
  partner: { key: 'officialPartner', icon: BadgeCheck, color: 'text-green-600 bg-green-50' },
  trending: { key: 'popularChoice', icon: TrendingUp, color: 'text-pink-600 bg-pink-50' },
}

const Matchmaking = () => {
  const { userProfile, addMeeting } = useApp()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation(language)
  const [exhibitors, setExhibitors] = useState([])
  const [matches, setMatches] = useState([])
  const [savedMatches, setSavedMatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState('preferences') // 'preferences', 'matching', 'results'
  const [preferences, setPreferences] = useState({
    sectors: [],
    interests: [],
    lookingFor: 'all', // 'all', 'sponsors', 'partners'
    country: ''
  })
  const [activeTab, setActiveTab] = useState('matches') // 'matches', 'saved', 'how'
  const [industries, setIndustries] = useState([])
  const [selectedIndustryIds, setSelectedIndustryIds] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load exhibitors and industries from API
      const [exhibitorsData, industriesData] = await Promise.all([
        getExhibitors(),
        getIndustries()
      ])
      
      const exhibitorList = exhibitorsData.data || exhibitorsData.exhibitors || exhibitorsData || []
      setExhibitors(Array.isArray(exhibitorList) ? exhibitorList : [])
      
      const industryList = industriesData.data || industriesData.industries || industriesData || []
      const industriesArray = Array.isArray(industryList) ? industryList : []
      setIndustries(industriesArray)
      
      const industriesMap = {}
      industriesArray.forEach(ind => {
        industriesMap[ind.id] = ind
      })
      
      const userId = user?.id || user?.user_id || user?.visitor_id
      
      // Fetch user interests from Supabase (industry IDs) - ONLY 1 QUERY
      let userInterestIds = []
      let userInterestNames = []
      if (userId) {
        try {
          const interestsResult = await getUserInterests(userId)
          if (interestsResult.data && Array.isArray(interestsResult.data)) {
            userInterestIds = interestsResult.data.map(i => i.industry_id)
            setSelectedIndustryIds(userInterestIds)
            // Convert IDs to names for matching
            userInterestNames = userInterestIds.map(id => industriesMap[id]?.name || '').filter(Boolean)
          }
        } catch (interestsErr) {
          console.warn('Could not fetch user interests:', interestsErr)
        }
      }
      
      // Load saved matches from Supabase (optional - doesn't affect core functionality)
      if (userId) {
        getUserMatches(userId)
          .then(result => {
            if (result.data) setSavedMatches(result.data)
          })
          .catch(err => console.warn('Could not load saved matches:', err))
      }
      
      // Set preferences from user's saved interests
      const userCountry = user?.country || userProfile?.country || ''
      const updatedPreferences = {
        sectors: userInterestNames,
        interests: userInterestNames, // Use same interests for matching
        lookingFor: 'all',
        country: userCountry
      }
      setPreferences(updatedPreferences)
      
      // Scenario 1: User has interests - auto-generate matches
      // Scenario 2: User has NO interests - show preference selection screen
      if (userInterestNames.length > 0 && exhibitorList.length > 0) {
        // User saved interests in profile - auto-generate matches
        generateMatchesWithPrefs(exhibitorList, updatedPreferences)
        setCurrentStep('results')
      } else {
        // User hasn't selected interests yet - show selection screen
        setCurrentStep('preferences')
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // AI Matching Algorithm
  const calculateMatchScore = (exhibitor, userPrefs) => {
    let score = 0
    const reasons = []
    
    // Get exhibitor data
    const exSector = exhibitor.sector || exhibitor.industry || exhibitor.category || ''
    const exCountry = exhibitor.country || ''
    const exTags = exhibitor.tags || exhibitor.products || []
    const eventsUser = exhibitor.event_user || exhibitor.events_user || exhibitor
    
    // Sector matching (highest weight - 40 points max)
    const userSectors = userPrefs.sectors.length > 0 ? userPrefs.sectors : [user?.company_sectors, userProfile?.sector].filter(Boolean)
    
    // Check exhibitor industries from form3_data_entry (company_industries field)
    let exhibitorIndustries = []
    
    // Check all form3 entries for company_industries
    const form3Entries = exhibitor.form3_data_entry || []
    const form3Array = Array.isArray(form3Entries) ? form3Entries : [form3Entries]
    
    form3Array.forEach(form3 => {
      if (form3.company_industries) {
        const industries = Array.isArray(form3.company_industries) ? form3.company_industries : [form3.company_industries]
        industries.forEach(ind => {
          if (typeof ind === 'string') {
            exhibitorIndustries.push(ind)
          } else if (ind.name || ind.en_name) {
            exhibitorIndustries.push(ind.name || ind.en_name)
          }
        })
      }
    })
    
    // Also check legacy sector field
    if (exSector) {
      exhibitorIndustries.push(exSector)
    }
    
    // Match user interests with exhibitor industries
    const hasMatch = userSectors.some(userSector => 
      exhibitorIndustries.some(exIndustry => {
        if (!exIndustry || typeof exIndustry !== 'string' || !userSector) return false
        const exLower = exIndustry.toLowerCase()
        const userLower = userSector.toLowerCase()
        return exLower.includes(userLower) || userLower.includes(exLower)
      })
    )
    
    if (hasMatch) {
      score += 40
      reasons.push('sector')
    }
    
    // Country/Region matching (20 points)
    const userCountry = userPrefs.country || user?.country || userProfile?.country
    if (userCountry && exCountry.toLowerCase().includes(userCountry.toLowerCase())) {
      score += 20
      reasons.push('country')
    }
    
    // Interest matching (5 points each, max 25)
    const userInterests = userPrefs.interests.length > 0 ? userPrefs.interests : userProfile?.interests || []
    let interestScore = 0
    userInterests.forEach(interest => {
      const tagMatch = exTags.some(tag => {
        const tagStr = typeof tag === 'string' ? tag : tag.name || ''
        return tagStr.toLowerCase().includes(interest.toLowerCase())
      })
      // Check description from form3 entries
      let descMatch = false
      form3Array.forEach(form3 => {
        if (form3.company_description && form3.company_description.toLowerCase().includes(interest.toLowerCase())) {
          descMatch = true
        }
      })
      if (tagMatch || descMatch) {
        interestScore += 5
        if (!reasons.includes('interest')) reasons.push('interest')
      }
    })
    score += Math.min(interestScore, 25)
    
    // Sponsor bonus (15 points)
    if (eventsUser.is_platinum_sponsorship || eventsUser.gold_sponsorship || eventsUser.silver_sponsorship) {
      score += 15
      reasons.push('sponsor')
      if (userPrefs.lookingFor === 'sponsors') score += 10
    }
    
    // Partner bonus (10 points)
    if (exhibitor.is_partner === 1 || exhibitor.is_partner === true) {
      score += 10
      reasons.push('partner')
      if (userPrefs.lookingFor === 'partners') score += 10
    }
    
    // Popularity/engagement bonus (random for demo, could be based on real data)
    if (exhibitor.exhibitor_badges?.length > 3) {
      score += 5
      reasons.push('trending')
    }
    
    // Normalize score to 0-100
    const normalizedScore = Math.min(Math.round((score / 100) * 100), 100)
    
    return { score: normalizedScore, reasons }
  }

  const generateMatches = (exhibitorList = exhibitors) => {
    setIsGenerating(true)
    
    // Simulate AI processing delay
    setTimeout(() => {
      const scoredExhibitors = exhibitorList.map(ex => {
        const { score, reasons } = calculateMatchScore(ex, preferences)
        return { ...ex, matchScore: score, matchReasons: reasons }
      })
      
      // Sort by score and filter low matches
      const sortedMatches = scoredExhibitors
        .filter(ex => ex.matchScore > 20)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20)
      
      setMatches(sortedMatches)
      setIsGenerating(false)
      setCurrentStep('results')
    }, 1500)
  }

  // Generate matches with provided preferences (for initial load with API data)
  const generateMatchesWithPrefs = (exhibitorList, userPrefs) => {
    const scoredExhibitors = exhibitorList.map(ex => {
      const { score, reasons } = calculateMatchScore(ex, userPrefs)
      return { ...ex, matchScore: score, matchReasons: reasons }
    })
    
    // Sort by score and filter low matches
    const sortedMatches = scoredExhibitors
      .filter(ex => ex.matchScore > 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20)
    
    setMatches(sortedMatches)
  }

  const handleSavePreferences = async () => {
    // Convert selected industry IDs to names for matching
    const selectedIndustryNames = selectedIndustryIds
      .map(id => industries.find(ind => ind.id === id)?.name)
      .filter(Boolean)
    
    // Update preferences with selected industries
    const updatedPrefs = {
      ...preferences,
      sectors: selectedIndustryNames,
      interests: selectedIndustryNames
    }
    setPreferences(updatedPrefs)
    
    // Generate matches with selected industries
    generateMatchesWithPrefs(exhibitors, updatedPrefs)
    setCurrentStep('results')
  }

  const handleSaveMatch = async (exhibitor) => {
    const userId = user?.id || user?.user_id || user?.visitor_id
    if (!userId) return
    
    const matchData = {
      user_id: userId,
      exhibitor_id: exhibitor.id,
      exhibitor_name: getExhibitorName(exhibitor),
      exhibitor_logo: getExhibitorLogo(exhibitor),
      exhibitor_booth: getExhibitorBooth(exhibitor),
      match_score: exhibitor.matchScore,
      match_reasons: exhibitor.matchReasons,
      status: 'saved'
    }
    
    try {
      const { data, error } = await saveMatch(matchData)
      if (!error && data) {
        setSavedMatches(prev => [...prev, data])
      } else {
        console.warn('Could not save match:', error)
      }
    } catch (err) {
      console.warn('Error saving match:', err)
    }
  }

  const handleDismissMatch = (exhibitorId) => {
    setMatches(prev => prev.filter(m => m.id !== exhibitorId))
  }

  const toggleIndustry = (industryId) => {
    setSelectedIndustryIds(prev => 
      prev.includes(industryId)
        ? prev.filter(id => id !== industryId)
        : [...prev, industryId]
    )
  }

  // Get helper functions for exhibitor data
  const getExhibitorName = (ex) => ex.en_name || ex.company_name || ex.name || 'Unknown'
  const getExhibitorLogo = (ex) => {
    const form3Array = Array.isArray(ex.form3_data_entry) ? ex.form3_data_entry : [ex.form3_data_entry]
    const form3 = form3Array[0]
    return form3?.company_logo || ex.logo_url || ex.logo || DEFAULT_LOGO
  }
  const getExhibitorSector = (ex) => {
    const form3Array = Array.isArray(ex.form3_data_entry) ? ex.form3_data_entry : [ex.form3_data_entry]
    const form3 = form3Array[0]
    if (form3?.company_industries) {
      const industries = Array.isArray(form3.company_industries) ? form3.company_industries : [form3.company_industries]
      if (industries.length > 0) {
        const first = industries[0]
        return typeof first === 'string' ? first : first.name || first.en_name || 'General'
      }
    }
    return ex.sector || ex.industry || ex.category || 'General'
  }
  const getExhibitorBooth = (ex) => {
    const eventUser = ex.event_user || ex.events_user || ex
    return eventUser.stand_no || ex.booth_number || ex.booth || null
  }
  const getSponsorLevel = (ex) => {
    const eventUser = ex.event_user || ex.events_user || ex
    if (eventUser.is_platinum_sponsorship) return 'platinum'
    if (eventUser.gold_sponsorship) return 'gold'
    if (eventUser.silver_sponsorship) return 'silver'
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">{t('loadingMatchmaking')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-purple-600 via-primary-600 to-accent-600 text-white">
        <div className="px-4 pt-12 pb-6 safe-top">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                {t('aiMatchmaking')}
              </h1>
              <p className="text-white/70 text-sm mt-1">{t('findPerfectPartners')}</p>
            </div>
            <button
              onClick={() => { setCurrentStep('preferences'); setActiveTab('matches') }}
              className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-2">
            {[
              { key: 'matches', label: t('matches'), count: matches.length },
              { key: 'saved', label: t('saved'), count: savedMatches.length },
              { key: 'how', label: t('howItWorks') },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2',
                  activeTab === tab.key
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={clsx(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    activeTab === tab.key ? 'bg-primary-100' : 'bg-white/20'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="-mt-4 relative z-10">
        <div className="bg-gray-50 rounded-t-3xl pt-6 pb-6 min-h-[60vh]">
          
          {/* Preferences Step */}
          {currentStep === 'preferences' && activeTab === 'matches' && (
            <div className="px-4 space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-primary-500 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('setPreferences')}</h2>
                <p className="text-gray-500 text-sm mt-1">{t('helpFindMatches')}</p>
              </div>

              {/* Industry Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('selectIndustriesInterest') || 'Select industries you are interested in'}
                </label>
                {industries.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500 text-sm">{t('loadingIndustries')}</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {industries.map(industry => {
                      const industryId = industry.id
                      const industryName = language === 'ar' ? (industry.ar_name || industry.name) : industry.name
                      const isSelected = selectedIndustryIds.includes(industryId)
                      return (
                        <button
                          key={industryId}
                          onClick={() => toggleIndustry(industryId)}
                          className={clsx(
                            'px-3 py-2 rounded-xl text-sm font-medium transition-all border',
                            isSelected
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                          )}
                        >
                          {industryName}
                        </button>
                      )
                    })}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {selectedIndustryIds.length > 0 
                    ? `${selectedIndustryIds.length} ${selectedIndustryIds.length === 1 ? t('industrySelected') : t('industriesSelected')}`
                    : t('selectAtLeastOne')
                  }
                </p>
              </div>

              {/* Looking For */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('exhibitorTypePreference')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'all', label: t('all'), icon: Users },
                    { key: 'sponsors', label: t('sponsors'), icon: Crown },
                    { key: 'partners', label: t('partners'), icon: BadgeCheck },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setPreferences({ ...preferences, lookingFor: opt.key })}
                      className={clsx(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                        preferences.lookingFor === opt.key
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      <opt.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleSavePreferences}
                disabled={isGenerating || selectedIndustryIds.length === 0}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-primary-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('aiFindingMatches')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('findMatches')}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && currentStep === 'results' && (
            <div className="px-4">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-primary-500 flex items-center justify-center mb-6 animate-pulse">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('aiGenerating')}</h3>
                  <p className="text-gray-500 text-sm text-center max-w-xs">
                    {t('matchingProfile')} {exhibitors.length} {t('exhibitors').toLowerCase()}
                  </p>
                </div>
              ) : matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
                    <Target className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('noMatchesYet')}</h3>
                  <p className="text-gray-500 text-sm text-center max-w-xs mb-4">
                    {t('setPreferencesToFind')}
                  </p>
                  <button
                    onClick={() => setCurrentStep('preferences')}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium"
                  >
                    {t('setPreferences')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">{matches.length} {t('matches').toLowerCase()}</p>
                    <button
                      onClick={() => generateMatches()}
                      className="flex items-center gap-1 text-sm text-primary-600 font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t('refresh')}
                    </button>
                  </div>

                  {matches.map((exhibitor, index) => {
                    const sponsorLevel = getSponsorLevel(exhibitor)
                    const isSaved = savedMatches.some(m => m.exhibitor_id === exhibitor.id)
                    
                    return (
                      <div key={exhibitor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Match Score Header */}
                        <div className="bg-gradient-to-r from-purple-500 to-primary-500 px-4 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-white text-sm font-medium">
                              {exhibitor.matchScore}% {t('match')}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {exhibitor.matchReasons?.slice(0, 3).map(reason => {
                              const config = MATCH_REASONS[reason]
                              if (!config) return null
                              const ReasonIcon = config.icon
                              return (
                                <div key={reason} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center" title={t(config.key)}>
                                  <ReasonIcon className="w-3.5 h-3.5 text-white" />
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex gap-3 mb-3">
                            <div className="relative">
                              <img
                                src={getExhibitorLogo(exhibitor)}
                                alt={getExhibitorName(exhibitor)}
                                className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200"
                                onError={(e) => { e.target.src = DEFAULT_LOGO }}
                              />
                              {sponsorLevel && (
                                <div className={clsx(
                                  'absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center',
                                  sponsorLevel === 'platinum' ? 'bg-slate-700' : sponsorLevel === 'gold' ? 'bg-amber-500' : 'bg-gray-400'
                                )}>
                                  <Crown className="w-3.5 h-3.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate">{getExhibitorName(exhibitor)}</h4>
                              <p className="text-sm text-gray-500 mb-2">{getExhibitorSector(exhibitor)}</p>
                              <div className="flex flex-wrap gap-1">
                                {exhibitor.matchReasons?.map(reason => {
                                  const config = MATCH_REASONS[reason]
                                  if (!config) return null
                                  return (
                                    <span key={reason} className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', config.color)}>
                                      {t(config.key)}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                            {getExhibitorBooth(exhibitor) && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {t('booth')} {getExhibitorBooth(exhibitor)}
                              </span>
                            )}
                            {exhibitor.country && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5" />
                                {exhibitor.country}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDismissMatch(exhibitor.id)}
                              className="p-3 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all"
                            >
                              <X className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleSaveMatch(exhibitor)}
                              disabled={isSaved}
                              className={clsx(
                                'p-3 rounded-xl border transition-all',
                                isSaved
                                  ? 'border-green-500 bg-green-50 text-green-600'
                                  : 'border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-200'
                              )}
                            >
                              {isSaved ? <Check className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                            </button>
                            <Link to={`/exhibitors/${exhibitor.id}`} className="flex-1">
                              <button className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-700 transition-all">
                                {t('viewProfile')}
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <div className="px-4">
              {savedMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
                    <Heart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('noSavedMatches')}</h3>
                  <p className="text-gray-500 text-sm text-center max-w-xs">
                    {t('saveMatchesToView')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedMatches.map(match => (
                    <Link key={match.id} to={`/exhibitors/${match.exhibitor_id}`}>
                      <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all">
                        <img
                          src={match.exhibitor_logo || DEFAULT_LOGO}
                          alt={match.exhibitor_name}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                          onError={(e) => { e.target.src = DEFAULT_LOGO }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{match.exhibitor_name}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="text-primary-600 font-medium">{match.match_score}% {t('match')}</span>
                            {match.exhibitor_booth && (
                              <>
                                <span>•</span>
                                <span>{t('booth')} {match.exhibitor_booth}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* How it Works Tab */}
          {activeTab === 'how' && (
            <div className="px-4 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  {t('aiMatchingAlgorithm')}
                </h3>
                <div className="space-y-4">
                  {[
                    { step: 1, title: t('profileAnalysis'), desc: t('profileAnalysisDesc') },
                    { step: 2, title: t('exhibitorScanning'), desc: t('exhibitorScanningDesc') },
                    { step: 3, title: t('scoringAlgorithm'), desc: t('scoringAlgorithmDesc') },
                    { step: 4, title: t('smartRanking'), desc: t('smartRankingDesc') },
                  ].map(item => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-5 border border-primary-100">
                <h4 className="font-semibold text-gray-900 mb-2">{t('matchScoreMeaning')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-700">80-100%: {t('excellentMatch')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-700">50-79%: {t('goodPotential')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-gray-700">20-49%: {t('worthExploring')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Matchmaking
