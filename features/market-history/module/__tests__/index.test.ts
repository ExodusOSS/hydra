import { mock } from 'node:test'

import { connectAssets } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import { createAtomMock, createInMemoryAtom } from '@exodus/atoms'
import logger from '@exodus/logger'
import createStorage from '@exodus/storage-memory'
import { SynchronizedTime } from '@exodus/synchronized-time'

const fetchHistoricalPricesModule = await import('../fetch-historical-prices.js')
const originalFetchHistoricalPrices = fetchHistoricalPricesModule.default
const fetchHistoricalPricesSpy = jest.fn(originalFetchHistoricalPrices)
mock.module(import.meta.resolve('../fetch-historical-prices.js'), {
  defaultExport: fetchHistoricalPricesSpy,
})

let fetchHistoricalPrices
let marketHistoryMonitorDefinition

beforeAll(async () => {
  fetchHistoricalPrices = fetchHistoricalPricesSpy
  const marketHistoryMonitorModule = await import('../index.js')
  marketHistoryMonitorDefinition = marketHistoryMonitorModule.default
})

const assets = connectAssets(assetsBase)

const advance = (ms = 0) => jest.advanceTimersByTimeAsync(ms)

describe('market history monitor', () => {
  let storage
  let marketHistoryMonitor
  let assetsAtom
  let currencyAtom
  let marketHistoryStorage
  let pricingClient
  let store
  let enabledAssetsAtom
  let marketHistoryAtom
  const createAssetsAtom = () =>
    createInMemoryAtom({
      defaultValue: {
        value: {
          bitcoin: assets.bitcoin,
          ethereum: assets.ethereum,
          algorand: assets.algorand,
        },
      },
    })

  let prices = {}

  afterEach(() => {
    jest.clearAllMocks()
  })

  const resetStorage = () => {
    store = new Map()
    storage = createStorage({ store })
    marketHistoryStorage = storage.namespace('marketHistory')
  }

  const createMonitor = (args = {}) => {
    return marketHistoryMonitorDefinition.factory({
      assetsAtom,
      currencyAtom,
      storage: marketHistoryStorage,
      pricingClient,
      enabledAssetsAtom,
      marketHistoryAtom,
      config: {
        granularityRequestLimits: {
          day: 366,
          hour: 168,
          minute: 120,
        },
      },
      synchronizedTime: SynchronizedTime,
      logger: logger('market-history'),
      ...args,
    })
  }

  // oxlint-disable-next-line jest/prefer-hooks-in-order -- pre-existing: beforeEach declared after afterEach
  beforeEach(() => {
    jest.useFakeTimers()
    enabledAssetsAtom = createAtomMock({
      defaultValue: {
        bitcoin: true,
        ethereum: true,
      },
    })
    marketHistoryAtom = createInMemoryAtom({})
    currencyAtom = createAtomMock({
      defaultValue: 'USD',
    })
    resetStorage()
    assetsAtom = createAssetsAtom()
    prices = {
      day: {
        BTC: {
          USD: [
            { close: 9000, open: 8999, time: 1_651_190_400 },
            { close: 90_000, open: 89_900, time: 1_651_276_800 },
          ],
          EUR: [
            { close: 8000, open: 7999, time: 1_651_190_400 },
            { close: 80_000, open: 79_900, time: 1_651_276_800 },
          ],
        },
        ETH: {
          USD: [
            { close: 1500, open: 1499, time: 1_651_190_400 },
            { close: 1600, open: 1599, time: 1_651_276_800 },
          ],
          EUR: [
            { close: 1400, open: 1399, time: 1_651_190_400 },
            { close: 1500, open: 1499, time: 1_651_276_800 },
          ],
        },
        ALGO: {
          USD: [
            { close: 2, open: 1, time: 1_651_190_400 },
            { close: 2.5, open: 1.5, time: 1_651_276_800 },
          ],
          EUR: [
            { close: 1.8, open: 0.9, time: 1_651_190_400 },
            { close: 2.3, open: 1.3, time: 1_651_276_800 },
          ],
        },
      },
      hour: {
        BTC: {
          USD: [
            { close: 9000, open: 8999, time: 1_663_668_000 },
            { close: 90_000, open: 89_900, time: 1_663_671_600 },
          ],
          EUR: [
            { close: 8000, open: 7999, time: 1_663_668_000 },
            { close: 80_000, open: 79_900, time: 1_663_671_600 },
          ],
        },
        ETH: {
          USD: [
            { close: 1500, open: 1499, time: 1_663_668_000 },
            { close: 1600, open: 1599, time: 1_663_671_600 },
          ],
          EUR: [
            { close: 1400, open: 1399, time: 1_663_668_000 },
            { close: 1500, open: 1499, time: 1_663_671_600 },
          ],
        },
        ALGO: {
          USD: [
            { close: 1.9, open: 0.9, time: 1_663_668_000 },
            { close: 2.2, open: 1.2, time: 1_663_671_600 },
          ],
          EUR: [
            { close: 1.7, open: 0.8, time: 1_663_668_000 },
            { close: 2, open: 1.1, time: 1_663_671_600 },
          ],
        },
      },
      minute: {
        BTC: {
          USD: [
            { close: 9000, open: 8999, time: 1_744_219_700 },
            { close: 90_000, open: 89_900, time: 1_744_219_760 },
          ],
          EUR: [
            { close: 8000, open: 7999, time: 1_744_219_700 },
            { close: 80_000, open: 79_900, time: 1_744_219_760 },
          ],
        },
        ETH: {
          USD: [
            { close: 1500, open: 1499, time: 1_744_219_700 },
            { close: 1600, open: 1599, time: 1_744_219_760 },
          ],
          EUR: [
            { close: 1400, open: 1399, time: 1_744_219_700 },
            { close: 1500, open: 1499, time: 1_744_219_760 },
          ],
        },
        ALGO: {
          USD: [
            { close: 1.8, open: 0.8, time: 1_744_219_700 },
            { close: 2.1, open: 1.1, time: 1_744_219_760 },
          ],
          EUR: [
            { close: 1.6, open: 0.7, time: 1_744_219_700 },
            { close: 1.9, open: 0.9, time: 1_744_219_760 },
          ],
        },
      },
    }
    pricingClient = {
      historicalPrice: jest.fn(
        ({
          assets,
          fiatArray,
          granularity,
          limit: _limit,
          timestamp,
          ignoreInvalidSymbols: _ignoreInvalidSymbols,
        }) => {
          const defaultTimestamp = timestamp || Math.floor(Date.now() / 1000)

          const response = {}
          assets.forEach((asset) => {
            response[asset] = {}
            const fiat = fiatArray?.[0] || 'USD'
            response[asset][fiat] = prices[granularity]?.[asset]?.[fiat] || []

            if (response[asset][fiat].length === 0) {
              response[asset][fiat] = [{ close: 0, open: 0, time: defaultTimestamp }]
            }
          })

          response.requestErrors = {}

          return response
        }
      ),
    }

    marketHistoryMonitor = createMonitor()
  })

  const setupAtomListener = async () => {
    const listener = jest.fn()
    marketHistoryAtom.observe(listener)
    await advance()
    expect(listener).toHaveBeenCalledTimes(0)
    listener.mockClear()
    return listener
  }

  describe('hydrate', () => {
    it('should populate atom from cached storage without network fetch', async () => {
      await marketHistoryStorage.batchSet({
        'prices-USD-bitcoin-day': [
          [1_651_190_400_000, { close: 9000 }],
          [1_651_276_800_000, { close: 90_000 }],
        ],
        'prices-USD-bitcoin-hour': [[1_663_668_000_000, { close: 9000 }]],
        'prices-USD-ethereum-day': [[1_651_190_400_000, { close: 1500 }]],
      })
      await marketHistoryStorage.set('cached-assets-USD', ['bitcoin', 'ethereum'])

      await marketHistoryMonitor.hydrate()

      expect(pricingClient.historicalPrice).not.toHaveBeenCalled()
      expect(await marketHistoryAtom.get()).toEqual({
        data: {
          USD: {
            daily: {
              bitcoin: new Map([
                [1_651_190_400_000, 9000],
                [1_651_276_800_000, 90_000],
              ]),
              ethereum: new Map([[1_651_190_400_000, 1500]]),
            },
            hourly: {
              bitcoin: new Map([[1_663_668_000_000, 9000]]),
            },
            minutely: {},
          },
        },
      })
    })

    it('should be a no-op when storage cache is empty', async () => {
      const listener = jest.fn()
      marketHistoryAtom.observe(listener)

      await marketHistoryMonitor.hydrate()

      expect(pricingClient.historicalPrice).not.toHaveBeenCalled()
      expect(listener).not.toHaveBeenCalled()
    })

    it('should not overwrite atom for the same currency on subsequent hydrate calls', async () => {
      await marketHistoryStorage.batchSet({
        'prices-USD-bitcoin-day': [[1_651_190_400_000, { close: 9000 }]],
      })
      await marketHistoryStorage.set('cached-assets-USD', ['bitcoin'])
      await marketHistoryMonitor.hydrate()

      await marketHistoryStorage.batchSet({
        'prices-USD-bitcoin-day': [[1_651_190_400_000, { close: 1 }]],
      })
      await marketHistoryMonitor.hydrate()

      expect(await marketHistoryAtom.get()).toEqual({
        data: {
          USD: {
            daily: { bitcoin: new Map([[1_651_190_400_000, 9000]]) },
            hourly: {},
            minutely: {},
          },
        },
      })
    })

    it('should memoize concurrent hydrate calls', async () => {
      await marketHistoryStorage.batchSet({
        'prices-USD-bitcoin-day': [[1_651_190_400_000, { close: 9000 }]],
      })
      await marketHistoryStorage.set('cached-assets-USD', ['bitcoin'])
      const batchGetSpy = jest.spyOn(marketHistoryStorage, 'batchGet')

      await Promise.all([marketHistoryMonitor.hydrate(), marketHistoryMonitor.hydrate()])
      await marketHistoryMonitor.hydrate()

      expect(batchGetSpy).toHaveBeenCalledTimes(1)
    })

    it('cached-assets index should not lose names under concurrent setCache writes', async () => {
      // Force each granularity to write disjoint assets so the parallel get -> mutate -> set
      // sequence in #extendCacheIndex would lose names without serialization.
      prices.day = {
        BTC: { USD: [{ close: 9000, open: 8999, time: 1_651_190_400 }] },
      }
      prices.hour = {
        ETH: { USD: [{ close: 1500, open: 1499, time: 1_663_668_000 }] },
      }
      prices.minute = {}

      jest.useFakeTimers({ doNotFake: ['setImmediate'] })
      jest.setSystemTime(new Date('2025-01-01'))

      await marketHistoryMonitor.start()
      await advance()

      const indexed = (await marketHistoryStorage.get('cached-assets-USD')) as string[]
      expect([...indexed].sort((a, b) => a.localeCompare(b))).toEqual(['bitcoin', 'ethereum'])
    })

    it('setCache should maintain the cached-assets index per currency', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })
      jest.setSystemTime(new Date('2025-01-01'))

      await marketHistoryMonitor.start()
      await advance()

      const indexed = await marketHistoryStorage.get('cached-assets-USD')
      expect(indexed).toEqual(expect.arrayContaining(['bitcoin', 'ethereum']))

      // Fresh monitor (simulates a new app session) hydrates from the index seeded by start()
      const freshAtom = createInMemoryAtom({})
      const freshMonitor = createMonitor({ marketHistoryAtom: freshAtom })
      await freshMonitor.hydrate()

      const hydrated = (await freshAtom.get()) as {
        data: { USD: { daily: Record<string, unknown> } }
      }
      expect(Object.keys(hydrated.data.USD.daily).sort((a, b) => a.localeCompare(b))).toEqual([
        'bitcoin',
        'ethereum',
      ])
    })

    it('start should await hydrate so cached prices land before network fetch', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })
      jest.setSystemTime(new Date('2025-01-01'))

      await marketHistoryStorage.batchSet({
        'prices-USD-bitcoin-day': [[1_651_190_400_000, { close: 1234 }]],
      })
      await marketHistoryStorage.set('cached-assets-USD', ['bitcoin'])

      const sets: unknown[] = []
      marketHistoryAtom.observe((value) => sets.push(value))

      await marketHistoryMonitor.start()
      await advance()

      expect(sets[0]).toEqual({
        data: {
          USD: {
            daily: { bitcoin: new Map([[1_651_190_400_000, 1234]]) },
            hourly: {},
            minutely: {},
          },
        },
      })
    })
  })

  it('should store prices in atom on start', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    jest.setSystemTime(new Date('2025-01-01'))

    const listener = await setupAtomListener()
    const assertListener = () => {
      expect(listener).toHaveBeenCalledTimes(2)
      expect(listener.mock.calls[0][0]).toEqual({
        data: {
          USD: {
            daily: {},
            hourly: {},
            minutely: {},
          },
        },
      })
      expect(listener.mock.calls[1][0]).toEqual({
        data: {
          USD: {
            daily: {
              bitcoin: new Map([
                [1_651_190_400_000, 9000],
                [1_651_276_800_000, 90_000],
              ]),
              ethereum: new Map([
                [1_651_190_400_000, 1500],
                [1_651_276_800_000, 1600],
              ]),
            },
            hourly: {
              bitcoin: new Map([
                [1_663_668_000_000, 9000],
                [1_663_671_600_000, 90_000],
              ]),
              ethereum: new Map([
                [1_663_668_000_000, 1500],
                [1_663_671_600_000, 1600],
              ]),
            },
            minutely: {
              bitcoin: new Map([
                [1_744_219_700_000, 9000],
                [1_744_219_760_000, 90_000],
              ]),
              ethereum: new Map([
                [1_744_219_700_000, 1500],
                [1_744_219_760_000, 1600],
              ]),
            },
          },
        },
      })
    }

    await marketHistoryMonitor.start()
    await advance()

    assertListener()

    await marketHistoryMonitor.start()
    await advance()
    expect(listener).toHaveBeenCalledTimes(2)
    expect(store).toMatchSnapshot()
  })

  it('should stop and restart with prices re-fetch', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    jest.setSystemTime(new Date('2025-01-01'))

    const listener = await setupAtomListener()

    await marketHistoryMonitor.start()
    await advance()
    expect(listener).toHaveBeenCalledTimes(2)
    expect(store).toMatchSnapshot()

    await marketHistoryMonitor.stop()
    await marketHistoryMonitor.start()
    await advance()
    // note: we see increase only because test setup in the way cache doesn't work, so it treats prices during updateAll as new data
    // the main thing we test here is that updateAll is called
    expect(listener).toHaveBeenCalledTimes(3)

    await marketHistoryMonitor.stop()
    await marketHistoryMonitor.start()
    await advance()
    expect(listener).toHaveBeenCalledTimes(4)
  })

  it('should fetch prices when update called', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    jest.setSystemTime(new Date('2025-01-01'))

    const listener = await setupAtomListener()
    marketHistoryMonitor.start()

    await advance()

    const listenerExpectedData = {
      data: {
        USD: {
          daily: {
            bitcoin: new Map([
              [1_651_190_400_000, 9000],
              [1_651_276_800_000, 90_000],
            ]),
            ethereum: new Map([
              [1_651_190_400_000, 1500],
              [1_651_276_800_000, 1600],
            ]),
          },
          hourly: {
            bitcoin: new Map([
              [1_663_668_000_000, 9000],
              [1_663_671_600_000, 90_000],
            ]),
            ethereum: new Map([
              [1_663_668_000_000, 1500],
              [1_663_671_600_000, 1600],
            ]),
          },
          minutely: {
            bitcoin: new Map([
              [1_744_219_700_000, 9000],
              [1_744_219_760_000, 90_000],
            ]),
            ethereum: new Map([
              [1_744_219_700_000, 1500],
              [1_744_219_760_000, 1600],
            ]),
          },
        },
      },
    }

    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener.mock.calls[1][0]).toEqual(listenerExpectedData)

    listener.mockClear()
    pricingClient.historicalPrice.mockClear()

    await marketHistoryMonitor.update('hour')
    await advance()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0]).toEqual(listenerExpectedData)
    expect(pricingClient.historicalPrice).toHaveBeenCalledTimes(1)
  })

  describe('fetchAssets', () => {
    it('should throw when called before module started', async () => {
      const errorTracking = { track: jest.fn() }
      marketHistoryMonitor = createMonitor({ errorTracking })

      await expect(marketHistoryMonitor.fetchAssets(['algorand'])).rejects.toThrow(
        'market-history fetchAssets cannot be called before module started'
      )
      expect(errorTracking.track).toHaveBeenCalledWith(
        expect.objectContaining({ context: { method: 'fetchAssets' } })
      )
    })

    it('should fetch market history for a non-enabled asset', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })
      jest.setSystemTime(new Date('2025-01-01'))

      await marketHistoryMonitor.start()
      await advance()

      expect(await enabledAssetsAtom.get()).toEqual({ bitcoin: true, ethereum: true })

      const listener = jest.fn()
      marketHistoryAtom.observe(listener)
      await advance()
      listener.mockClear()
      pricingClient.historicalPrice.mockClear()

      await marketHistoryMonitor.fetchAssets(['algorand'])
      await advance()

      expect(pricingClient.historicalPrice).toHaveBeenCalled()
      const marketHistory = await marketHistoryAtom.get()
      const atomData = marketHistory.data.USD
      expect(atomData.daily.algorand).toEqual(
        new Map([
          [1_651_190_400_000, 2],
          [1_651_276_800_000, 2.5],
        ])
      )
      expect(atomData.hourly.algorand).toBeDefined()
      expect(atomData.minutely.algorand).toBeDefined()
      expect(await enabledAssetsAtom.get()).toEqual({ bitcoin: true, ethereum: true })
    })

    it('should fetch only requested granularities', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })
      jest.setSystemTime(new Date('2025-01-01'))

      await marketHistoryMonitor.start()
      await advance()
      pricingClient.historicalPrice.mockClear()

      await marketHistoryMonitor.fetchAssets(['algorand'], ['day'])
      await advance()

      expect(pricingClient.historicalPrice).toHaveBeenCalledTimes(1)
      expect(pricingClient.historicalPrice.mock.calls[0][0].granularity).toBe('day')
    })
  })

  it('should ignore cache when called for the first time and not ignore cache if refresh interval not finished yet on next update call', async () => {
    const remoteConfigRefreshIntervalAtom = createInMemoryAtom({
      defaultValue: 10_000,
    })
    marketHistoryMonitor = createMonitor({
      remoteConfigRefreshIntervalAtom,
    })

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    jest.setSystemTime(new Date('2025-01-01'))

    const listener = await setupAtomListener()
    await marketHistoryMonitor.start()

    await advance()

    expect(listener).toHaveBeenCalledTimes(2)
    listener.mockClear()
    const fetcher1 = fetchHistoricalPrices
    expect(fetcher1.mock.calls[0][0].ignoreCache).toEqual(true)
    expect(fetcher1.mock.calls[1][0].ignoreCache).toEqual(true)
    fetchHistoricalPrices.mockClear()
    pricingClient.historicalPrice.mockClear()

    await marketHistoryMonitor.update('hour')
    await advance()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(pricingClient.historicalPrice).toHaveBeenCalledTimes(1)
    const fetcher2 = fetchHistoricalPrices
    expect(fetcher2.mock.calls[0][0].ignoreCache).toEqual(false)
  })

  it('should ignore cache when called for the first time and ignore cache if refresh interval finished already', async () => {
    const remoteConfigRefreshIntervalAtom = createInMemoryAtom({
      defaultValue: 10_000,
    })
    marketHistoryMonitor = createMonitor({
      remoteConfigRefreshIntervalAtom,
    })

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    jest.setSystemTime(new Date('2025-01-01'))

    await setupAtomListener()
    marketHistoryMonitor.start()

    await advance()

    // Ignore cache at first call
    const fetcher1 = fetchHistoricalPrices
    expect(fetcher1.mock.calls[0][0].ignoreCache).toEqual(true)
    expect(fetcher1.mock.calls[1][0].ignoreCache).toEqual(true)
    fetchHistoricalPrices.mockClear()
    pricingClient.historicalPrice.mockClear()

    // Wait for longer than refreshIntervalMs(10s)
    await advance(20_000)

    await marketHistoryMonitor.update('hour')
    await advance()

    // Ignore cache after refreshIntervalMs
    const fetcher2 = fetchHistoricalPrices
    expect(fetcher2.mock.calls[0][0].ignoreCache).toEqual(true)
  })

  it('should invalidate cache if clear cache version set', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    jest.setSystemTime(new Date('2025-01-01'))

    const getCacheKey = ({ currency, granularity, assetName }) =>
      `prices-${currency}-${assetName}-${granularity}`

    marketHistoryMonitor = createMonitor({
      getCacheKey,
      clearCacheAtom: createInMemoryAtom({ defaultValue: 'v1' }),
    })

    await marketHistoryStorage.set(
      getCacheKey({ currency: 'USD', granularity: 'hour', assetName: 'ethereum' }),
      [
        [
          123,
          {
            close: 345,
          },
        ],
      ]
    )

    expect(store).toMatchSnapshot()

    await marketHistoryMonitor.start()
    await advance()

    expect(store).toMatchSnapshot()
  })

  it('should not invalidate cache if clear cache version is the same as in storage', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    jest.setSystemTime(new Date('2025-01-01'))

    const getCacheKey = ({ currency, granularity, assetName }) =>
      `prices-${currency}-${assetName}-${granularity}`
    const clearCacheV = 'v1'

    marketHistoryMonitor = createMonitor({
      getCacheKey,
      clearCacheAtom: createInMemoryAtom({ defaultValue: clearCacheV }),
    })

    await marketHistoryStorage.set(
      getCacheKey({ currency: 'USD', granularity: 'hour', assetName: 'ethereum' }),
      [
        [
          123,
          {
            close: 345,
          },
        ],
      ]
    )
    await marketHistoryStorage.set('clear-market-history-cache', clearCacheV)

    expect(store).toMatchSnapshot()

    marketHistoryMonitor.start()
    await advance()

    expect(store).toMatchSnapshot()
  })

  it('should invalidate cache if clear cache version from remote config atom set', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    jest.setSystemTime(new Date('2025-01-01'))

    const getCacheKey = ({ currency, granularity, assetName }) =>
      `prices-${currency}-${assetName}-${granularity}`
    const remoteConfigClearCacheAtom = createInMemoryAtom({ defaultValue: 'v1' })

    marketHistoryMonitor = createMonitor({
      getCacheKey,
      remoteConfigClearCacheAtom,
    })

    await marketHistoryStorage.set(
      getCacheKey({ currency: 'USD', granularity: 'hour', assetName: 'ethereum' }),
      [
        [
          123,
          {
            close: 345,
          },
        ],
      ]
    )

    expect(store).toMatchSnapshot()

    await marketHistoryMonitor.start()
    await advance()

    expect(store).toMatchSnapshot()
  })

  it('should not invalidate cache if clear cache version from remote config atom set but same value in storage', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const getCacheKey = ({ currency, granularity, assetName }) =>
      `prices-${currency}-${assetName}-${granularity}`
    const remoteConfigClearCacheAtom = createInMemoryAtom({ defaultValue: 'v1' })
    marketHistoryMonitor = createMonitor({
      getCacheKey,
      remoteConfigClearCacheAtom,
    })

    await marketHistoryStorage.set('clear-market-history-cache-from-remote-config', 'v1')

    await marketHistoryStorage.set(
      getCacheKey({ currency: 'USD', granularity: 'hour', assetName: 'ethereum' }),
      [
        [
          123,
          {
            close: 345,
          },
        ],
      ]
    )

    expect(store).toMatchSnapshot()

    await marketHistoryMonitor.start()
    await advance()

    expect(store).toMatchSnapshot()
  })

  it('should invalidate cache when remote config atom receive new value and fetch new prices', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    jest.setSystemTime(new Date('2025-01-01'))

    const getCacheKey = ({ currency, granularity, assetName }) =>
      `prices-${currency}-${assetName}-${granularity}`
    const remoteConfigClearCacheAtom = createInMemoryAtom({ defaultValue: null })

    marketHistoryMonitor = createMonitor({
      getCacheKey,
      remoteConfigClearCacheAtom,
    })

    await marketHistoryStorage.set(
      getCacheKey({ currency: 'USD', granularity: 'hour', assetName: 'ethereum' }),
      [
        [
          123,
          {
            close: 345,
          },
        ],
      ]
    )

    expect(store).toMatchSnapshot()

    await marketHistoryMonitor.start()
    await advance()

    expect(store).toMatchSnapshot()

    await remoteConfigClearCacheAtom.set('v1')
    await advance()
    expect(store).toMatchSnapshot()
  })

  it('should use runtime cache and dont call storage', async () => {
    marketHistoryStorage = {
      ...marketHistoryStorage,
      get: jest.fn(),
    }
    marketHistoryMonitor = createMonitor({
      storage: marketHistoryStorage,
    })

    const getCacheCalls = () =>
      marketHistoryStorage.get.mock.calls
        .flat()
        .filter((call) => call.includes('USD-bitcoin-day') || call.includes('USD-bitcoin-hour'))

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const listener = await setupAtomListener()
    await marketHistoryMonitor.start()

    await advance()

    expect(listener).toHaveBeenCalledTimes(2)
    expect(getCacheCalls()).toEqual(['prices-USD-bitcoin-day', 'prices-USD-bitcoin-hour'])
    listener.mockClear()
    marketHistoryStorage.get.mockClear()

    await marketHistoryMonitor.update('hour')
    await advance()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getCacheCalls()).toEqual([])
  })

  it('should fetch prices when currency atom changes value', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const listener = await setupAtomListener()
    await marketHistoryMonitor.start()
    await advance()
    expect(listener).toHaveBeenCalledTimes(2)
    listener.mockClear()

    prices = {
      day: {
        BTC: {
          EUR: [{ close: 9000, open: 8999, time: 1_651_190_400 }],
        },
      },
      hour: {
        BTC: {
          EUR: [{ close: 9000, open: 8999, time: 1_663_668_000 }],
        },
      },
    }
    await currencyAtom.set('EUR')
    await advance()
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('should fetch new asset when enabledAssetsAtom value changes', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const listener = await setupAtomListener()
    await marketHistoryMonitor.start()
    await advance()
    expect(listener).toHaveBeenCalledTimes(2)
    listener.mockClear()

    prices = {
      day: {
        ALGO: {
          USD: [{ close: 2, open: 1, time: 1_651_190_400 }],
        },
      },
      hour: {
        ALGO: {
          USD: [{ close: 1.9, open: 0.9, time: 1_663_668_000 }],
        },
      },
      minute: {
        ALGO: {
          USD: [{ close: 1.8, open: 0.8, time: 1_744_219_700 }],
        },
      },
    }
    expect(store).toMatchSnapshot()
    await enabledAssetsAtom.set({
      bitcoin: true,
      ethereum: true,
      algorand: true,
    })
    await advance()
    expect(store).toMatchSnapshot()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('should use requestLimit provided in config', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    await marketHistoryMonitor.start()
    await advance()
    const fetcher1 = fetchHistoricalPrices
    const dayCall = fetcher1.mock.calls.find((call) => call[0].granularity === 'day')
    const hourCall = fetcher1.mock.calls.find((call) => call[0].granularity === 'hour')
    const minuteCall = fetcher1.mock.calls.find((call) => call[0].granularity === 'minute')

    expect(dayCall[0].granularity).toEqual('day')
    expect(dayCall[0].requestLimit).toEqual(366)
    expect(hourCall[0].granularity).toEqual('hour')
    expect(hourCall[0].requestLimit).toEqual(168)
    expect(minuteCall[0].granularity).toEqual('minute')
    expect(minuteCall[0].requestLimit).toEqual(120)
  })

  it('should fetch historical prices from a specific date', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    await enabledAssetsAtom.set({
      bitcoin: true,
    })

    marketHistoryMonitor = createMonitor({
      synchronizedTime: {
        now: () => new Date(Date.UTC(2024, 0, 6)).valueOf(),
      },
    })
    const listener = await setupAtomListener()
    prices = {
      day: {
        BTC: {
          USD: [
            { close: 49_998, open: 49_998, time: new Date(Date.UTC(2024, 0, 3)).valueOf() / 1000 },
            { close: 49_999, open: 49_999, time: new Date(Date.UTC(2024, 0, 4)).valueOf() / 1000 },
            { close: 50_000, open: 50_000, time: new Date(Date.UTC(2024, 0, 5)).valueOf() / 1000 },
            { close: 50_001, open: 50_001, time: new Date(Date.UTC(2024, 0, 6)).valueOf() / 1000 },
          ],
        },
      },
    }

    await marketHistoryMonitor.start()
    await advance()
    expect(listener).toHaveBeenCalledTimes(2)
    pricingClient.historicalPrice.mockClear()

    const startTimestamp = new Date(Date.UTC(2024, 0, 1, 0, 30)).valueOf()

    prices = {
      day: {
        BTC: {
          USD: [
            { close: 49_996, open: 49_997, time: new Date(Date.UTC(2024, 0, 1)).valueOf() / 1000 },
            { close: 49_997, open: 49_997, time: new Date(Date.UTC(2024, 0, 2)).valueOf() / 1000 },
            { close: 49_998, open: 49_998, time: new Date(Date.UTC(2024, 0, 3)).valueOf() / 1000 },
            { close: 49_999, open: 49_999, time: new Date(Date.UTC(2024, 0, 4)).valueOf() / 1000 },
            { close: 50_000, open: 50_000, time: new Date(Date.UTC(2024, 0, 5)).valueOf() / 1000 },
            { close: 50_001, open: 50_001, time: new Date(Date.UTC(2024, 0, 6)).valueOf() / 1000 },
          ],
        },
      },
    }

    await marketHistoryMonitor.fetchAssetPricesFromDate({
      assetName: 'bitcoin',
      granularity: 'day',
      startTimestamp,
    })
    await advance()

    expect(pricingClient.historicalPrice).toHaveBeenCalledTimes(1)
    const callArgs = pricingClient.historicalPrice.mock.calls[0][0]

    expect(callArgs.assets).toEqual(['BTC'])
    expect(callArgs.granularity).toEqual('day')
    expect(callArgs.limit).toEqual(2)

    expect(callArgs.timestamp % 86_400).toBe(0)

    expect(callArgs.ignoreInvalidSymbols).toBe(true)

    expect(listener).toHaveBeenCalledTimes(3)
  })

  it('should fetch historical prices with minute granularity', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const listener = await setupAtomListener()

    const timestamp = 1_744_220_000

    prices = {
      minute: {
        BTC: {
          USD: Array.from({ length: 60 }, (_, i) => ({
            close: 50_000 - i * 10,
            open: 50_000 - i * 5,
            time: timestamp - i * 60,
          })),
        },
      },
    }

    marketHistoryMonitor = createMonitor()
    await marketHistoryMonitor.start()
    await advance()

    listener.mockClear()
    pricingClient.historicalPrice.mockClear()

    await marketHistoryMonitor.update('minute')
    await advance()

    expect(pricingClient.historicalPrice).toHaveBeenCalledTimes(1)

    if (pricingClient.historicalPrice.mock.calls.length > 0) {
      const callArgs = pricingClient.historicalPrice.mock.calls[0][0]
      expect(callArgs.granularity).toBe('minute')

      if (callArgs.timestamp) {
        expect(callArgs.timestamp % 60).toBe(0)

        const now = Math.floor(Date.now() / 1000)
        const currentMinute = now - (now % 60)
        expect(callArgs.timestamp).toBeLessThan(currentMinute)
      }

      expect(callArgs.ignoreInvalidSymbols).toBe(true)
    }

    expect(listener).toHaveBeenCalledTimes(1)
  })
})
