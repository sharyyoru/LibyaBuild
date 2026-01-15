/**
 * EventX API Integration Test Script
 * Run with: node scripts/testEventxApi.js
 * 
 * Environment variables (optional):
 *   EVENTX_TOKEN - Valid auth token for testing authenticated endpoints
 *   EVENTX_EVENT_ID - Valid event ID (default: 10)
 *   EVENTX_TEST_EMAIL - Test visitor email
 *   EVENTX_TEST_PASSWORD - Test visitor password
 * 
 * Example:
 *   EVENTX_TOKEN=your_token node scripts/testEventxApi.js
 */

const EVENTX_API_BASE_URL = process.env.EVENTX_API_URL || 'https://eventxtest.fxunlock.com/api';
const DEFAULT_EVENT_ID = parseInt(process.env.EVENTX_EVENT_ID) || 10;

let authToken = process.env.EVENTX_TOKEN || null;

// Fallback token from Postman collection (may be expired)
const FALLBACK_TOKEN = '219|LLQfR3Mn3uM18sfQwXZWvjBjDuXYAeBLUvJmB6JE58a5e048';

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

const testLoginCredentials = {
  email: process.env.EVENTX_TEST_EMAIL || 'visitor@test.test',
  password: process.env.EVENTX_TEST_PASSWORD || 'visitor-kFapB4S1',
  eventId: DEFAULT_EVENT_ID,
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
    
    logSuccess('Visitor registration completed');
    return result;
  } catch (error) {
    logError('Registration failed', error);
    return null;
  }
}

async function testLoginVisitor() {
  log('TEST: Login Visitor', { email: testLoginCredentials.email, eventId: testLoginCredentials.eventId });
  
  try {
    // Use FormData for multipart/form-data (like Postman)
    const formData = new FormData();
    formData.append('email', testLoginCredentials.email);
    formData.append('password', testLoginCredentials.password);
    formData.append('eventId', testLoginCredentials.eventId.toString());

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
    console.log('\n⚠ Login failed - using fallback token from Postman collection to test authenticated endpoints');
    authToken = FALLBACK_TOKEN;
  }
  
  {
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
