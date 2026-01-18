/**
 * EventX Visitor App API Service
 * Connects to the EventX backend API for visitor management
 */

const EVENTX_API_BASE_URL = 'https://eventxtest.fxunlock.com/api';
const DEFAULT_EVENT_ID = 11;

// Token storage
let authToken = null;

/**
 * Set the authentication token for subsequent requests
 */
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('eventx_token', token);
  } else {
    localStorage.removeItem('eventx_token');
  }
};

/**
 * Get the current authentication token
 */
export const getAuthToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem('eventx_token');
  }
  return authToken;
};

/**
 * Clear the authentication token
 */
export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('eventx_token');
};

/**
 * Make an authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${EVENTX_API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
};

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Register a new visitor
 * @param {Object} visitorData - Visitor registration data
 */
export const registerVisitor = async (visitorData) => {
  const payload = {
    eventId: visitorData.eventId || DEFAULT_EVENT_ID,
    email: visitorData.email,
    salutation: visitorData.salutation || 'Mr',
    first_name: visitorData.firstName || visitorData.first_name,
    last_name: visitorData.lastName || visitorData.last_name,
    company: visitorData.company,
    phone: visitorData.phone || '',
    mobile: visitorData.mobile || '',
    job: visitorData.job || visitorData.jobTitle || '',
    country: visitorData.country,
    region: visitorData.region || '',
    referredEmail: visitorData.referredEmail || '',
    companySector: visitorData.companySector || [],
    howHeardAboutUs: visitorData.howHeardAboutUs || [],
  };

  return apiRequest('/register-visitor?libya-build-benghazi', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Login a visitor
 * @param {string} email - Visitor email
 * @param {string} password - Visitor password
 * @param {number} eventId - Event ID (default: 10)
 */
export const loginVisitor = async (email, password, eventId = DEFAULT_EVENT_ID) => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);
  formData.append('eventId', eventId.toString());

  const response = await apiRequest('/login-visitor', {
    method: 'POST',
    body: formData,
  });

  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
};

// ============================================================================
// VISITOR PROFILE ENDPOINTS
// ============================================================================

/**
 * Get visitor badge information
 * @param {string} badgeId - Badge ID
 */
export const getVisitorBadge = async (badgeId) => {
  return apiRequest(`/visitor-badge/${encodeURIComponent(badgeId)}`);
};

/**
 * Update visitor profile
 * @param {Object} profileData - Profile data to update
 */
export const updateProfile = async (profileData) => {
  const formData = new FormData();
  
  if (profileData.firstName) formData.append('first_name', profileData.firstName);
  if (profileData.lastName) formData.append('last_name', profileData.lastName);
  if (profileData.email) formData.append('email', profileData.email);
  if (profileData.company) formData.append('company_text', profileData.company);
  if (profileData.jobTitle) formData.append('job_title', profileData.jobTitle);

  return apiRequest('/profile/update', {
    method: 'POST',
    body: formData,
  });
};

// ============================================================================
// MEETING & SCHEDULE ENDPOINTS
// ============================================================================

/**
 * Get visitor meetings for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 */
export const getVisitorMeetings = async (date) => {
  return apiRequest(`/visitor/meetings?date=${date}`);
};

/**
 * Get all schedules
 */
export const getSchedules = async () => {
  return apiRequest('/schedule/index');
};

/**
 * Get featured schedules
 */
export const getFeaturedSchedules = async () => {
  return apiRequest('/get-feature-schedule');
};

/**
 * Store/create a new meeting schedule
 * @param {Object} scheduleData - Schedule data
 */
export const createSchedule = async (scheduleData) => {
  const payload = {
    exhibitor_id: scheduleData.exhibitorId || scheduleData.exhibitor_id,
    date: scheduleData.date,
    time: scheduleData.time,
    message: scheduleData.message || '',
  };

  return apiRequest('/schedule/store', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Approve a meeting
 * @param {number} meetingId - Meeting ID
 */
export const approveMeeting = async (meetingId) => {
  return apiRequest(`/schedule/${meetingId}/1`, {
    method: 'PUT',
  });
};

/**
 * Cancel a meeting
 * @param {number} meetingId - Meeting ID
 */
export const cancelMeeting = async (meetingId) => {
  return apiRequest(`/schedule/${meetingId}/2`, {
    method: 'PUT',
  });
};

// ============================================================================
// EXHIBITION & EXHIBITOR ENDPOINTS
// ============================================================================

/**
 * Get exhibition events
 */
export const getExhibitionEvents = async () => {
  return apiRequest('/exhibition-event/index');
};

/**
 * Get exhibition event details
 * @param {number} eventId - Event ID
 */
export const getExhibitionEventDetails = async (eventId) => {
  return apiRequest(`/exhibition-event/show/${eventId}`);
};

/**
 * Get all exhibitors
 */
export const getExhibitors = async () => {
  return apiRequest('/get-exhibitor');
};

/**
 * Search exhibitors
 * @param {string} searchTerm - Search term
 */
export const searchExhibitors = async (searchTerm) => {
  return apiRequest(`/exhibitors?search=${encodeURIComponent(searchTerm)}`);
};

/**
 * Get exhibitor badges
 * @param {number} exhibitorId - Exhibitor ID
 */
export const getExhibitorBadges = async (exhibitorId) => {
  return apiRequest(`/exhibitor-badges/${exhibitorId}`);
};

// ============================================================================
// PRODUCTS & INDUSTRIES
// ============================================================================

/**
 * Get all products
 */
export const getProducts = async () => {
  return apiRequest('/get-products');
};

/**
 * Get all industries
 */
export const getIndustries = async () => {
  return apiRequest('/get-industry');
};

// ============================================================================
// FAVORITES ENDPOINTS
// ============================================================================

/**
 * Toggle exhibitor favorite status
 * @param {number} exhibitorId - Exhibitor ID
 * @param {number} eventId - Event ID
 */
export const toggleFavorite = async (exhibitorId, eventId = DEFAULT_EVENT_ID) => {
  return apiRequest('/exhibitor-favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({
      exhibitor_id: exhibitorId,
      event_id: eventId,
    }),
  });
};

/**
 * Check if exhibitor is favorited
 * @param {number} exhibitorId - Exhibitor ID
 * @param {number} eventId - Event ID
 */
export const checkFavorite = async (exhibitorId, eventId = DEFAULT_EVENT_ID) => {
  return apiRequest(`/exhibitor-favorites/check?exhibitor_id=${exhibitorId}&event_id=${eventId}`);
};

/**
 * Get all exhibitor favorites
 */
export const getExhibitorFavorites = async () => {
  return apiRequest('/exhibitor-favorites');
};

// ============================================================================
// NOTIFICATION ENDPOINTS
// ============================================================================

/**
 * Get all notifications
 */
export const getNotifications = async () => {
  return apiRequest('/notifications');
};

/**
 * Get unread notifications count
 */
export const getUnreadNotifications = async () => {
  return apiRequest('/notifications/unread');
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async () => {
  return apiRequest('/notifications/mark-all-read');
};

/**
 * Mark a specific notification as read
 * @param {string} notificationId - Notification UUID
 */
export const markNotificationRead = async (notificationId) => {
  return apiRequest(`/notifications/${notificationId}/read`);
};

// ============================================================================
// PARTNERS ENDPOINTS
// ============================================================================

/**
 * Get partners for an event
 * @param {number} eventId - Event ID
 */
export const getPartners = async (eventId = DEFAULT_EVENT_ID) => {
  return apiRequest(`/partners?event_id=${eventId}`);
};

// ============================================================================
// TRAVEL & ACCOMMODATION ENDPOINTS
// ============================================================================

/**
 * Store flight details
 * @param {Object} flightData - Flight details
 * @param {File} flightTicket - Flight ticket file (optional)
 * @param {File} passport - Passport file (optional)
 */
export const storeFlightDetails = async (flightData, flightTicket = null, passport = null) => {
  const formData = new FormData();
  
  formData.append('passenger_name', flightData.passengerName || flightData.passenger_name);
  formData.append('nationality', flightData.nationality);
  formData.append('airlines', flightData.airlines);
  formData.append('flight_no', flightData.flightNo || flightData.flight_no);
  formData.append('arrival_date', flightData.arrivalDate || flightData.arrival_date);
  formData.append('arrival_time', flightData.arrivalTime || flightData.arrival_time);
  
  if (flightTicket) {
    formData.append('flight_ticket', flightTicket);
  }
  if (passport) {
    formData.append('passport', passport);
  }

  return apiRequest('/store-flight-details', {
    method: 'POST',
    body: formData,
  });
};

/**
 * Submit visa application
 * @param {Object} visaData - Visa application data
 * @param {File} passportPhotocopy - Passport photocopy file (optional)
 */
export const submitVisaApplication = async (visaData, passportPhotocopy = null) => {
  const formData = new FormData();
  
  formData.append('company_name', visaData.companyName || visaData.company_name);
  formData.append('applicants_name', visaData.applicantName || visaData.applicants_name);
  formData.append('nationality', visaData.nationality);
  formData.append('passport_no', visaData.passportNo || visaData.passport_no);
  formData.append('mobile_no', visaData.mobileNo || visaData.mobile_no);
  formData.append('email', visaData.email);
  formData.append('date_of_birth', visaData.dateOfBirth || visaData.date_of_birth);
  formData.append('place_of_birth', visaData.placeOfBirth || visaData.place_of_birth);
  formData.append('profession', visaData.profession);
  formData.append('date_of_expiry', visaData.dateOfExpiry || visaData.date_of_expiry);
  formData.append('date_of_issue', visaData.dateOfIssue || visaData.date_of_issue);
  formData.append('invoice', visaData.invoice || 'pending');
  formData.append('status', visaData.status || 'pending');
  formData.append('type', visaData.type || 'visitor');
  
  if (passportPhotocopy) {
    formData.append('passportphotocopy', passportPhotocopy);
  }

  return apiRequest('/form13-visitor', {
    method: 'POST',
    body: formData,
  });
};

/**
 * Submit hotel request
 * @param {Object} hotelData - Hotel request data
 */
export const submitHotelRequest = async (hotelData) => {
  const payload = {
    guest_name: hotelData.guestName || hotelData.guest_name,
    company_name: hotelData.companyName || hotelData.company_name,
    email: hotelData.email,
    mobile_no: hotelData.mobileNo || hotelData.mobile_no,
    check_in_date: hotelData.checkInDate || hotelData.check_in_date,
    check_out_date: hotelData.checkOutDate || hotelData.check_out_date,
    type: hotelData.type || 'visitor',
    rooms: hotelData.rooms || [],
  };

  return apiRequest('/form15-visitor', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ============================================================================
// STAFF ATTENDANCE ENDPOINTS
// ============================================================================

/**
 * Generate a unique reference for attendance scan
 * @param {number} userId - User/Visitor ID
 * @param {string} day - Event day (day1, day2, etc.)
 * @param {string} scanType - Type of scan (check_in, check_out)
 */
const generateAttendanceReference = (userId, day, scanType) => {
  const timestamp = Date.now();
  return `LB26-${day.toUpperCase()}-${scanType.toUpperCase()}-${userId}-${timestamp}`;
};

/**
 * Record attendance via API (Staff only)
 * Supports both check-in and check-out
 * @param {Object} attendanceData - Attendance data
 * @param {number} attendanceData.userId - User/Visitor ID from scanned badge
 * @param {string} attendanceData.scanType - Type of scan ('check_in' or 'check_out')
 * @param {string} attendanceData.day - Event day (day1, day2, day3, day4)
 * @param {string} attendanceData.date - Date in YYYY-MM-DD format
 * @param {number} eventId - Event ID (default: 11 for Libya Build)
 */
export const recordAttendance = async (attendanceData, eventId = DEFAULT_EVENT_ID) => {
  const now = new Date();
  const dateStr = attendanceData.date || now.toISOString().split('T')[0];
  const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);
  
  const reference = generateAttendanceReference(
    attendanceData.userId,
    attendanceData.day,
    attendanceData.scanType
  );

  const payload = {
    user_id: attendanceData.userId,
    event_id: eventId,
    check_in: attendanceData.scanType === 'check_in' ? timeStr : '',
    check_out: attendanceData.scanType === 'check_out' ? timeStr : '',
    date: dateStr,
    reference: reference,
  };

  return apiRequest('/attendances', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Check-in a visitor (Staff only)
 * @param {number} userId - User/Visitor ID from scanned badge
 * @param {string} day - Event day (day1, day2, day3, day4)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} eventId - Event ID
 */
export const checkInAttendance = async (userId, day, date, eventId = DEFAULT_EVENT_ID) => {
  return recordAttendance({
    userId,
    scanType: 'check_in',
    day,
    date,
  }, eventId);
};

/**
 * Check-out a visitor (Staff only)
 * @param {number} userId - User/Visitor ID from scanned badge
 * @param {string} day - Event day (day1, day2, day3, day4)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} eventId - Event ID
 */
export const checkOutAttendance = async (userId, day, date, eventId = DEFAULT_EVENT_ID) => {
  return recordAttendance({
    userId,
    scanType: 'check_out',
    day,
    date,
  }, eventId);
};

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export default {
  // Auth
  registerVisitor,
  loginVisitor,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  
  // Profile
  getVisitorBadge,
  updateProfile,
  
  // Meetings & Schedule
  getVisitorMeetings,
  getSchedules,
  getFeaturedSchedules,
  createSchedule,
  approveMeeting,
  cancelMeeting,
  
  // Exhibition & Exhibitors
  getExhibitionEvents,
  getExhibitionEventDetails,
  getExhibitors,
  searchExhibitors,
  getExhibitorBadges,
  
  // Products & Industries
  getProducts,
  getIndustries,
  
  // Favorites
  toggleFavorite,
  checkFavorite,
  getExhibitorFavorites,
  
  // Notifications
  getNotifications,
  getUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  
  // Partners
  getPartners,
  
  // Travel & Accommodation
  storeFlightDetails,
  submitVisaApplication,
  submitHotelRequest,
  
  // Staff Attendance
  recordAttendance,
  checkInAttendance,
  checkOutAttendance,
};
