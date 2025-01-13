// @flow

import type { HistoryType, GetCacheFromStorageResponseType, RuntimeCacheType } from './types'

const tryToGetCache = async ({
  runtimeCacheKey,
  runtimeCache,
  getCacheFromStorage,
}: {
  runtimeCacheKey: string,
  runtimeCache: RuntimeCacheType,
  getCacheFromStorage: () => Promise<GetCacheFromStorageResponseType>,
}): Promise<HistoryType> => {
  const cache: ?HistoryType = runtimeCache.get(runtimeCacheKey)

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
