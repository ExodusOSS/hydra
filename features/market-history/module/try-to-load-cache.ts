import type { CacheEntry, PriceData } from '../types.js'

const tryToGetCache = async ({
  runtimeCacheKey,
  runtimeCache,
  getCacheFromStorage,
}: {
  runtimeCacheKey: string
  runtimeCache: Map<string, CacheEntry[]>
  getCacheFromStorage?: () => Promise<CacheEntry[] | string | undefined>
}): Promise<Map<number, PriceData>> => {
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

    // TODO: validate cacheFromStorage shape at runtime before casting
    return new Map(cacheFromStorage as CacheEntry[])
  } catch (e) {
    throw new Error('failed to load cache from storage. ' + e)
  }
}

export default tryToGetCache
