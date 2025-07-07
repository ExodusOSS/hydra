import tryToLoadCache from '../try-to-load-cache.js'

describe('tryToLoadCache', () => {
  it('returns runtime cache if it exists', async () => {
    const runtimeCache = new Map()
    const runtimeCacheKey = 'BTC-USD-day'
    const history = new Map([[1, { close: 1, high: 2 }]])
    runtimeCache.set(runtimeCacheKey, history)
    const getCacheFromStorage = () => null

    await expect(
      tryToLoadCache({
        runtimeCacheKey,
        runtimeCache,
        getCacheFromStorage,
      })
    ).resolves.toEqual(history)
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
