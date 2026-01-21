/**
 * Localization utilities for handling multilingual API data
 */

/**
 * Get localized field value based on current language
 * Tries multiple field name patterns: ar_field, arField, field_ar, fieldAr
 * @param {Object} obj - The object containing the fields
 * @param {string} baseField - The base field name (e.g., 'name', 'company', 'profile')
 * @param {string} language - Current language ('en' or 'ar')
 * @param {string} fallback - Fallback value if no field found
 * @returns {string} The localized value
 */
export const getLocalizedField = (obj, baseField, language = 'en', fallback = '') => {
  if (!obj) return fallback
  
  // If English, try English fields first
  if (language === 'en' || !language) {
    const enPatterns = [
      `en_${baseField}`,
      `${baseField}_en`,
      baseField,
      `enName`,
      `en_name`
    ]
    
    for (const pattern of enPatterns) {
      if (obj[pattern]) return obj[pattern]
    }
    
    return fallback
  }
  
  // If Arabic, try Arabic fields first, then fallback to English
  if (language === 'ar') {
    const arPatterns = [
      `ar_${baseField}`,
      `${baseField}_ar`,
      `ar${baseField.charAt(0).toUpperCase()}${baseField.slice(1)}`,
      'ar_name',
      'ar_company',
      'arName'
    ]
    
    for (const pattern of arPatterns) {
      if (obj[pattern]) return obj[pattern]
    }
    
    // Fallback to English if no Arabic field found
    const enPatterns = [
      `en_${baseField}`,
      `${baseField}_en`,
      baseField,
      'en_name',
      'company_name',
      'name'
    ]
    
    for (const pattern of enPatterns) {
      if (obj[pattern]) return obj[pattern]
    }
  }
  
  return fallback
}

/**
 * Get localized name from exhibitor/sponsor/partner data
 */
export const getLocalizedName = (entity, language = 'en') => {
  if (!entity) return 'Unknown'
  
  if (language === 'ar') {
    // Try Arabic name patterns
    const arName = entity.ar_name || 
                   entity.ar_company || 
                   entity.arName ||
                   entity.form3_data_entry?.[0]?.ar_company ||
                   entity._form3Entry?.ar_company
    
    if (arName) return arName
  }
  
  // Fallback to English name
  return entity.en_name || 
         entity.company_name || 
         entity.name || 
         entity.company || 
         'Unknown'
}

/**
 * Get localized profile/description
 */
export const getLocalizedProfile = (entity, language = 'en') => {
  if (!entity) return ''
  
  if (language === 'ar') {
    // Check form3_data_entry for Arabic profile
    const form3Array = entity?.form3_data_entry
    if (Array.isArray(form3Array) && form3Array.length > 0) {
      const arProfile = form3Array[0]?.ar_company_profile || form3Array[0]?.ar_profile
      if (arProfile) return arProfile
    }
    
    const arProfile = entity.ar_company_profile || entity.ar_profile || entity.ar_description
    if (arProfile) return arProfile
  }
  
  // Fallback to English
  const form3Array = entity?.form3_data_entry
  if (Array.isArray(form3Array) && form3Array.length > 0) {
    const enProfile = form3Array[0]?.company_profile || form3Array[0]?.profile
    if (enProfile) return enProfile
  }
  
  return entity.company_profile || 
         entity.description || 
         entity.about || 
         entity.company_description || 
         ''
}

/**
 * Get localized industry/sector name
 */
export const getLocalizedIndustry = (industry, language = 'en') => {
  if (!industry) return ''
  
  if (typeof industry === 'string') return industry
  
  if (language === 'ar') {
    return industry.ar_name || industry.name || industry.en_name || ''
  }
  
  return industry.name || industry.en_name || industry.ar_name || ''
}
