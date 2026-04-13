import tryToLoadCache from '../try-to-load-cache.js'

describe('tryToLoadCache', () => {
  it('returns runtime cache if it exists', async () => {
    const runtimeCache = new Map()
    const runtimeCacheKey = 'BTC-USD-day'
    const historyArray = [[1, { close: 1, high: 2 }]]
    runtimeCache.set(runtimeCacheKey, historyArray)
    const getCacheFromStorage = () => null

    await expect(
      tryToLoadCache({
        runtimeCacheKey,
        runtimeCache,
        getCacheFromStorage,
      })
    ).resolves.toEqual(new Map(historyArray))
  })

  it('returns a clone so mutations do not affect runtimeCache', async () => {
    const runtimeCache = new Map()
    const runtimeCacheKey = 'BTC-USD-day'
    const original = [[1, { close: 100 }]]
    runtimeCache.set(runtimeCacheKey, original)

    const result = await tryToLoadCache({
      runtimeCacheKey,
      runtimeCache,
      getCacheFromStorage: () => null,
    })

    expect(result).toBeInstanceOf(Map)
    result.set(2, { close: 200 })
    result.delete(1)

    expect(runtimeCache.get(runtimeCacheKey)).toBe(original)
    expect(original.length).toBe(1)
    expect(original[0]).toEqual([1, { close: 100 }])
  })

  it('loads cache if runtime cache does not exist', async () => {
    const runtimeCache = new Map()
    const runtimeCacheKey = 'BTC-USD-day'
    const historyData = [[1, { close: 1, high: 2 }]]
    const history = new Map(historyData)
    const getCacheFromStorage = () => Promise.resolve(historyData)

    await expect(
      tryToLoadCache({
        runtimeCacheKey,
        runtimeCache,
        getCacheFromStorage,
      })
    ).resolves.toEqual(history)
  })

  it('returns empty map if getCacheFromStorage does not exist', async () => {
    const runtimeCache = new Map()
    const runtimeCacheKey = 'BTC-USD-day'
    const history = new Map()

    await expect(
      tryToLoadCache({
        runtimeCacheKey,
        runtimeCache,
      })
    ).resolves.toEqual(history)
  })
})
