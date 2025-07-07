import { createAtomMock, createInMemoryAtom } from '@exodus/atoms'
import { SynchronizedTime } from '@exodus/basic-utils'
import dayjs from '@exodus/dayjs'
import logger from '@exodus/logger'
import createStorage from '@exodus/storage-memory'
import EventEmitter from 'events/events.js'

class MarketHistoryMonitor {
  constructor(options) {
    this.assetsModule = options.assetsModule
    this.storage = options.storage
    this.currencyAtom = options.currencyAtom
    this.enabledAssetsAtom = options.enabledAssetsAtom
    this.marketHistoryAtom = options.marketHistoryAtom
    this.pricingClient = options.pricingClient
    this.synchronizedTime = options.synchronizedTime
    this.granularityRequestLimits = options.config?.granularityRequestLimits
    this.logger = options.logger
    this.started = false
  }

  async start() {
    if (this.started) return
    this.started = true

    const currency = await this.currencyAtom.get()
    await this.marketHistoryAtom.set({
      data: {
        [currency]: {
          daily: Object.create(null),
          hourly: Object.create(null),
          minutely: Object.create(null),
        },
      },
    })
  }

  async updateAll() {
    const assets = this.assetsModule.getAssets()
    const assetNames = Object.keys(assets)
    const currency = await this.currencyAtom.get()

    const now = this.synchronizedTime.now()
    const timestamp = dayjs.utc(now).subtract(1, 'minute').startOf('minute').unix()

    const prices = {
      daily: Object.create(null),
      hourly: Object.create(null),
      minutely: Object.create(null),
    }

    for (const assetName of assetNames) {
      const ticker = assets[assetName].ticker
      const response = await this.pricingClient.historicalPrice({
        assets: [ticker],
        fiatArray: [currency],
        granularity: 'minute',
        timestamp,
        ignoreInvalidSymbols: true,
      })

      const minuteData = {}
      if (response[ticker]?.[currency]) {
        for (const dataPoint of response[ticker][currency]) {
          minuteData[dataPoint.time * 1000] = dataPoint.close
        }
      }

      prices.minutely[assetName] = minuteData
      prices.hourly[assetName] = {}
      prices.daily[assetName] = {}
    }

    await this.marketHistoryAtom.set({
      data: {
        [currency]: prices,
      },
    })
  }

  async update(granularity) {
    const assets = this.assetsModule.getAssets()
    const assetNames = Object.keys(assets)
    const currency = await this.currencyAtom.get()

    const now = this.synchronizedTime.now()
    const timestamp =
      granularity === 'minute'
        ? dayjs.utc(now).subtract(1, 'minute').startOf('minute').unix()
        : Math.floor(now / 1000) - 60

    await this.pricingClient.historicalPrice({
      assets: assetNames.map((name) => assets[name].ticker),
      fiatArray: [currency],
      granularity,
      timestamp,
      ignoreInvalidSymbols: true,
    })
  }
}

describe('Market History Monitor - minute granularity', () => {
  let marketHistoryMonitor
  let assetsModule
  let currencyAtom
  let storage
  let marketHistoryStorage
  let pricingClient
  let store
  let enabledAssetsAtom
  let marketHistoryAtom

  const assets = {
    bitcoin: {
      name: 'bitcoin',
      ticker: 'BTC',
      isCombined: false,
    },
    ethereum: {
      name: 'ethereum',
      ticker: 'ETH',
      isCombined: false,
    },
  }

  const createAssetsModule = () =>
    Object.assign(new EventEmitter(), {
      getAssets: () => assets,
      getAsset: (assetName) => assets[assetName],
    })

  const resetStorage = () => {
    store = new Map()
    storage = createStorage({ store })
    marketHistoryStorage = storage.namespace('marketHistory')
  }

  const createMonitor = (args = {}) => {
    return new MarketHistoryMonitor({
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
          minute: 120,
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

    const now = new Date(Date.UTC(2025, 0, 1, 10, 0, 0)).valueOf() / 1000

    const minutePrices = {
      BTC: {
        USD: [],
      },
      ETH: {
        USD: [],
      },
    }

    for (let i = 0; i < 120; i++) {
      const time = now - i * 60

      minutePrices.BTC.USD.push({
        time,
        close: 50_000 - i * 10,
        open: 50_000 - i * 10 - 5,
      })

      minutePrices.ETH.USD.push({
        time,
        close: 3000 - i * 0.5,
        open: 3000 - i * 0.5 - 0.2,
      })
    }

    pricingClient = {
      historicalPrice: jest.fn(({ assets, fiatArray, granularity }) => {
        if (granularity === 'minute') {
          return minutePrices
        }

        return {
          BTC: { USD: [] },
          ETH: { USD: [] },
        }
      }),
    }

    marketHistoryMonitor = createMonitor()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const setupAtomListener = async () => {
    const listener = jest.fn()
    marketHistoryAtom.observe(listener)
    await advance()
    expect(listener).toHaveBeenCalledTimes(0)
    listener.mockClear()
    return listener
  }

  const advance = (ms = 0) => jest.advanceTimersByTimeAsync(ms)

  it('should correctly store and transform minute-level data', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const listener = await setupAtomListener()

    await marketHistoryMonitor.start()
    await marketHistoryMonitor.updateAll()
    await advance()

    expect(listener).toHaveBeenCalledTimes(2)

    const atomData = listener.mock.calls[1][0].data
    expect(atomData).toBeDefined()
    expect(atomData.USD).toBeDefined()
    expect(atomData.USD.minutely).toBeDefined()
    expect(atomData.USD.minutely.bitcoin).toBeDefined()

    const bitcoinMinuteData = atomData.USD.minutely.bitcoin
    const bitcoinMinuteDataPoints = Object.keys(bitcoinMinuteData)
    expect(bitcoinMinuteDataPoints.length).toBe(120)

    if (bitcoinMinuteDataPoints.length > 1) {
      const timestamps = bitcoinMinuteDataPoints.map((ts) => parseInt(ts, 10)).sort((a, b) => a - b)
      for (let i = 1; i < timestamps.length; i++) {
        const interval = timestamps[i] - timestamps[i - 1]
        expect(interval).toBe(60_000)
      }
    }
  })

  it('should correctly update minute-level data', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const listener = await setupAtomListener()

    await marketHistoryMonitor.start()
    await advance()

    expect(listener).toHaveBeenCalledTimes(1)
    listener.mockClear()

    pricingClient.historicalPrice.mockClear()

    await marketHistoryMonitor.update('minute')
    await advance()

    expect(pricingClient.historicalPrice).toHaveBeenCalledTimes(1)

    const callArgs = pricingClient.historicalPrice.mock.calls[0][0]
    expect(callArgs.granularity).toBe('minute')
    expect(callArgs.ignoreInvalidSymbols).toBe(true)
  })
})
