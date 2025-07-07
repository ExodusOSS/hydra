/**
 * @typedef {import('./types.js').RuntimeCacheType} RuntimeCacheType
 * @typedef {import('./types.js').HistoryType} HistoryType
 * @typedef {import('./types.js').GetCacheFromStorageResponseType} GetCacheFromStorageResponseType
 */

/**
 * @param {object} options
 * @param {string} options.runtimeCacheKey
 * @param {RuntimeCacheType} options.runtimeCache
 * @param {() => Promise<GetCacheFromStorageResponseType>} options.getCacheFromStorage
 * @returns {Promise<HistoryType>}
 */

const tryToGetCache = async ({ runtimeCacheKey, runtimeCache, getCacheFromStorage }) => {
  const cache = runtimeCache.get(runtimeCacheKey)

  if (cache) {
    return new Map(cache)
  }

  if (!getCacheFromStorage) {
    return new Map()
  }

  try {
    let cacheFromStorage = await getCacheFromStorage()

    if (typeof cacheFromStorage === 'string') {
      // backwards compatibility
      const fixedCache = JSON.parse(cacheFromStorage)
      cacheFromStorage = fixedCache
    }

    return new Map(cacheFromStorage)
  } catch (e) {
    throw new Error('failed to load cache from storage. ' + e)
  }
}

export default tryToGetCache
