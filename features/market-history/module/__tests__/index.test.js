import { connectAssets } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import { createAtomMock, createInMemoryAtom } from '@exodus/atoms'
import { SynchronizedTime } from '@exodus/basic-utils'
import logger from '@exodus/logger'
import createStorage from '@exodus/storage-memory'
import EventEmitter from 'events/'

const assets = connectAssets(assetsBase)

jest.doMock('@exodus/price-api', () => {
  const originalModule = jest.requireActual('@exodus/price-api')

  return {
    ...originalModule,
    fetchHistoricalPrices: jest.fn(originalModule.fetchHistoricalPrices),
  }
})

describe('market history monitor', () => {
  let storage
  let marketHistoryMonitor
  let assetsModule
  let currencyAtom
  let marketHistoryStorage
  let pricingClient
  let store
  let enabledAssetsAtom
  let marketHistoryAtom
  const createAssetsModule = () =>
    Object.assign(new EventEmitter(), {
      getAssets: () => ({
        bitcoin: assets.bitcoin,
        ethereum: assets.ethereum,
        algorand: assets.algorand,
      }),
      getAsset: (assetName) => assets[assetName],
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
    return require('../index').default.factory({
      assetsModule,
      currencyAtom,
      storage: marketHistoryStorage,
      pricingClient,
      enabledAssetsAtom,
      marketHistoryAtom,
      config: {
        granularityRequestLimits: {
          day: 366,
          hour: 168,
        },
      },
      synchronizedTime: SynchronizedTime,
      logger: logger('market-history'),
      ...args,
    })
  }

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
    assetsModule = createAssetsModule()
    prices = {
      day: {
        BTC: {
          USD: [
            { close: 9000, open: 8999, time: 1_651_190_400 },
            { close: 90_000, open: 89_900, time: 1_651_276_800 },
          ],
        },
      },
      hour: {
        BTC: {
          USD: [
            { close: 9000, open: 8999, time: 1_663_668_000 },
            { close: 90_000, open: 89_900, time: 1_663_671_600 },
          ],
        },
      },
    }
    pricingClient = {
      historicalPrice: jest.fn(
        ({ assets, fiatArray, granularity, limit, timestamp, ignoreInvalidSymbols }) =>
          prices[granularity]
      ),
    }

    // use require because otherwise jest mock doesn't work
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

  it('should store prices in atom on start', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const listener = await setupAtomListener()
    const assertListener = () => {
      expect(listener).toHaveBeenCalledTimes(2)

      expect(listener).toHaveBeenCalledWith({
        data: {
          USD: {
            daily: {
              bitcoin: {
                1_651_190_400_000: 9000,
                1_651_276_800_000: 90_000,
              },
              ethereum: {},
            },
          },
        },
      })
      expect(listener).toHaveBeenCalledWith({
        data: {
          USD: {
            daily: {
              bitcoin: {
                1_651_190_400_000: 9000,
                1_651_276_800_000: 90_000,
              },
              ethereum: {},
            },
            hourly: {
              bitcoin: {
                1_663_668_000_000: 9000,
                1_663_671_600_000: 90_000,
              },
              ethereum: {},
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
  it('should fetch prices when update called', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const listener = await setupAtomListener()
    marketHistoryMonitor.start()

    await advance()

    expect(listener).toHaveBeenCalledTimes(2)
    listener.mockClear()
    pricingClient.historicalPrice.mockClear()

    await marketHistoryMonitor.update('hour')
    await advance()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(pricingClient.historicalPrice).toHaveBeenCalledTimes(1)
  })

  it('should ignore cache when called for the first time and not ignore cache if refresh interval not finished yet on next update call', async () => {
    const remoteConfigRefreshIntervalAtom = createInMemoryAtom({
      defaultValue: 10_000,
    })
    marketHistoryMonitor = createMonitor({
      remoteConfigRefreshIntervalAtom,
    })

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const listener = await setupAtomListener()
    await marketHistoryMonitor.start()

    await advance()

    expect(listener).toHaveBeenCalledTimes(2)
    listener.mockClear()
    // use require because otherwise jest mock doesn't work
    const fetcher1 = require('@exodus/price-api').fetchHistoricalPrices
    expect(fetcher1.mock.calls[0][0].ignoreCache).toEqual(true)
    expect(fetcher1.mock.calls[1][0].ignoreCache).toEqual(true)
    require('@exodus/price-api').fetchHistoricalPrices.mockClear()
    pricingClient.historicalPrice.mockClear()

    await marketHistoryMonitor.update('hour')
    await advance()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(pricingClient.historicalPrice).toHaveBeenCalledTimes(1)
    const fetcher2 = require('@exodus/price-api').fetchHistoricalPrices
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
    const listener = await setupAtomListener()
    marketHistoryMonitor.start()

    await advance()

    expect(listener).toHaveBeenCalledTimes(2)
    listener.mockClear()
    const fetcher1 = require('@exodus/price-api').fetchHistoricalPrices
    expect(fetcher1.mock.calls[0][0].ignoreCache).toEqual(true)
    expect(fetcher1.mock.calls[1][0].ignoreCache).toEqual(true)
    require('@exodus/price-api').fetchHistoricalPrices.mockClear()
    pricingClient.historicalPrice.mockClear()

    await advance(20_000)

    await marketHistoryMonitor.update('hour')
    await advance()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(pricingClient.historicalPrice).toHaveBeenCalledTimes(1)
    const fetcher2 = require('@exodus/price-api').fetchHistoricalPrices
    expect(fetcher2.mock.calls[0][0].ignoreCache).toEqual(true)
  })

  it('should invalidate cache if clear cache version set', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const getCacheKey = ({ currency, granularity, assetName }) =>
      `prices-${currency}-${assetName}-${granularity}`

    marketHistoryMonitor = createMonitor({
      getCacheKey,
      clearCacheAtom: createInMemoryAtom({ defaultValue: 'v1' }),
    })

    // set something in cache
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
    const getCacheKey = ({ currency, granularity, assetName }) =>
      `prices-${currency}-${assetName}-${granularity}`
    const clearCacheV = 'v1'

    marketHistoryMonitor = createMonitor({
      getCacheKey,
      clearCacheAtom: createInMemoryAtom({ defaultValue: clearCacheV }),
    })

    // set something in cache
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
    const getCacheKey = ({ currency, granularity, assetName }) =>
      `prices-${currency}-${assetName}-${granularity}`
    const remoteConfigClearCacheAtom = createInMemoryAtom({ defaultValue: 'v1' })

    marketHistoryMonitor = createMonitor({
      getCacheKey,
      remoteConfigClearCacheAtom,
    })

    // set something in cache
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

    // set something in cache
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
    const getCacheKey = ({ currency, granularity, assetName }) =>
      `prices-${currency}-${assetName}-${granularity}`
    const remoteConfigClearCacheAtom = createInMemoryAtom({ defaultValue: null })

    marketHistoryMonitor = createMonitor({
      getCacheKey,
      remoteConfigClearCacheAtom,
    })

    // set something in cache
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

    remoteConfigClearCacheAtom.set('v1')
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
    }
    expect(store).toMatchSnapshot()
    await enabledAssetsAtom.set({
      bitcoin: true,
      ethereum: true,
      algorand: true,
    })
    await advance()
    expect(store).toMatchSnapshot()
    expect(listener).toHaveBeenCalledWith({
      changes: {
        USD: {
          daily: { algorand: { 1_651_190_400_000: 2 } },
          hourly: { algorand: { 1_663_668_000_000: 1.9 } },
        },
      },
      data: {
        USD: {
          daily: {
            bitcoin: {
              1_651_190_400_000: 9000,
              1_651_276_800_000: 90_000,
            },
            ethereum: {},
            algorand: { 1_651_190_400_000: 2 },
          },
          hourly: {
            algorand: { 1_663_668_000_000: 1.9 },
            bitcoin: { 1_663_668_000_000: 9000, 1_663_671_600_000: 90_000 },
            ethereum: {},
          },
        },
      },
    })
  })

  it('should use requestLimit provided in config', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    await marketHistoryMonitor.start()
    await advance()
    const fetcher1 = require('@exodus/price-api').fetchHistoricalPrices
    expect(fetcher1.mock.calls[0][0].granularity).toEqual('day')
    expect(fetcher1.mock.calls[0][0].requestLimit).toEqual(366)
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
    // Simulate case when today is 06/01/2024 and we have prices for 4 days
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
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith({
      data: {
        USD: {
          daily: {
            bitcoin: {
              1_704_240_000_000: 49_998,
              1_704_326_400_000: 49_999,
              1_704_412_800_000: 50_000,
              1_704_499_200_000: 50_001,
            },
          },
        },
      },
    })
    pricingClient.historicalPrice.mockClear()

    // assume client want prices from Jan 1 00:30 to check it correctly converts to 00:00
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
    expect(callArgs.limit).toEqual(2) // for jan 1 and jan 2

    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener.mock.calls[1][0]).toEqual({
      data: {
        USD: {
          daily: {
            bitcoin: {
              1_704_067_200_000: 49_996,
              1_704_153_600_000: 49_997,
              1_704_240_000_000: 49_998,
              1_704_326_400_000: 49_999,
              1_704_412_800_000: 50_000,
              1_704_499_200_000: 50_001,
            },
          },
        },
      },
    })

    const storageData = await marketHistoryStorage.get(`prices-USD-bitcoin-day`)
    expect(storageData).toEqual([
      [
        1_704_067_200_000,
        {
          close: 49_996,
        },
      ],
      [
        1_704_153_600_000,
        {
          close: 49_997,
        },
      ],
      [
        1_704_240_000_000,
        {
          close: 49_998,
        },
      ],
      [
        1_704_326_400_000,
        {
          close: 49_999,
        },
      ],
      [
        1_704_412_800_000,
        {
          close: 50_000,
        },
      ],
      [
        1_704_499_200_000,
        {
          close: 50_001,
        },
      ],
    ])

    // should not fetch if hit cache
    pricingClient.historicalPrice.mockClear()
    await marketHistoryMonitor.fetchAssetPricesFromDate({
      assetName: 'bitcoin',
      granularity: 'day',
      startTimestamp,
    })
    await advance()
    expect(pricingClient.historicalPrice).toHaveBeenCalledTimes(0)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  const advance = (ms = 0) => {
    jest.advanceTimersByTime(ms)
    return new Promise(setImmediate)
  }
})
