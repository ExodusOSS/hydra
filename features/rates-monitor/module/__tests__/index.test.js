import { createAtomMock } from '@exodus/atoms'
import ratesMonitorDefinition from '../'

const createRatesMonitor = ratesMonitorDefinition.factory

describe('RatesMonitor', () => {
  const currency = 'EUR'

  const debounceInterval = 100
  const fetchInterval = 500

  let assets

  const assetsModule = {
    getAsset: (name) => assets.find((asset) => asset.name === name),
  }

  const currencyAtom = {
    observe: (callback) => {
      callback(currency)
      return () => {}
    },
    get: async () => currency,
  }

  let assetNamesAtomObservers = []
  const availableAssetNamesAtom = {
    get: async () => assets.map((asset) => asset.name),
    observe: (callback) => {
      assetNamesAtomObservers.push(callback)
      return () => {}
    },
  }

  let ratesMonitor
  let ratesAtom
  let pricingClient
  let logger

  beforeEach(() => {
    ratesAtom = createAtomMock({})
    assets = [
      { name: 'bitcoin', ticker: 'BTC' },
      { name: 'ethereum', ticker: 'ETH' },
    ]

    logger = {
      error: jest.fn(),
      warn: jest.fn(),
    }
    pricingClient = {
      currentPrice: jest.fn(),
      ticker: jest.fn(),
    }

    assetNamesAtomObservers = []

    ratesMonitor = createRatesMonitor({
      currencyAtom,
      pricingClient,
      assetsModule,
      availableAssetNamesAtom,
      logger,
      ratesAtom,
      config: {
        fetchInterval,
        debounceInterval,
      },
    })

    pricingClient.ticker.mockResolvedValue({})
  })

  afterEach(() => {
    ratesMonitor.stop()
    jest.useRealTimers()
  })

  it('should emit rates', async () => {
    expect.assertions(1)

    pricingClient.currentPrice.mockResolvedValue({
      'BTC.EUR': 73,
      'BTC.USD': 70,
      'ETH.EUR': 42,
      'ETH.USD': 40,
    })

    pricingClient.ticker.mockResolvedValue({
      'BTC.EUR.c24h': 7,
      'BTC.EUR.v24h': 42,
      'BTC.EUR.mc': 73,
    })

    const handler = jest.fn()
    ratesAtom.observe(handler)

    ratesMonitor.start()

    await new Promise(setTimeout)

    expect(handler).toBeCalledWith({
      EUR: {
        BTC: {
          cap: 73,
          change24: 7,
          invalid: false,
          price: 73,
          priceUSD: 70,
          volume24: 42,
        },
        ETH: {
          cap: 0,
          change24: 0,
          invalid: false,
          price: 42,
          priceUSD: 40,
          volume24: 0,
        },
      },
    })
  })

  it('should emit rates on update', async () => {
    pricingClient.currentPrice.mockResolvedValue({
      'BTC.EUR': 73,
      'BTC.USD': 70,
      'ETH.EUR': 42,
      'ETH.USD': 40,
    })

    pricingClient.ticker.mockResolvedValue({
      'BTC.EUR.c24h': 7,
      'BTC.EUR.v24h': 42,
      'BTC.EUR.mc': 73,
    })

    const handler = jest.fn()
    ratesAtom.observe(handler)

    await ratesMonitor.update()

    expect(handler).toHaveBeenCalledWith({
      EUR: {
        BTC: {
          cap: 73,
          change24: 7,
          invalid: false,
          price: 73,
          priceUSD: 70,
          volume24: 42,
        },
        ETH: {
          cap: 0,
          change24: 0,
          invalid: false,
          price: 42,
          priceUSD: 40,
          volume24: 0,
        },
      },
    })
  })

  it('should skip update if an update is currently ongoing', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    const handler = jest.fn()
    ratesAtom.observe(handler)

    const promises = Promise.all([
      ratesMonitor.update(),
      ratesMonitor.update(),
      ratesMonitor.update(),
    ])

    await advance(fetchInterval)
    await promises

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should indicate invalid rate when USD price missing', (done) => {
    expect.assertions(1)
    pricingClient.currentPrice.mockResolvedValue({
      'BTC.EUR': 73,
    })

    ratesMonitor.start()

    ratesAtom.observe((rates) => {
      expect(rates).toEqual({
        EUR: {
          BTC: {
            cap: 0,
            change24: 0,
            invalid: true,
            price: 73,
            priceUSD: 0,
            volume24: 0,
          },
          ETH: {
            cap: 0,
            change24: 0,
            invalid: true,
            price: 0,
            priceUSD: 0,
            volume24: 0,
          },
        },
      })

      done()
    })
  })

  it('should indicate invalid rate when price missing', (done) => {
    expect.assertions(1)

    pricingClient.currentPrice.mockResolvedValue({
      'BTC.USD': 73,
    })

    ratesMonitor.start()

    ratesAtom.observe((rates) => {
      expect(rates).toEqual({
        EUR: {
          BTC: {
            cap: 0,
            change24: 0,
            invalid: true,
            price: 0,
            priceUSD: 73,
            volume24: 0,
          },
          ETH: {
            cap: 0,
            change24: 0,
            invalid: true,
            price: 0,
            priceUSD: 0,
            volume24: 0,
          },
        },
      })

      done()
    })
  })

  it('should warn when assets are missing rates', (done) => {
    expect.assertions(1)

    assets = [...assets, { ticker: 'OTH', name: 'other' }]

    pricingClient.currentPrice.mockResolvedValue({
      'BTC.USD': 1,
      'BTC.EUR': 1,
    })

    ratesMonitor.start()
    ratesAtom.observe((rates) => {
      expect(logger.warn).toHaveBeenCalledWith('Pricing data missing for: ETH, OTH')
      done()
    })
  })

  it('should warn about missing rates of the same assets only once', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    pricingClient.currentPrice.mockResolvedValue({
      'BTC.USD': 1,
      'BTC.EUR': 1,
    })

    ratesMonitor.start()

    await advance(fetchInterval)
    await advance(fetchInterval)

    expect(logger.warn).toHaveBeenCalledTimes(1)

    assets = [...assets, { ticker: 'OTH', name: 'other' }]
    await advance(fetchInterval)

    expect(logger.warn).toHaveBeenCalledTimes(2)
  })

  it('should not warn when all rates are present', (done) => {
    expect.assertions(1)
    pricingClient.currentPrice.mockResolvedValue({
      'BTC.USD': 1,
      'BTC.EUR': 1,
      'ETH.USD': 1,
      'ETH.EUR': 1,
    })

    ratesMonitor.start()

    ratesAtom.observe((rates) => {
      expect(logger.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('Pricing data missing for:')
      )

      done()
    })
  })

  it('should re-fetch when time as specified in fetchInterval elapsed', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const ratesListener = jest.fn()
    ratesAtom.observe(ratesListener)

    ratesMonitor.start()
    await advance()

    expect(ratesListener).toHaveBeenCalledTimes(1)
    pricingClient.currentPrice.mockResolvedValue({
      'BTC.USD': 1,
      'BTC.EUR': 1,
    })

    await advance(debounceInterval + fetchInterval - 1)
    expect(ratesListener).toHaveBeenCalledTimes(1)
    pricingClient.currentPrice.mockResolvedValue({
      'BTC.USD': 2,
      'BTC.EUR': 2,
    })

    await advance(fetchInterval + 1)
    expect(ratesListener).toHaveBeenCalledTimes(2)
  })

  it('should re-fetch when assets update', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    pricingClient.currentPrice.mockResolvedValue({
      'BTC.EUR': 73,
      'BTC.USD': 70,
      'ETH.EUR': 42,
      'ETH.USD': 40,
      'SOL.EUR': 2,
      'SOL.USD': 1,
    })

    let fetchedRates
    const ratesListener = jest.fn((rates) => {
      fetchedRates = rates.EUR
    })
    ratesAtom.observe(ratesListener)

    ratesMonitor.start()
    await advance()

    expect(ratesListener).toHaveBeenCalledTimes(1)
    expect(Object.keys(fetchedRates).length).toEqual(2)

    assets = [
      { name: 'bitcoin', ticker: 'BTC' },
      { name: 'ethereum', ticker: 'ETH' },
      { name: 'solana', ticker: 'SOL' },
    ]

    for (const observerCallback of assetNamesAtomObservers) {
      await observerCallback(assets.map((asset) => asset.name))
    }

    await advance(debounceInterval)
    expect(ratesListener).toHaveBeenCalledTimes(2)
    expect(Object.keys(fetchedRates).length).toEqual(3)
  })

  const advance = (ms = fetchInterval) => {
    jest.advanceTimersByTime(ms)
    return new Promise(setImmediate)
  }
})
