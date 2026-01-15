/**
 * EventX API Integration Test Script
 * 
 * Usage:
 *   node scripts/testEventxApi.js [email] [password]
 *   
 * Or with environment variables:
 *   EVENTX_TEST_EMAIL=email EVENTX_TEST_PASSWORD=pass node scripts/testEventxApi.js
 * 
 * Environment variables:
 *   EVENTX_TOKEN - Valid auth token (skip login)
 *   EVENTX_EVENT_ID - Event ID (default: 11)
 *   EVENTX_TEST_EMAIL - Test visitor email
 *   EVENTX_TEST_PASSWORD - Test visitor password
 * 
 * Examples:
 *   node scripts/testEventxApi.js user@example.com mypassword123
 *   EVENTX_TOKEN=your_token node scripts/testEventxApi.js
 */

// Parse command line arguments
const args = process.argv.slice(2);
const CLI_EMAIL = args[0] || null;
const CLI_PASSWORD = args[1] || null;

const EVENTX_API_BASE_URL = process.env.EVENTX_API_URL || 'https://eventxtest.fxunlock.com/api';
const DEFAULT_EVENT_ID = parseInt(process.env.EVENTX_EVENT_ID) || 11;

let authToken = process.env.EVENTX_TOKEN || null;

// Store registered user credentials for login
let registeredUserEmail = null;
let registeredUserPassword = null;

// Test data
const testVisitor = {
  eventId: DEFAULT_EVENT_ID,
  email: `test.visitor.${Date.now()}@example.com`,
  salutation: 'Mr',
  first_name: 'Test',
  last_name: 'Visitor',
  company: 'Test Company Ltd',
  phone: '02-1234-5678',
  mobile: '09123456789',
  job: 'Software Developer',
  country: 'Libya',
  region: 'Tripoli',
  referredEmail: '',
  companySector: ['Architecture', 'Building & Construction Materials'],
  howHeardAboutUs: ['Email', 'Search Engine'],
};

// Valid test credentials for event 11
const DEFAULT_TEST_EMAIL = 'test.visitor.1768472789611@example.com';
const DEFAULT_TEST_PASSWORD = 'visitor-qAcNF2an';

// Get login credentials - priority: CLI args > registered > env vars > defaults
const getLoginCredentials = () => {
  // CLI arguments have highest priority
  if (CLI_EMAIL && CLI_PASSWORD) {
    return {
      email: CLI_EMAIL,
      password: CLI_PASSWORD,
      eventId: DEFAULT_EVENT_ID,
    };
  }
  // If we have both registered email AND password, use them
  if (registeredUserEmail && registeredUserPassword) {
    return {
      email: registeredUserEmail,
      password: registeredUserPassword,
      eventId: DEFAULT_EVENT_ID,
    };
  }
  // Otherwise use environment variables or default test credentials
  return {
    email: process.env.EVENTX_TEST_EMAIL || DEFAULT_TEST_EMAIL,
    password: process.env.EVENTX_TEST_PASSWORD || DEFAULT_TEST_PASSWORD,
    eventId: DEFAULT_EVENT_ID,
  };
};

// Utility functions
const log = (message, data = null) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logError = (message, error) => {
  console.error(`\n${'!'.repeat(60)}`);
  console.error(`[ERROR] ${message}`);
  console.error(error.message || error);
};

const logSuccess = (message) => {
  console.log(`\n[SUCCESS] ${message}`);
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${EVENTX_API_BASE_URL}${endpoint}`;
  log(`Request: ${options.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = { raw: responseText };
  }

  log(`Response Status: ${response.status}`, data);

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
};

// Test functions
async function testRegisterVisitor() {
  log('TEST: Register Visitor', testVisitor);
  
  try {
    const result = await apiRequest('/register-visitor?libya-build-benghazi', {
      method: 'POST',
      body: JSON.stringify(testVisitor),
    });
    
    // Store credentials from registration response for login
    registeredUserEmail = testVisitor.email;
    
    // Check if password is returned in response
    if (result.password) {
      registeredUserPassword = result.password;
      logSuccess(`Visitor registration completed - Password received: ${result.password}`);
    } else if (result.data && result.data.password) {
      registeredUserPassword = result.data.password;
      logSuccess(`Visitor registration completed - Password received: ${result.data.password}`);
    } else if (result.visitor && result.visitor.password) {
      registeredUserPassword = result.visitor.password;
      logSuccess(`Visitor registration completed - Password received: ${result.visitor.password}`);
    } else {
      logSuccess('Visitor registration completed');
      log('Registration response (checking for password field)', result);
    }
    
    // If token is provided directly after registration, use it
    if (result.token) {
      authToken = result.token;
      logSuccess(`Token obtained from registration: ${authToken.substring(0, 20)}...`);
    } else if (result.access_token) {
      authToken = result.access_token;
      logSuccess(`Token obtained from registration: ${authToken.substring(0, 20)}...`);
    }
    
    return result;
  } catch (error) {
    logError('Registration failed', error);
    return null;
  }
}

async function testLoginVisitor() {
  const credentials = getLoginCredentials();
  
  log('TEST: Login Visitor', { email: credentials.email, eventId: credentials.eventId });
  
  try {
    // Use FormData for multipart/form-data (like Postman)
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);
    formData.append('eventId', credentials.eventId.toString());

    const result = await apiRequest('/login-visitor', {
      method: 'POST',
      body: formData,
    });
    
    if (result.token) {
      authToken = result.token;
      logSuccess(`Login successful - Token obtained: ${authToken.substring(0, 20)}...`);
    } else if (result.access_token) {
      authToken = result.access_token;
      logSuccess(`Login successful - Token obtained: ${authToken.substring(0, 20)}...`);
    } else {
      log('Login response (no token found in expected fields)', result);
    }
    
    return result;
  } catch (error) {
    logError('Login failed', error);
    return null;
  }
}

async function testGetExhibitors() {
  log('TEST: Get Exhibitors');
  
  try {
    const result = await apiRequest('/get-exhibitor');
    logSuccess(`Fetched ${Array.isArray(result) ? result.length : 'N/A'} exhibitors`);
    return result;
  } catch (error) {
    logError('Get exhibitors failed', error);
    return null;
  }
}

async function testGetProducts() {
  log('TEST: Get Products');
  
  try {
    const result = await apiRequest('/get-products');
    logSuccess(`Fetched products`);
    return result;
  } catch (error) {
    logError('Get products failed', error);
    return null;
  }
}

async function testGetIndustries() {
  log('TEST: Get Industries');
  
  try {
    const result = await apiRequest('/get-industry');
    logSuccess(`Fetched industries`);
    return result;
  } catch (error) {
    logError('Get industries failed', error);
    return null;
  }
}

async function testGetSchedules() {
  log('TEST: Get Schedules');
  
  try {
    const result = await apiRequest('/schedule/index');
    logSuccess(`Fetched schedules`);
    return result;
  } catch (error) {
    logError('Get schedules failed', error);
    return null;
  }
}

async function testGetFeaturedSchedules() {
  log('TEST: Get Featured Schedules');
  
  try {
    const result = await apiRequest('/get-feature-schedule');
    logSuccess(`Fetched featured schedules`);
    return result;
  } catch (error) {
    logError('Get featured schedules failed', error);
    return null;
  }
}

async function testGetVisitorMeetings() {
  log('TEST: Get Visitor Meetings');
  
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const result = await apiRequest(`/visitor/meetings?date=${today}`);
    logSuccess(`Fetched visitor meetings for ${today}`);
    return result;
  } catch (error) {
    logError('Get visitor meetings failed', error);
    return null;
  }
}

async function testGetExhibitionEvents() {
  log('TEST: Get Exhibition Events');
  
  try {
    const result = await apiRequest('/exhibition-event/index');
    logSuccess(`Fetched exhibition events`);
    return result;
  } catch (error) {
    logError('Get exhibition events failed', error);
    return null;
  }
}

async function testGetNotifications() {
  log('TEST: Get Notifications');
  
  try {
    const result = await apiRequest('/notifications');
    logSuccess(`Fetched notifications`);
    return result;
  } catch (error) {
    logError('Get notifications failed', error);
    return null;
  }
}

async function testGetPartners() {
  log('TEST: Get Partners');
  
  try {
    const result = await apiRequest(`/partners?event_id=${DEFAULT_EVENT_ID}`);
    logSuccess(`Fetched partners`);
    return result;
  } catch (error) {
    logError('Get partners failed', error);
    return null;
  }
}

async function testSearchExhibitors() {
  log('TEST: Search Exhibitors');
  
  try {
    const result = await apiRequest('/exhibitors?search=mutant');
    logSuccess(`Search exhibitors completed`);
    return result;
  } catch (error) {
    logError('Search exhibitors failed', error);
    return null;
  }
}

async function testGetExhibitorFavorites() {
  log('TEST: Get Exhibitor Favorites');
  
  try {
    const result = await apiRequest('/exhibitor-favorites');
    logSuccess(`Fetched exhibitor favorites`);
    return result;
  } catch (error) {
    logError('Get exhibitor favorites failed', error);
    return null;
  }
}

// ============================================================================
// POST ENDPOINT TESTS
// ============================================================================

async function testUpdateProfile() {
  log('TEST: Update Profile');
  
  const profileData = {
    first_name: 'Test',
    last_name: 'Updated',
    email: getLoginCredentials().email,
    company_text: 'Updated Company',
    job_title: 'Senior Developer'
  };
  
  try {
    const formData = new FormData();
    Object.entries(profileData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const result = await apiRequest('/profile/update', {
      method: 'POST',
      body: formData,
    });
    logSuccess('Profile updated successfully');
    return result;
  } catch (error) {
    logError('Update profile failed', error);
    return null;
  }
}

async function testToggleFavorite() {
  log('TEST: Toggle Favorite');
  
  try {
    const result = await apiRequest('/exhibitor-favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({
        exhibitor_id: 543,
        event_id: DEFAULT_EVENT_ID
      }),
    });
    logSuccess('Favorite toggled successfully');
    return result;
  } catch (error) {
    logError('Toggle favorite failed', error);
    return null;
  }
}

async function testCreateSchedule() {
  log('TEST: Create Schedule/Meeting');
  
  const scheduleData = {
    exhibitor_id: 543,
    date: '2026-03-15',
    time: '14:30',
    message: 'Test meeting request from API integration test'
  };
  
  try {
    const result = await apiRequest('/schedule/store', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
    logSuccess('Schedule created successfully');
    return result;
  } catch (error) {
    logError('Create schedule failed', error);
    return null;
  }
}

async function testStoreFlightDetails() {
  log('TEST: Store Flight Details');
  
  const flightData = {
    passenger_name: 'Test Visitor',
    nationality: 'Libya',
    airlines: 'Libyan Airlines',
    flight_no: 'LN102',
    arrival_date: '2026-03-14',
    arrival_time: '14:30:00'
  };
  
  try {
    const formData = new FormData();
    Object.entries(flightData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const result = await apiRequest('/store-flight-details', {
      method: 'POST',
      body: formData,
    });
    logSuccess('Flight details stored successfully');
    return result;
  } catch (error) {
    logError('Store flight details failed', error);
    return null;
  }
}

async function testSubmitVisaApplication() {
  log('TEST: Submit Visa Application');
  
  const visaData = {
    company_name: 'Test Company',
    applicants_name: 'Test Visitor',
    nationality: 'Libya',
    passport_no: 'P12345678',
    mobile_no: '09123456789',
    email: 'visa.test@example.com',
    date_of_birth: '1990-01-15',
    place_of_birth: 'Tripoli',
    profession: 'Developer',
    date_of_expiry: '2030-01-15',
    date_of_issue: '2020-01-15',
    invoice: 'pending',
    status: 'pending',
    type: 'visitor'
  };
  
  try {
    const formData = new FormData();
    Object.entries(visaData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const result = await apiRequest('/form13-visitor', {
      method: 'POST',
      body: formData,
    });
    logSuccess('Visa application submitted successfully');
    return result;
  } catch (error) {
    logError('Submit visa application failed', error);
    return null;
  }
}

async function testSubmitHotelRequest() {
  log('TEST: Submit Hotel Request');
  
  const hotelData = {
    guest_name: 'Test Visitor',
    company_name: 'Test Company',
    email: 'hotel.test@example.com',
    mobile_no: '09123456789',
    check_in_date: '2026-03-14',
    check_out_date: '2026-03-18',
    type: 'visitor',
    rooms: [
      { room_id: 1, quantity: 1 }
    ]
  };
  
  try {
    const result = await apiRequest('/form15-visitor', {
      method: 'POST',
      body: JSON.stringify(hotelData),
    });
    logSuccess('Hotel request submitted successfully');
    return result;
  } catch (error) {
    logError('Submit hotel request failed', error);
    return null;
  }
}

async function testMarkNotificationRead() {
  log('TEST: Mark All Notifications Read');
  
  try {
    const result = await apiRequest('/notifications/mark-all-read');
    logSuccess('Notifications marked as read');
    return result;
  } catch (error) {
    logError('Mark notifications read failed', error);
    return null;
  }
}

// Main test runner
async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          EventX API Integration Test Suite                 ║');
  console.log('║          Libya Build 2026 - Visitor App                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Base URL: ${EVENTX_API_BASE_URL}`);
  console.log(`Event ID: ${DEFAULT_EVENT_ID}`);
  console.log(`Test started at: ${new Date().toISOString()}`);

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  // Test 1: Register Visitor
  console.log('\n\n▶ PHASE 1: REGISTRATION');
  const registerResult = await testRegisterVisitor();
  results.tests.push({ name: 'Register Visitor', passed: !!registerResult });
  if (registerResult) results.passed++; else results.failed++;

  // Test 2: Login Visitor
  console.log('\n\n▶ PHASE 2: AUTHENTICATION');
  const loginResult = await testLoginVisitor();
  results.tests.push({ name: 'Login Visitor', passed: !!authToken });
  if (authToken) results.passed++; else results.failed++;

  if (!authToken) {
    console.log('\n⚠ No valid token obtained - cannot test authenticated endpoints');
    console.log('  Registration may not have returned a password, or login failed.');
    console.log('  Please check the API response above for credentials.');
  }
  
  if (authToken) {
    // Test 3: Get Exhibitors
    console.log('\n\n▶ PHASE 3: EXHIBITOR DATA');
    const exhibitorsResult = await testGetExhibitors();
    results.tests.push({ name: 'Get Exhibitors', passed: !!exhibitorsResult });
    if (exhibitorsResult) results.passed++; else results.failed++;

    // Test 4: Search Exhibitors
    const searchResult = await testSearchExhibitors();
    results.tests.push({ name: 'Search Exhibitors', passed: !!searchResult });
    if (searchResult) results.passed++; else results.failed++;

    // Test 5: Get Products
    console.log('\n\n▶ PHASE 4: PRODUCTS & INDUSTRIES');
    const productsResult = await testGetProducts();
    results.tests.push({ name: 'Get Products', passed: !!productsResult });
    if (productsResult) results.passed++; else results.failed++;

    // Test 6: Get Industries
    const industriesResult = await testGetIndustries();
    results.tests.push({ name: 'Get Industries', passed: !!industriesResult });
    if (industriesResult) results.passed++; else results.failed++;

    // Test 7: Get Schedules
    console.log('\n\n▶ PHASE 5: SCHEDULES & MEETINGS');
    const schedulesResult = await testGetSchedules();
    results.tests.push({ name: 'Get Schedules', passed: !!schedulesResult });
    if (schedulesResult) results.passed++; else results.failed++;

    // Test 8: Get Featured Schedules
    const featuredResult = await testGetFeaturedSchedules();
    results.tests.push({ name: 'Get Featured Schedules', passed: !!featuredResult });
    if (featuredResult) results.passed++; else results.failed++;

    // Test 9: Get Visitor Meetings
    const meetingsResult = await testGetVisitorMeetings();
    results.tests.push({ name: 'Get Visitor Meetings', passed: !!meetingsResult });
    if (meetingsResult) results.passed++; else results.failed++;

    // Test 10: Get Exhibition Events
    console.log('\n\n▶ PHASE 6: EXHIBITION EVENTS');
    const eventsResult = await testGetExhibitionEvents();
    results.tests.push({ name: 'Get Exhibition Events', passed: !!eventsResult });
    if (eventsResult) results.passed++; else results.failed++;

    // Test 11: Get Notifications
    console.log('\n\n▶ PHASE 7: NOTIFICATIONS');
    const notificationsResult = await testGetNotifications();
    results.tests.push({ name: 'Get Notifications', passed: !!notificationsResult });
    if (notificationsResult) results.passed++; else results.failed++;

    // Test 12: Get Partners
    console.log('\n\n▶ PHASE 8: PARTNERS');
    const partnersResult = await testGetPartners();
    results.tests.push({ name: 'Get Partners', passed: !!partnersResult });
    if (partnersResult) results.passed++; else results.failed++;

    // Test 13: Get Exhibitor Favorites
    console.log('\n\n▶ PHASE 9: FAVORITES');
    const favoritesResult = await testGetExhibitorFavorites();
    results.tests.push({ name: 'Get Exhibitor Favorites', passed: !!favoritesResult });
    if (favoritesResult) results.passed++; else results.failed++;

    // ========== POST ENDPOINT TESTS ==========
    
    // Test 14: Update Profile
    console.log('\n\n▶ PHASE 10: PROFILE UPDATE (POST)');
    const profileResult = await testUpdateProfile();
    results.tests.push({ name: 'Update Profile', passed: !!profileResult });
    if (profileResult) results.passed++; else results.failed++;

    // Test 15: Toggle Favorite
    console.log('\n\n▶ PHASE 11: TOGGLE FAVORITE (POST)');
    const toggleResult = await testToggleFavorite();
    results.tests.push({ name: 'Toggle Favorite', passed: !!toggleResult });
    if (toggleResult) results.passed++; else results.failed++;

    // Test 16: Create Schedule
    console.log('\n\n▶ PHASE 12: CREATE SCHEDULE (POST)');
    const scheduleResult = await testCreateSchedule();
    results.tests.push({ name: 'Create Schedule', passed: !!scheduleResult });
    if (scheduleResult) results.passed++; else results.failed++;

    // Test 17: Store Flight Details
    console.log('\n\n▶ PHASE 13: FLIGHT DETAILS (POST)');
    const flightResult = await testStoreFlightDetails();
    results.tests.push({ name: 'Store Flight Details', passed: !!flightResult });
    if (flightResult) results.passed++; else results.failed++;

    // Test 18: Submit Visa Application
    console.log('\n\n▶ PHASE 14: VISA APPLICATION (POST)');
    const visaResult = await testSubmitVisaApplication();
    results.tests.push({ name: 'Submit Visa Application', passed: !!visaResult });
    if (visaResult) results.passed++; else results.failed++;

    // Test 19: Submit Hotel Request
    console.log('\n\n▶ PHASE 15: HOTEL REQUEST (POST)');
    const hotelResult = await testSubmitHotelRequest();
    results.tests.push({ name: 'Submit Hotel Request', passed: !!hotelResult });
    if (hotelResult) results.passed++; else results.failed++;

    // Test 20: Mark Notifications Read
    console.log('\n\n▶ PHASE 16: NOTIFICATIONS (POST)');
    const notifReadResult = await testMarkNotificationRead();
    results.tests.push({ name: 'Mark Notifications Read', passed: !!notifReadResult });
    if (notifReadResult) results.passed++; else results.failed++;
  }

  // Summary
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTotal Tests: ${results.tests.length}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
  console.log('\nTest Results:');
  results.tests.forEach((test, index) => {
    const status = test.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${index + 1}. ${test.name}: ${status}`);
  });
  console.log(`\nTest completed at: ${new Date().toISOString()}`);
  
  return results;
}

// Run the tests
runTests().then((results) => {
  process.exit(results.failed > 0 ? 1 : 0);
}).catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
