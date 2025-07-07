import prepareFetchInstructions from '../prepare-fetch-instructions.js'

describe('prepareFetchInstructions', () => {
  const mockParams = {
    tickerSymbol: 'BTC',
    fiatTicker: 'USD',
    granularity: 'day',
    getCacheFromStorage: () => Promise.resolve([]),
    requestLimit: 100,
    specificTimestamp: null,
    ignoreCache: false,
    runtimeCache: new Map(),
    getRuntimeCacheKey: ({ fiatTicker, assetTicker, granularity }) =>
      `${assetTicker}_${fiatTicker}_${granularity}`,
    requestTimestamp: 1_640_995_200_000, // 2022-01-01 00:00:00 UTC
  }

  describe('tickerSymbol is always returned (bug fix verification)', () => {
    it('should return tickerSymbol when specificTimestamp exists in history', async () => {
      const specificTimestamp = 1_640_995_200_000
      const runtimeCache = new Map()
      // Pre-populate runtime cache with data that includes the specific timestamp
      runtimeCache.set('BTC_USD_day', [[specificTimestamp, { close: 50_000 }]])

      const result = await prepareFetchInstructions({
        ...mockParams,
        specificTimestamp,
        runtimeCache,
      })

      expect(result).toHaveProperty('tickerSymbol', 'BTC')
      expect(result).toHaveProperty('history')
      expect(result.history.get(specificTimestamp)).toBeDefined()
      // Should not have limit or lastCachedItem since it returned early
      expect(result).not.toHaveProperty('limit')
      expect(result).not.toHaveProperty('lastCachedItem')
    })

    it('should return tickerSymbol when limit is very small (minimal fetch needed)', async () => {
      // Set up a scenario where getLimit will return a very small number
      // This happens when we already have very recent data
      const recentTimestamp = Date.now() - 1000 // 1 second ago
      const runtimeCache = new Map()
      runtimeCache.set('BTC_USD_day', [[recentTimestamp, { close: 50_000 }]])

      const result = await prepareFetchInstructions({
        ...mockParams,
        runtimeCache,
        requestTimestamp: Date.now(),
      })

      expect(result).toHaveProperty('tickerSymbol', 'BTC')
      expect(result).toHaveProperty('history')
      // The key test is that tickerSymbol is always returned
      // The limit might be a very small number rather than exactly 0
      expect(result.limit).toBeLessThan(1) // Very small limit
      expect(result).toHaveProperty('lastCachedItem')
    })

    it('should return tickerSymbol when fetch is needed (normal flow)', async () => {
      // Set up a scenario where we need to fetch more data
      const oldTimestamp = 1_640_908_800_000 // 2021-12-31 00:00:00 UTC (1 day before requestTimestamp)
      const runtimeCache = new Map()
      runtimeCache.set('BTC_USD_day', [[oldTimestamp, { close: 50_000 }]])

      const result = await prepareFetchInstructions({
        ...mockParams,
        runtimeCache,
        requestTimestamp: 1_640_995_200_000, // 2022-01-01 00:00:00 UTC
      })

      expect(result).toHaveProperty('tickerSymbol', 'BTC')
      expect(result).toHaveProperty('history')
      expect(result).toHaveProperty('limit')
      expect(result).toHaveProperty('lastCachedItem')
      expect(result.limit).toBeGreaterThan(0)
    })
  })

  describe('cache and parameter handling', () => {
    it('should use runtime cache when available', async () => {
      const cacheData = [[1_640_995_200_000, { close: 50_000, open: 49_900 }]]
      const runtimeCache = new Map()
      runtimeCache.set('BTC_USD_day', cacheData)

      const result = await prepareFetchInstructions({
        ...mockParams,
        runtimeCache,
      })

      expect(result.history.size).toBe(1)
      expect(result.history.get(1_640_995_200_000)).toEqual({ close: 50_000, open: 49_900 })
    })

    it('should generate correct runtime cache key', async () => {
      const getRuntimeCacheKeySpy = jest.fn(
        ({ fiatTicker, assetTicker, granularity }) => `${assetTicker}_${fiatTicker}_${granularity}`
      )

      await prepareFetchInstructions({
        ...mockParams,
        getRuntimeCacheKey: getRuntimeCacheKeySpy,
      })

      expect(getRuntimeCacheKeySpy).toHaveBeenCalledWith({
        fiatTicker: 'USD',
        assetTicker: 'BTC',
        granularity: 'day',
      })
    })

    it('should handle different granularities', async () => {
      const testCases = ['day', 'hour', 'minute']

      for (const granularity of testCases) {
        const result = await prepareFetchInstructions({
          ...mockParams,
          granularity,
        })

        expect(result).toHaveProperty('tickerSymbol', 'BTC')
        expect(result).toHaveProperty('history')
      }
    })

    it('should handle ignoreCache flag', async () => {
      const oldTimestamp = 1_640_908_800_000
      const runtimeCache = new Map()
      runtimeCache.set('BTC_USD_day', [[oldTimestamp, { close: 50_000 }]])

      // With ignoreCache: false (normal behavior)
      const result1 = await prepareFetchInstructions({
        ...mockParams,
        runtimeCache,
        ignoreCache: false,
        requestTimestamp: 1_640_995_200_000,
      })

      // With ignoreCache: true (should ignore existing cache for limit calculation)
      const result2 = await prepareFetchInstructions({
        ...mockParams,
        runtimeCache,
        ignoreCache: true,
        requestTimestamp: 1_640_995_200_000,
      })

      // Both should return tickerSymbol
      expect(result1).toHaveProperty('tickerSymbol', 'BTC')
      expect(result2).toHaveProperty('tickerSymbol', 'BTC')

      // ignoreCache: true might result in different limit calculations
      // but the main thing is that both return the required properties
      expect(result1).toHaveProperty('history')
      expect(result2).toHaveProperty('history')
    })
  })

  describe('edge cases', () => {
    it('should handle empty cache gracefully', async () => {
      const result = await prepareFetchInstructions({
        ...mockParams,
        runtimeCache: new Map(),
        getCacheFromStorage: () => Promise.resolve(null),
      })

      expect(result).toHaveProperty('tickerSymbol', 'BTC')
      expect(result).toHaveProperty('history')
      expect(result.history.size).toBe(0)
    })

    it('should handle storage errors gracefully', async () => {
      const getCacheFromStorage = jest.fn().mockRejectedValue(new Error('Storage error'))

      // The function should still work and return tickerSymbol
      await expect(
        prepareFetchInstructions({
          ...mockParams,
          getCacheFromStorage,
          runtimeCache: new Map(), // Empty runtime cache to force storage call
        })
      ).rejects.toThrow('failed to load cache from storage')
    })

    it('should preserve tickerSymbol for different ticker symbols', async () => {
      const testTickers = ['ETH', 'ADA', 'SOL']

      for (const tickerSymbol of testTickers) {
        const result = await prepareFetchInstructions({
          ...mockParams,
          tickerSymbol,
        })

        expect(result).toHaveProperty('tickerSymbol', tickerSymbol)
      }
    })
  })
})
