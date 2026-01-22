/**
 * API Caching Service
 * Provides simple in-memory caching for API responses with TTL (Time To Live)
 */

const cache = new Map();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data or fetch fresh data
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch fresh data
 * @param {number} ttl - Time to live in milliseconds
 */
export const getCachedData = async (key, fetchFn, ttl = DEFAULT_TTL) => {
  const now = Date.now();
  const cached = cache.get(key);

  // Return cached data if still valid
  if (cached && now < cached.expiresAt) {
    return cached.data;
  }

  // Fetch fresh data
  const data = await fetchFn();
  
  // Store in cache with expiration
  cache.set(key, {
    data,
    expiresAt: now + ttl,
  });

  return data;
};

/**
 * Clear specific cache key
 * @param {string} key - Cache key to clear
 */
export const clearCache = (key) => {
  cache.delete(key);
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
  cache.clear();
};

/**
 * Check if cache exists and is valid
 * @param {string} key - Cache key
 */
export const isCached = (key) => {
  const cached = cache.get(key);
  return cached && Date.now() < cached.expiresAt;
};

export default {
  getCachedData,
  clearCache,
  clearAllCache,
  isCached,
};
