import { createAtomMock } from '@exodus/atoms'

import ratesMonitorDefinition from '../'

const createRatesMonitor = ratesMonitorDefinition.factory

const advanceTimers = (ms) => {
  jest.advanceTimersByTime(ms)
  return new Promise(setImmediate)
}

describe('RatesMonitor', () => {
  const currency = 'EUR'

  const debounceInterval = 100
  const fetchInterval = 500
  const fetchRealTimePricesInterval = 200

  let assets
  let ratesMonitor
  let ratesAtom
  let pricingClient
  let logger
  let assetNamesAtomObservers = []

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

  const availableAssetNamesAtom = {
    get: async () => assets.map((asset) => asset.name),
    observe: (callback) => {
      assetNamesAtomObservers.push(callback)
      return () => {}
    },
  }

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    ratesAtom = createAtomMock({})

    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    pricingClient = {
      currentPrice: jest.fn(),
      ticker: jest.fn(),
      realTimePrice: jest.fn(),
    }

    assets = [
      { name: 'bitcoin', ticker: 'BTC' },
      { name: 'ethereum', ticker: 'ETH' },
    ]

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
        fetchRealTimePricesInterval,
      },
    })

    pricingClient.ticker.mockResolvedValue({})
  })

  afterEach(() => {
    ratesMonitor.stop()
    jest.useRealTimers()
  })

  it('should emit rates (slow fetch, modified=true) + fallback to realTime if available', async () => {
    expect.assertions(1)
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.EUR': 73,
        'BTC.USD': 70,
        'ETH.EUR': 42,
        'ETH.USD': 40,
      },
    })
    pricingClient.ticker.mockResolvedValue({
      'BTC.EUR.c24h': 7,
      'BTC.EUR.v24h': 42,
      'BTC.EUR.mc': 73,
    })
    pricingClient.realTimePrice.mockResolvedValue({
      isModified: true,
      data: {
        BTC: { USD: 9999, EUR: 8888 },
      },
    })
    const handler = jest.fn()
    ratesAtom.observe(handler)
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    await advanceTimers(fetchRealTimePricesInterval)
    await advanceTimers(debounceInterval)
    expect(handler).toHaveBeenLastCalledWith({
      EUR: {
        BTC: {
          cap: 73,
          change24: 7,
          invalid: false,
          price: 8888,
          priceUSD: 9999,
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
  it('should skip update if currentPrice says isModified=false', async () => {
    expect.assertions(2)
    pricingClient.currentPrice.mockResolvedValue({
      isModified: false,
    })
    const handler = jest.fn()
    ratesAtom.observe(handler)
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    expect(handler).toHaveBeenCalledTimes(0)
    expect(logger.info).toHaveBeenCalledWith(
      'price data is not modified, skipping slow-rates update tick'
    )
  })
  it('should track lastModified from currentPrice response and re-use on next calls', async () => {
    expect.assertions(3)
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.EUR': 100,
      },
      lastModified: 'some-etag-1',
    })
    const handler = jest.fn()
    ratesAtom.observe(handler)
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    expect(pricingClient.currentPrice).toHaveBeenNthCalledWith(1, {
      assets: ['BTC', 'ETH'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: { 'BTC.EUR': 200 },
      lastModified: 'some-etag-2',
    })
    await advanceTimers(fetchInterval)
    await advanceTimers(debounceInterval)
    expect(pricingClient.currentPrice).toHaveBeenNthCalledWith(2, {
      assets: ['BTC', 'ETH'],
      fiatCurrency: 'EUR',
      lastModified: 'some-etag-1',
    })
    expect(handler).toHaveBeenCalledTimes(2)
  })
  it('should reset lastModified if the tracked assets changed', async () => {
    expect.assertions(3)
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.EUR': 73,
        'ETH.EUR': 42,
      },
      lastModified: 'etag-abc',
    })
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    expect(pricingClient.currentPrice).toHaveBeenNthCalledWith(1, {
      assets: ['BTC', 'ETH'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })
    assets = [
      { name: 'bitcoin', ticker: 'BTC' },
      { name: 'dogecoin', ticker: 'DOGE' },
    ]
    for (const ob of assetNamesAtomObservers) {
      await ob(assets.map((a) => a.name))
    }

    await advanceTimers(fetchInterval)
    await advanceTimers(debounceInterval)
    expect(pricingClient.currentPrice).toHaveBeenNthCalledWith(2, {
      assets: ['BTC', 'DOGE'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })
    expect(logger.error).not.toHaveBeenCalled()
  })
  it('should indicate invalid rate when USD price missing', async () => {
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.EUR': 73,
      },
    })
    const handler = jest.fn()
    ratesAtom.observe(handler)
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    expect(handler).toHaveBeenCalledWith({
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
  })
  it('should indicate invalid rate when EUR price missing (main fiat)', async () => {
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.USD': 73,
      },
    })
    const handler = jest.fn()
    ratesAtom.observe(handler)
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    expect(handler).toHaveBeenCalledWith({
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
  })
  it('should warn when assets are missing rates', async () => {
    assets = [...assets, { ticker: 'OTH', name: 'other' }]
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.EUR': 1,
        'BTC.USD': 1,
      },
    })
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    expect(logger.warn).toHaveBeenCalledWith('Pricing data missing for: ETH, OTH')
  })
  it('should warn about missing rates of the same assets only once', async () => {
    pricingClient.realTimePrice.mockResolvedValue({
      isModified: false,
      data: {},
    })
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.EUR': 1,
        'BTC.USD': 1,
      },
    })
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    await advanceTimers(fetchInterval)
    await advanceTimers(debounceInterval)
    expect(logger.warn).toHaveBeenCalledTimes(1)
    assets = [...assets, { ticker: 'OTH', name: 'other' }]
    for (const ob of assetNamesAtomObservers) {
      await ob(assets.map((a) => a.name))
    }

    await advanceTimers(fetchInterval)
    await advanceTimers(debounceInterval)
    expect(logger.warn).toHaveBeenCalledTimes(2)
  })
  it('should not warn when all rates are present', async () => {
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.EUR': 1,
        'BTC.USD': 1,
        'ETH.EUR': 1,
        'ETH.USD': 1,
      },
    })
    const handler = jest.fn()
    ratesAtom.observe(handler)
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    expect(logger.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('Pricing data missing for:')
    )
    expect(handler).toHaveBeenCalledTimes(1)
  })
  it('should re-fetch slowRates at the specified interval', async () => {
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.EUR': 0,
        'BTC.USD': 0,
      },
    })
    const handler = jest.fn()
    ratesAtom.observe(handler)
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    expect(handler).toHaveBeenCalledTimes(1)
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.EUR': 1,
        'BTC.USD': 1,
      },
    })
    await advanceTimers(fetchInterval - 1)
    expect(handler).toHaveBeenCalledTimes(1)
    await advanceTimers(1)
    await advanceTimers(debounceInterval)
    expect(handler).toHaveBeenCalledTimes(2)
  })
  it('should re-fetch realTimeRates at the specified interval', async () => {
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.EUR': 10,
        'BTC.USD': 12,
      },
    })
    pricingClient.realTimePrice.mockResolvedValue({
      isModified: true,
      data: {
        BTC: { USD: 999, EUR: 888 },
      },
    })
    const handler = jest.fn()
    ratesAtom.observe(handler)
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith({
      EUR: {
        BTC: {
          cap: 0,
          change24: 0,
          invalid: false,
          price: 888,
          priceUSD: 999,
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
    pricingClient.realTimePrice.mockResolvedValue({
      isModified: true,
      data: {
        BTC: { USD: 1234, EUR: 1111 },
      },
    })
    await advanceTimers(fetchRealTimePricesInterval)
    await advanceTimers(debounceInterval)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith({
      EUR: {
        BTC: {
          cap: 0,
          change24: 0,
          invalid: false,
          price: 1111,
          priceUSD: 1234,
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
  })
  it('should override top asset price with real-time data if available', async () => {
    pricingClient.realTimePrice.mockResolvedValue({
      isModified: true,
      data: {
        BTC: {
          USD: 9999,
          EUR: 8888,
        },
      },
    })
    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.USD': 95,
        'BTC.EUR': 90,
        'ETH.USD': 44,
        'ETH.EUR': 40,
      },
    })
    pricingClient.ticker.mockResolvedValue({
      'BTC.EUR.c24h': 7,
      'BTC.EUR.v24h': 42,
      'BTC.EUR.mc': 73,
    })
    const handler = jest.fn()
    ratesAtom.observe(handler)
    ratesMonitor.start()
    await advanceTimers(0)
    await advanceTimers(debounceInterval)
    await advanceTimers(fetchRealTimePricesInterval)
    await advanceTimers(debounceInterval)
    expect(handler).toHaveBeenLastCalledWith({
      EUR: {
        BTC: {
          cap: 73,
          change24: 7,
          invalid: false,
          price: 8888,
          priceUSD: 9999,
          volume24: 42,
        },
        ETH: {
          cap: 0,
          change24: 0,
          invalid: false,
          price: 40,
          priceUSD: 44,
          volume24: 0,
        },
      },
    })
  })
  describe('Real-time fallback logic', () => {
    it('should override top asset price with real-time data if fresh', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })

      pricingClient.currentPrice.mockResolvedValue({
        isModified: true,
        data: {
          'BTC.EUR': 73,
          'BTC.USD': 70,
          'ETH.EUR': 42,
          'ETH.USD': 40,
        },
      })

      pricingClient.ticker.mockResolvedValue({
        'BTC.EUR.c24h': 7,
        'BTC.EUR.v24h': 42,
        'BTC.EUR.mc': 73,
      })

      pricingClient.realTimePrice.mockResolvedValue({
        isModified: true,
        data: {
          BTC: {
            EUR: 9999,
            USD: 8888,
          },
        },
      })

      const handler = jest.fn()
      ratesAtom.observe(handler)

      ratesMonitor.start()

      await advanceTimers(fetchInterval)
      await advanceTimers(debounceInterval)

      const expectedRates = {
        EUR: {
          BTC: expect.objectContaining({
            price: 9999,
            priceUSD: 8888,
            invalid: false,
          }),
          ETH: expect.objectContaining({
            price: 42,
            priceUSD: 40,
            invalid: false,
          }),
        },
      }

      expect(handler).toHaveBeenLastCalledWith(expectedRates)
    })

    it('should fallback to slow data if real-time data is missing for that asset', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })

      pricingClient.currentPrice.mockResolvedValue({
        isModified: true,
        data: {
          'BTC.EUR': 10,
          'BTC.USD': 9,
          'ETH.EUR': 100,
          'ETH.USD': 110,
        },
      })
      pricingClient.realTimePrice.mockResolvedValue({
        isModified: true,
        data: {
          BTC: {
            EUR: 77,
            USD: 70,
          },
        },
      })

      const handler = jest.fn()
      ratesAtom.observe(handler)

      ratesMonitor.start()
      await advanceTimers(fetchInterval)
      await advanceTimers(debounceInterval)
      await advanceTimers(10)
      await advanceTimers(debounceInterval)

      const lastCall = handler.mock.calls[handler.mock.calls.length - 1][0]
      expect(lastCall).toEqual({
        EUR: {
          BTC: {
            cap: 0,
            change24: 0,
            invalid: false,
            price: 77,
            priceUSD: 70,
            volume24: 0,
          },
          ETH: {
            cap: 0,
            change24: 0,
            invalid: false,
            price: 100,
            priceUSD: 110,
            volume24: 0,
          },
        },
      })
    })

    it('should continue using existing real-time data even if time passes (no flicker back to slow)', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })

      pricingClient.currentPrice.mockResolvedValue({
        isModified: true,
        data: {
          'BTC.EUR': 10,
          'BTC.USD': 9,
        },
      })
      pricingClient.realTimePrice.mockResolvedValue({
        isModified: true,
        data: {
          BTC: {
            EUR: 5000,
            USD: 4900,
          },
        },
      })

      const handler = jest.fn()
      ratesAtom.observe(handler)

      ratesMonitor.start()
      await advanceTimers(fetchInterval)
      await advanceTimers(debounceInterval)
      pricingClient.realTimePrice.mockResolvedValueOnce({
        isModified: false,
      })

      await advanceTimers(fetchRealTimePricesInterval)
      await advanceTimers(debounceInterval)

      const lastCall = handler.mock.calls[handler.mock.calls.length - 1][0]
      expect(lastCall).toEqual({
        EUR: {
          BTC: {
            cap: 0,
            change24: 0,
            volume24: 0,
            invalid: false,
            price: 5000,
            priceUSD: 4900,
          },
          ETH: {
            cap: 0,
            change24: 0,
            volume24: 0,
            invalid: true,
            price: 0,
            priceUSD: 0,
          },
        },
      })
    })

    it('should fallback to slow data when the asset is no longer in real-time top list (asset removed)', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })

      pricingClient.currentPrice.mockResolvedValue({
        isModified: true,
        data: {
          'BTC.EUR': 70,
          'BTC.USD': 60,
          'ETH.EUR': 90,
          'ETH.USD': 100,
        },
      })
      pricingClient.realTimePrice.mockResolvedValue({
        isModified: true,
        data: {
          BTC: {
            EUR: 500,
            USD: 499,
          },
        },
      })

      const handler = jest.fn()
      ratesAtom.observe(handler)
      ratesMonitor.start()

      await advanceTimers(fetchInterval)
      await advanceTimers(debounceInterval)
      let lastCall = handler.mock.calls[handler.mock.calls.length - 1][0]
      expect(lastCall.EUR.BTC.price).toBe(500)
      expect(lastCall.EUR.ETH.price).toBe(90)

      pricingClient.realTimePrice.mockResolvedValue({
        isModified: true,
        data: {},
      })

      await advanceTimers(fetchRealTimePricesInterval)
      await advanceTimers(debounceInterval)
      lastCall = handler.mock.calls[handler.mock.calls.length - 1][0]
      expect(lastCall.EUR.BTC.price).toBe(70)
      expect(lastCall.EUR.BTC.priceUSD).toBe(60)
      expect(lastCall.EUR.BTC.invalid).toBe(false)
    })
  })
})
