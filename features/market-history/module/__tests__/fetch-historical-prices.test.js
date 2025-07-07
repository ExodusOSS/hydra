import fetchHistoricalPrices from '../fetch-historical-prices.js'

const now = Date.now()
const day = 24 * 60 * 60 * 1000
const hour = 60 * 60 * 1000

describe('fetchHistoricalPrices', () => {
  it('returns fetched data + cached items', async () => {
    const api = () => {
      return {
        BTC: {
          USD: [
            { time: (now - 2 * day) / 1000, close: 10, open: 9 },
            { time: (now - day) / 1000, close: 11, open: 10 },
          ],
        },
      }
    }

    const assetTickers = ['BTC']
    const fiatTicker = 'USD'
    const granularity = 'day'
    const cache = {
      BTC: [[now - 3 * day, { close: 9 }]],
    }
    const getCacheFromStorage = (assetTicker) => {
      return cache[assetTicker]
    }

    const runtimeCache = new Map()

    const { historicalPricesMap } = await fetchHistoricalPrices({
      api,
      assetTickers,
      fiatTicker,
      granularity,
      getCacheFromStorage,
      runtimeCache,
      getCurrentTime: () => now,
    })

    const btcHistory = historicalPricesMap.get('BTC')
    const sortedHistory = [...btcHistory].sort((a, b) => a[0] - b[0])

    expect(sortedHistory.length).toBe(3)
  })

  it('works with unsorted cache', async () => {
    const api = () => {
      return {
        BTC: {
          USD: [
            { time: (now - 2 * day) / 1000, close: 12, open: 11 },
            { time: (now - day) / 1000, close: 13, open: 12 },
          ],
        },
      }
    }

    const assetTickers = ['BTC']
    const fiatTicker = 'USD'
    const granularity = 'day'
    const cache = {
      BTC: [
        [now - 10 * day + hour, { close: 11 }],
        [now - 11 * day, { close: 9 }],
        [now - 10 * day, { close: 10 }],
      ],
    }
    const getCacheFromStorage = (assetTicker) => {
      return cache[assetTicker]
    }

    const runtimeCache = new Map()

    const { historicalPricesMap } = await fetchHistoricalPrices({
      api,
      assetTickers,
      fiatTicker,
      granularity,
      getCacheFromStorage,
      runtimeCache,
      getCurrentTime: () => now,
    })

    const btcHistory = historicalPricesMap.get('BTC')
    const sortedHistory = [...btcHistory].sort((a, b) => a[0] - b[0])

    expect(sortedHistory.length).toBe(5)
  })

  it('handles multiple asset tickers', async () => {
    const api = () => ({
      BTC: { USD: [{ time: (now - day) / 1000, close: 10, open: 9 }] },
      ETH: { USD: [{ time: (now - day) / 1000, close: 20, open: 19 }] },
    })
    const assetTickers = ['BTC', 'ETH']
    const fiatTicker = 'USD'
    const granularity = 'day'
    const getCacheFromStorage = (ticker) =>
      ticker === 'BTC' ? [[now - 2 * day, { close: 9 }]] : [[now - 2 * day, { close: 19 }]]
    const runtimeCache = new Map()
    const { historicalPricesMap } = await fetchHistoricalPrices({
      api,
      assetTickers,
      fiatTicker,
      granularity,
      getCacheFromStorage,
      runtimeCache,
      getCurrentTime: () => now,
    })
    expect([...historicalPricesMap.get('BTC')].length).toBe(2)
    expect([...historicalPricesMap.get('ETH')].length).toBe(2)
  })

  it('supports different granularities', async () => {
    const api = () => ({
      BTC: { USD: [{ time: (now - hour) / 1000, close: 15, open: 14 }] },
    })
    const getCacheFromStorage = () => [[now - 2 * hour, { close: 14 }]]
    const runtimeCache = new Map()
    const { historicalPricesMap } = await fetchHistoricalPrices({
      api,
      assetTickers: ['BTC'],
      fiatTicker: 'USD',
      granularity: 'hour',
      getCacheFromStorage,
      runtimeCache,
      getCurrentTime: () => now,
    })
    expect([...historicalPricesMap.get('BTC')].length).toBe(2)
  })

  it('fetches all when cache is empty', async () => {
    const api = () => ({
      BTC: { USD: [{ time: now / 1000, close: 30, open: 29 }] },
    })
    const getCacheFromStorage = () => []
    const runtimeCache = new Map()
    const { historicalPricesMap } = await fetchHistoricalPrices({
      api,
      assetTickers: ['BTC'],
      fiatTicker: 'USD',
      granularity: 'day',
      getCacheFromStorage,
      runtimeCache,
      getCurrentTime: () => now,
    })
    expect([...historicalPricesMap.get('BTC')].length).toBe(1)
  })

  it('fetches for a specific timestamp', async () => {
    let called = false
    const api = ({ timestamp }) => {
      called = true
      expect(timestamp).toBeTruthy()
      return { BTC: { USD: [{ time: now / 1000, close: 40, open: 39 }] } }
    }

    const getCacheFromStorage = () => []
    const runtimeCache = new Map()
    await fetchHistoricalPrices({
      api,
      assetTickers: ['BTC'],
      fiatTicker: 'USD',
      granularity: 'day',
      getCacheFromStorage,
      timestamp: now,
      runtimeCache,
      // No getCurrentTime needed, since timestamp is provided
    })
    expect(called).toBe(true)
    expect(runtimeCache.size).toBeGreaterThan(0)
  })

  it('respects requestLimit', async () => {
    let receivedLimit
    const api = ({ limit }) => {
      receivedLimit = limit
      return { BTC: { USD: [{ time: now / 1000, close: 50, open: 49 }] } }
    }

    const getCacheFromStorage = () => [[now - 10 * hour, { close: 48 }]]
    const runtimeCache = new Map()
    await fetchHistoricalPrices({
      api,
      assetTickers: ['BTC'],
      fiatTicker: 'USD',
      granularity: 'hour',
      getCacheFromStorage,
      requestLimit: 5,
      runtimeCache,
      getCurrentTime: () => now,
    })
    expect(receivedLimit).toBe(5)
  })

  it('filters out invalid prices', async () => {
    const api = () => ({
      BTC: {
        USD: [
          { time: (now - day) / 1000, close: 0, open: 58 },
          { time: now / 1000, close: 60, open: 59 },
        ],
      },
    })
    const getCacheFromStorage = () => [[now - 2 * day, { close: 59 }]]
    const runtimeCache = new Map()
    const { historicalPricesMap } = await fetchHistoricalPrices({
      api,
      assetTickers: ['BTC'],
      fiatTicker: 'USD',
      granularity: 'day',
      getCacheFromStorage,
      runtimeCache,
      getCurrentTime: () => now,
    })
    expect([...historicalPricesMap.get('BTC')].length).toBe(1)
  })

  it('ignores cache when ignoreCache is true', async () => {
    let called = false
    const api = () => {
      called = true
      return { BTC: { USD: [{ time: now / 1000, close: 70, open: 69 }] } }
    }

    const getCacheFromStorage = () => [[now - day, { close: 69 }]]
    const runtimeCache = new Map()
    const { historicalPricesMap } = await fetchHistoricalPrices({
      api,
      assetTickers: ['BTC'],
      fiatTicker: 'USD',
      granularity: 'day',
      getCacheFromStorage,
      ignoreCache: true,
      runtimeCache,
      getCurrentTime: () => now,
    })
    expect(called).toBe(true)
    const btcHistory = historicalPricesMap.get('BTC')
    const sortedHistory = [...btcHistory].sort((a, b) => a[0] - b[0])
    expect(sortedHistory.length).toBe(2)
    expect([...runtimeCache]).toEqual([
      [
        'BTC_USD_day',
        [
          [
            now - day,
            {
              close: 69,
            },
          ],
          [
            now,
            {
              close: 70,
            },
          ],
        ],
      ],
    ])
  })

  it('handles API errors and invalid symbols', async () => {
    const api = () => ({
      requestErrors: { someError: 'error message', invalidCryptoSymbols: ['XXX'] },
      BTC: { USD: [{ time: now / 1000, close: 80, open: 79 }] },
    })
    const getCacheFromStorage = () => []
    const runtimeCache = new Map()
    const { historicalPricesMap } = await fetchHistoricalPrices({
      api,
      assetTickers: ['BTC', 'XXX'],
      fiatTicker: 'USD',
      granularity: 'hour',
      getCacheFromStorage,
      runtimeCache,
      ignoreInvalidSymbols: true,
      // No getCurrentTime needed as it does not affect this test's logic
    })
    expect(historicalPricesMap.get('BTC').size).toBeGreaterThan(0)
    expect(historicalPricesMap.get('XXX').size).toBe(0)
  })

  it('updates runtimeCache', async () => {
    const getRuntimeCacheKeyDefault = ({ fiatTicker, assetTicker, granularity }) =>
      `${assetTicker}_${fiatTicker}_${granularity}`

    const api = () => ({
      BTC: { USD: [{ time: now / 1000, close: 90, open: 89 }] },
    })
    const runtimeCache = new Map()
    const getCacheFromStorage = () => []

    const cacheKey = getRuntimeCacheKeyDefault({
      fiatTicker: 'USD',
      assetTicker: 'BTC',
      granularity: 'day',
    })

    await fetchHistoricalPrices({
      api,
      assetTickers: ['BTC'],
      fiatTicker: 'USD',
      granularity: 'day',
      getCacheFromStorage,
      runtimeCache,
      getCurrentTime: () => now,
    })
    expect(runtimeCache.has(cacheKey)).toBe(true)
  })
})
