import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Building2, Globe, MessageSquare, Calendar, Heart, ThumbsUp, ThumbsDown, RefreshCw, Loader2, Check, X, MapPin, Users, Crown, Award, Star, BadgeCheck, ChevronRight, Zap, Target, TrendingUp, Filter } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { getExhibitors } from '../services/eventxApi'
import { saveUserPreferences, getUserPreferences, saveMatch, getUserMatches, updateMatchStatus } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { clsx } from 'clsx'

const DEFAULT_LOGO = '/media/default-company.svg'

// Industry/Sector categories for matching
const SECTORS = [
  'Construction', 'Building Materials', 'Architecture', 'Interior Design',
  'Real Estate', 'Engineering', 'HVAC', 'Electrical', 'Plumbing',
  'Flooring', 'Roofing', 'Glass & Windows', 'Steel & Metal', 'Wood & Timber',
  'Paints & Coatings', 'Lighting', 'Security Systems', 'Smart Building',
  'Green Building', 'Heavy Equipment', 'Tools & Hardware', 'Other'
]

// Interest tags for matching
const INTERESTS = [
  'Sustainability', 'Innovation', 'Technology', 'Import/Export',
  'Wholesale', 'Retail', 'Manufacturing', 'Distribution',
  'Consulting', 'Partnership', 'Investment', 'Networking'
]

// Match reason configurations
const MATCH_REASONS = {
  sector: { label: 'Same Industry', icon: Target, color: 'text-purple-600 bg-purple-50' },
  country: { label: 'Same Region', icon: Globe, color: 'text-blue-600 bg-blue-50' },
  interest: { label: 'Shared Interest', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  sponsor: { label: 'Event Sponsor', icon: Crown, color: 'text-yellow-600 bg-yellow-50' },
  partner: { label: 'Official Partner', icon: BadgeCheck, color: 'text-green-600 bg-green-50' },
  trending: { label: 'Popular Choice', icon: TrendingUp, color: 'text-pink-600 bg-pink-50' },
}

const Matchmaking = () => {
  const { userProfile, addMeeting } = useApp()
  const { user } = useAuth()
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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load exhibitors from API
      const exhibitorsData = await getExhibitors()
      const exhibitorList = exhibitorsData.data || exhibitorsData.exhibitors || exhibitorsData || []
      setExhibitors(Array.isArray(exhibitorList) ? exhibitorList : [])
      
      // Load user preferences and saved matches from Supabase
      const userId = user?.id || user?.user_id || user?.visitor_id
      if (userId) {
        try {
          const [prefsResult, matchesResult] = await Promise.all([
            getUserPreferences(userId),
            getUserMatches(userId)
          ])
        
          if (prefsResult.data) {
            setPreferences({
              sectors: prefsResult.data.sectors || [],
              interests: prefsResult.data.interests || [],
              lookingFor: prefsResult.data.looking_for || 'all',
              country: prefsResult.data.country || ''
            })
            setCurrentStep('results')
          }
          
          if (matchesResult.data) {
            setSavedMatches(matchesResult.data)
          }
        } catch (supabaseErr) {
          console.warn('Could not load user preferences or matches:', supabaseErr)
          // Continue with default preferences
        }
      }
      
      // Auto-generate matches if we have preferences
      if (exhibitorList.length > 0) {
        const userSector = user?.company_sectors || userProfile?.sector
        if (userSector || preferences.sectors.length > 0) {
          generateMatches(exhibitorList)
          setCurrentStep('results')
        }
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
    const form3 = exhibitor.form3_data_entry || {}
    const eventsUser = exhibitor.events_user || exhibitor
    
    // Sector matching (highest weight - 40 points max)
    const userSectors = userPrefs.sectors.length > 0 ? userPrefs.sectors : [user?.company_sectors, userProfile?.sector].filter(Boolean)
    if (userSectors.some(s => exSector.toLowerCase().includes(s?.toLowerCase() || ''))) {
      score += 40
      reasons.push('sector')
    } else if (form3.industries) {
      const industries = Array.isArray(form3.industries) ? form3.industries : [form3.industries]
      if (industries.some(i => userSectors.some(s => (i.name || i.en_name || i || '').toLowerCase().includes(s?.toLowerCase() || '')))) {
        score += 35
        reasons.push('sector')
      }
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
      const descMatch = (exhibitor.description || form3.company_description || '').toLowerCase().includes(interest.toLowerCase())
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

  const handleSavePreferences = async () => {
    const userId = user?.id || user?.user_id || user?.visitor_id
    if (userId) {
      try {
        await saveUserPreferences(userId, {
          sectors: preferences.sectors,
          interests: preferences.interests,
          looking_for: preferences.lookingFor,
          country: preferences.country
        })
      } catch (err) {
        console.warn('Could not save preferences:', err)
        // Continue with match generation even if save fails
      }
    }
    generateMatches()
  }

  const handleSaveMatch = async (exhibitor) => {
    const userId = user?.id || user?.user_id || user?.visitor_id
    if (!userId) return
    
    const matchData = {
      user_id: userId,
      exhibitor_id: exhibitor.id,
      exhibitor_name: exhibitor.en_name || exhibitor.company_name || exhibitor.name,
      exhibitor_logo: exhibitor.form3_data_entry?.company_logo || exhibitor.logo_url || exhibitor.logo,
      exhibitor_booth: exhibitor.booth_number || exhibitor.booth,
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

  const toggleSector = (sector) => {
    setPreferences(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }))
  }

  const toggleInterest = (interest) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  // Get helper functions for exhibitor data
  const getExhibitorName = (ex) => ex.en_name || ex.company_name || ex.name || 'Unknown'
  const getExhibitorLogo = (ex) => ex.form3_data_entry?.company_logo || ex.logo_url || ex.logo || DEFAULT_LOGO
  const getExhibitorSector = (ex) => {
    const form3 = ex.form3_data_entry
    if (form3?.industries) {
      const industries = Array.isArray(form3.industries) ? form3.industries : [form3.industries]
      if (industries.length > 0) {
        const first = industries[0]
        return typeof first === 'string' ? first : first.name || first.en_name || 'General'
      }
    }
    return ex.sector || ex.industry || ex.category || 'General'
  }
  const getSponsorLevel = (ex) => {
    const eventsUser = ex.events_user || ex
    if (eventsUser.is_platinum_sponsorship) return 'platinum'
    if (eventsUser.gold_sponsorship) return 'gold'
    if (eventsUser.silver_sponsorship) return 'silver'
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading matchmaking...</p>
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
                AI Matchmaking
              </h1>
              <p className="text-white/70 text-sm mt-1">Find your perfect business partners</p>
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
              { key: 'matches', label: 'Matches', count: matches.length },
              { key: 'saved', label: 'Saved', count: savedMatches.length },
              { key: 'how', label: 'How it Works' },
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
                <h2 className="text-xl font-bold text-gray-900">Set Your Preferences</h2>
                <p className="text-gray-500 text-sm mt-1">Help us find the best matches for you</p>
              </div>

              {/* Sector Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  What industries are you interested in?
                </label>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map(sector => (
                    <button
                      key={sector}
                      onClick={() => toggleSector(sector)}
                      className={clsx(
                        'px-3 py-2 rounded-xl text-sm font-medium transition-all border',
                        preferences.sectors.includes(sector)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                      )}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  What are you looking for?
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={clsx(
                        'px-3 py-2 rounded-xl text-sm font-medium transition-all border',
                        preferences.interests.includes(interest)
                          ? 'bg-accent-600 text-white border-accent-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-accent-300'
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Looking For */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Exhibitor type preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'all', label: 'All', icon: Users },
                    { key: 'sponsors', label: 'Sponsors', icon: Crown },
                    { key: 'partners', label: 'Partners', icon: BadgeCheck },
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
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-primary-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI is finding matches...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Find My Matches
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
                  <h3 className="text-lg font-bold text-gray-900 mb-2">AI is analyzing...</h3>
                  <p className="text-gray-500 text-sm text-center max-w-xs">
                    Matching your profile with {exhibitors.length} exhibitors
                  </p>
                </div>
              ) : matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
                    <Target className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No matches yet</h3>
                  <p className="text-gray-500 text-sm text-center max-w-xs mb-4">
                    Set your preferences to find matching exhibitors
                  </p>
                  <button
                    onClick={() => setCurrentStep('preferences')}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium"
                  >
                    Set Preferences
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">{matches.length} matches found</p>
                    <button
                      onClick={() => generateMatches()}
                      className="flex items-center gap-1 text-sm text-primary-600 font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
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
                              {exhibitor.matchScore}% Match
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {exhibitor.matchReasons?.slice(0, 3).map(reason => {
                              const config = MATCH_REASONS[reason]
                              if (!config) return null
                              const ReasonIcon = config.icon
                              return (
                                <div key={reason} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center" title={config.label}>
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
                                      {config.label}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                            {exhibitor.booth_number && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                Booth {exhibitor.booth_number}
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
                                View Profile
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
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No saved matches</h3>
                  <p className="text-gray-500 text-sm text-center max-w-xs">
                    Save matches to revisit them later
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
                            <span className="text-primary-600 font-medium">{match.match_score}% match</span>
                            {match.exhibitor_booth && (
                              <>
                                <span>•</span>
                                <span>Booth {match.exhibitor_booth}</span>
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
                  How AI Matchmaking Works
                </h3>
                <div className="space-y-4">
                  {[
                    { step: 1, title: 'Profile Analysis', desc: 'We analyze your company profile, industry sector, and interests' },
                    { step: 2, title: 'Exhibitor Scanning', desc: 'Our AI scans all exhibitor profiles for compatibility signals' },
                    { step: 3, title: 'Scoring Algorithm', desc: 'Each match is scored based on industry overlap, interests, and more' },
                    { step: 4, title: 'Smart Ranking', desc: 'Matches are ranked by compatibility and business potential' },
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
                <h4 className="font-semibold text-gray-900 mb-2">Match Score Meaning</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-700">80-100%: Excellent match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-700">50-79%: Good potential</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-gray-700">20-49%: Worth exploring</span>
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
