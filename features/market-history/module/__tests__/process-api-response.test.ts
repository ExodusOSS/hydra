import processApiResponse from '../process-api-response.js'

describe('processApiResponse', () => {
  const baseParams = {
    fiatTicker: 'USD',
    ignoreInvalidSymbols: true,
    lastCachedItemByTicker: new Map(),
  }

  it('crops minute history to requestLimit', () => {
    const baseTime = 1_700_000_000
    const existingHistory = new Map<number, { close: number }>()
    for (let i = 0; i < 200; i++) {
      existingHistory.set((baseTime + i * 60) * 1000, { close: 100 + i })
    }

    const historicalPricesMap = new Map([['BTC', existingHistory]])

    const newEntries = Array.from({ length: 10 }, (_, i) => ({
      time: baseTime + (200 + i) * 60,
      close: 300 + i,
      open: 300 + i,
    }))

    const result = processApiResponse({
      ...baseParams,
      assetTicker: 'BTC',
      fetchedPrices: { BTC: { USD: newEntries } },
      historicalPricesMap,
      granularity: 'minute',
      requestLimit: 120,
    })

    expect(result).not.toBeNull()
    expect(result!.size).toBe(120)
  })

  it('crops hourly history to requestLimit', () => {
    const baseTime = 1_700_000_000
    const existingHistory = new Map<number, { close: number }>()
    for (let i = 0; i < 200; i++) {
      existingHistory.set((baseTime + i * 3600) * 1000, { close: 100 + i })
    }

    const historicalPricesMap = new Map([['BTC', existingHistory]])

    const newEntries = Array.from({ length: 5 }, (_, i) => ({
      time: baseTime + (200 + i) * 3600,
      close: 300 + i,
      open: 300 + i,
    }))

    const result = processApiResponse({
      ...baseParams,
      assetTicker: 'BTC',
      fetchedPrices: { BTC: { USD: newEntries } },
      historicalPricesMap,
      granularity: 'hour',
      requestLimit: 168,
    })

    expect(result).not.toBeNull()
    expect(result!.size).toBe(168)
  })

  it('does not crop daily history', () => {
    const baseTime = 1_700_000_000
    const historicalPricesMap = new Map<string, Map<number, { close: number }>>()

    const newEntries = Array.from({ length: 500 }, (_, i) => ({
      time: baseTime + i * 86_400,
      close: 100 + i,
      open: 100 + i,
    }))

    const result = processApiResponse({
      ...baseParams,
      assetTicker: 'BTC',
      fetchedPrices: { BTC: { USD: newEntries } },
      historicalPricesMap,
      granularity: 'day',
      requestLimit: 3000,
    })

    expect(result).not.toBeNull()
    expect(result!.size).toBe(500)
  })
})
