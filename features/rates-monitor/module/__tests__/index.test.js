import { createAtomMock } from '@exodus/atoms'

import ratesMonitorDefinition from '../'

const createRatesMonitor = ratesMonitorDefinition.factory

const advanceTimers = (ms) => {
  jest.advanceTimersByTime(ms)
  return new Promise(setImmediate)
}

describe('RatesMonitor', () => {
  const currency = 'EUR'

  const debounceInterval = 10
  const fetchInterval = 500
  const fetchRealTimePricesInterval = 200
  const requestDuration = 150

  let assets
  let ratesMonitor
  let ratesAtom
  let pricingClient
  let logger
  let assetNamesAtomObservers = []
  let triggerAssetNamesAtomObservers

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

  const createDelayedResponse = (response) => async () => {
    return new Promise((resolve) => setTimeout(() => resolve(response), requestDuration))
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
    triggerAssetNamesAtomObservers = async () => {
      for (const observer of assetNamesAtomObservers) {
        await observer(assets.map(({ name }) => name))
      }
    }

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
    pricingClient.currentPrice.mockResolvedValue({})
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
      data: [{ BTC: { EUR: 8888 } }],
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

  it('should fetch for added assets from observed available asset names and emit all the assets', async () => {
    expect.assertions(4)

    pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: {
        'BTC.EUR': 1,
        'ETH.EUR': 2,
      },
    })
    pricingClient.ticker.mockResolvedValue({
      'BTC.EUR.c24h': 3,
      'BTC.EUR.v24h': 4,
      'BTC.EUR.mc': 5,
    })

    pricingClient.currentPrice = jest.fn().mockRejectedValue({})
    pricingClient.ticker = jest.fn().mockRejectedValue({})
    const ratesAtomObserver = jest.fn()

    pricingClient.currentPrice.mockImplementationOnce(
      createDelayedResponse({
        isModified: true,
        data: {
          'BTC.EUR': 1,
          'ETH.EUR': 2,
          'BTC.USD': 1.1,
          'ETH.USD': 2.2,
        },
      })
    )
    pricingClient.ticker.mockImplementationOnce(
      createDelayedResponse({
        'BTC.EUR.c24h': 3,
        'BTC.EUR.v24h': 4,
        'BTC.EUR.mc': 5,
        'ETH.EUR.c24h': 6,
        'ETH.EUR.v24h': 7,
        'ETH.EUR.mc': 8,
      })
    )

    ratesAtom.observe(ratesAtomObserver)
    ratesMonitor.start()

    await advanceTimers(0)

    // imitate call for initial values
    await triggerAssetNamesAtomObservers()

    // result of the initial fetch call, not of the observer initial values!
    expect(pricingClient.currentPrice).toHaveBeenNthCalledWith(1, {
      assets: ['BTC', 'ETH'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })

    await advanceTimers(requestDuration)
    await advanceTimers(debounceInterval)

    expect(ratesAtomObserver).toHaveBeenLastCalledWith({
      EUR: {
        BTC: {
          cap: 5,
          change24: 3,
          invalid: false,
          price: 1,
          priceUSD: 1.1,
          volume24: 4,
        },
        ETH: {
          cap: 8,
          change24: 6,
          invalid: false,
          price: 2,
          priceUSD: 2.2,
          volume24: 7,
        },
      },
    })

    assets.push({ name: 'dogecoin', ticker: 'DOGE' })
    await triggerAssetNamesAtomObservers()

    pricingClient.currentPrice.mockImplementationOnce(
      createDelayedResponse({
        isModified: true,
        data: {
          'DOGE.EUR': 3.1,
          'DOGE.USD': 3.2,
        },
      })
    )
    pricingClient.ticker.mockImplementationOnce(
      createDelayedResponse({
        'DOGE.EUR.c24h': 4.1,
        'DOGE.EUR.v24h': 4.2,
        'DOGE.EUR.mc': 4.3,
      })
    )

    await advanceTimers(debounceInterval)
    expect(pricingClient.currentPrice).toHaveBeenNthCalledWith(2, {
      assets: ['DOGE'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })

    await advanceTimers(requestDuration)
    await advanceTimers(debounceInterval)

    expect(ratesAtomObserver).toHaveBeenNthCalledWith(2, {
      EUR: {
        DOGE: {
          cap: 4.3,
          change24: 4.1,
          invalid: false,
          price: 3.1,
          priceUSD: 3.2,
          volume24: 4.2,
        },
        BTC: {
          cap: 5,
          change24: 3,
          invalid: false,
          price: 1,
          priceUSD: 1.1,
          volume24: 4,
        },
        ETH: {
          cap: 8,
          change24: 6,
          invalid: false,
          price: 2,
          priceUSD: 2.2,
          volume24: 7,
        },
      },
    })
  })

  it("should fetch for added assets before next fetch interval even if there's request in progress", async () => {
    expect.assertions(3)

    const ratesAtomObserver = jest.fn()

    const createDelayedResponse = (response) => async () => {
      return new Promise((resolve) => setTimeout(() => resolve(response), requestDuration))
    }

    pricingClient.currentPrice = jest.fn().mockImplementation(createDelayedResponse())

    ratesAtom.observe(ratesAtomObserver)
    ratesMonitor.start()

    await advanceTimers(0)

    await triggerAssetNamesAtomObservers()
    expect(pricingClient.currentPrice).toHaveBeenNthCalledWith(1, {
      assets: ['BTC', 'ETH'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })

    assets.push({ name: 'dogecoin', ticker: 'DOGE' })
    await triggerAssetNamesAtomObservers()

    const halfRequestDuration = requestDuration / 2
    expect(halfRequestDuration + debounceInterval).toBeLessThan(fetchInterval) // ensure we are at the point before next interval fetch
    await advanceTimers(halfRequestDuration) // previous request still in progress, but we want a new one for the added asset
    await advanceTimers(debounceInterval)
    expect(pricingClient.currentPrice).toHaveBeenNthCalledWith(2, {
      assets: ['DOGE'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })
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
      data: [],
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
      data: [{ BTC: { EUR: 888 } }],
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
          priceUSD: 12,
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
      data: [{ BTC: { EUR: 1111 } }],
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
          priceUSD: 12,
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
      data: [{ BTC: { EUR: 8888 } }],
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
          priceUSD: 95,
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
        data: [{ BTC: { EUR: 9999 } }],
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
            priceUSD: 70,
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
        data: [{ BTC: { EUR: 77 } }],
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
            priceUSD: 9,
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
        data: [{ BTC: { EUR: 5000 } }],
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
            priceUSD: 9,
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
        data: [{ USDC: { EUR: 500 } }],
      })

      const handler = jest.fn()
      ratesAtom.observe(handler)
      ratesMonitor.start()

      await advanceTimers(fetchInterval)
      await advanceTimers(debounceInterval)
      let lastCall = handler.mock.calls[handler.mock.calls.length - 1][0]
      expect(lastCall.EUR.BTC.price).toBe(70)
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

  describe('Edge Cases with partial/missing real-time data', () => {
    it('should fallback to slow data if real-time data is missing for multiple coins', async () => {
      // 1) slowRates(slow fetch)
      pricingClient.currentPrice.mockResolvedValue({
        isModified: true,
        data: {
          'BTC.EUR': 100,
          'BTC.USD': 99,
          'ETH.EUR': 50,
          'ETH.USD': 55,
        },
      })

      // 2) only real-time data for BTC, ETH is missing
      pricingClient.realTimePrice.mockResolvedValue({
        isModified: true,
        data: [
          { BTC: { EUR: 120 } },
          // ETH is missing
        ],
      })

      const handler = jest.fn()
      ratesAtom.observe(handler)

      // 3) start monitor → first fetch
      ratesMonitor.start()
      await advanceTimers(0)
      await advanceTimers(debounceInterval)

      // here, slowRates + realTimeRates(BTC only) are merged
      // ETH is missing in real-time data, so fallback to slowRates
      expect(handler).toHaveBeenLastCalledWith({
        EUR: {
          BTC: {
            cap: 0,
            change24: 0,
            invalid: false, // both EUR/USD exist
            price: 120, // real-time
            priceUSD: 99, // from slowRates
            volume24: 0,
          },
          ETH: {
            cap: 0,
            change24: 0,
            invalid: false, // both EUR/USD exist, so valid
            price: 50, // fallback
            priceUSD: 55, // fallback
            volume24: 0,
          },
        },
      })
    })

    it('should treat real-time data as partial if only unknown asset is returned', async () => {
      // 1) slowRates
      pricingClient.currentPrice.mockResolvedValue({
        isModified: true,
        data: {
          'BTC.EUR': 500,
          'BTC.USD': 490,
          'ETH.EUR': 300,
          'ETH.USD': 310,
        },
      })

      // 2) real-time data returns only different coin (e.g. DOGE)
      //    => BTC/ETH are missing in real-time
      pricingClient.realTimePrice.mockResolvedValue({
        isModified: true,
        data: [
          { DOGE: { EUR: 9999 } },
          // BTC, ETH are missing
        ],
      })

      const handler = jest.fn()
      ratesAtom.observe(handler)

      ratesMonitor.start()
      await advanceTimers(0)
      await advanceTimers(debounceInterval)

      // real-time data has no BTC, ETH, so fallback to slowRates
      // DOGE is not in the monitoring asset list, so ignored
      expect(handler).toHaveBeenLastCalledWith({
        EUR: {
          BTC: {
            cap: 0,
            change24: 0,
            invalid: false,
            price: 500,
            priceUSD: 490,
            volume24: 0,
          },
          ETH: {
            cap: 0,
            change24: 0,
            invalid: false,
            price: 300,
            priceUSD: 310,
            volume24: 0,
          },
        },
      })
    })

    it('should skip real-time update if array is completely empty (no assets)', async () => {
      // slowRates
      pricingClient.currentPrice.mockResolvedValue({
        isModified: true,
        data: {
          'BTC.EUR': 10,
          'BTC.USD': 9,
          'ETH.EUR': 20,
          'ETH.USD': 18,
        },
      })

      // empty data array
      pricingClient.realTimePrice.mockResolvedValue({
        isModified: true,
        data: [],
      })

      const handler = jest.fn()
      ratesAtom.observe(handler)

      ratesMonitor.start()
      await advanceTimers(0)
      await advanceTimers(debounceInterval)

      // all real-time data is empty, so only slowRates is used
      expect(handler).toHaveBeenLastCalledWith({
        EUR: {
          BTC: {
            cap: 0,
            change24: 0,
            invalid: false,
            price: 10,
            priceUSD: 9,
            volume24: 0,
          },
          ETH: {
            cap: 0,
            change24: 0,
            invalid: false,
            price: 20,
            priceUSD: 18,
            volume24: 0,
          },
        },
      })
    })

    it('should fallback to slowRates for a subset of assets when real-time only has partial data, then update if new partial data arrives', async () => {
      // first call: BTC and ETH are read from slowRates
      pricingClient.currentPrice.mockResolvedValue({
        isModified: true,
        data: {
          'BTC.EUR': 100,
          'BTC.USD': 95,
          'ETH.EUR': 50,
          'ETH.USD': 48,
        },
      })

      // first real-time: BTC only
      pricingClient.realTimePrice.mockResolvedValueOnce({
        isModified: true,
        data: [{ BTC: { EUR: 120 } }],
      })

      const handler = jest.fn()
      ratesAtom.observe(handler)

      ratesMonitor.start()
      await advanceTimers(0)
      await advanceTimers(debounceInterval)

      // here, BTC is real-time 120, ETH is slow 50/48
      expect(handler).toHaveBeenLastCalledWith({
        EUR: {
          BTC: expect.objectContaining({ price: 120, priceUSD: 95, invalid: false }),
          ETH: expect.objectContaining({ price: 50, priceUSD: 48, invalid: false }),
        },
      })

      // second real-time: ETH only
      pricingClient.realTimePrice.mockResolvedValueOnce({
        isModified: true,
        data: [{ ETH: { EUR: 999 } }],
      })

      // proceed timer to second fetch
      await advanceTimers(fetchRealTimePricesInterval)
      await advanceTimers(debounceInterval)

      const lastCall = handler.mock.calls[handler.mock.calls.length - 1][0]
      expect(lastCall.EUR.BTC.price).toBe(100) // BTC is missing in real-time, so fallback to slowRates 100
      expect(lastCall.EUR.ETH.price).toBe(999) // new real-time 999
    })

    it('should return invalid=true when rates are missing', async () => {
      // first call: BTC and ETH are read from slowRates
      pricingClient.currentPrice.mockResolvedValue({
        isModified: true,
        data: {},
      })

      // first real-time: BTC only
      pricingClient.realTimePrice.mockResolvedValueOnce({
        isModified: true,
        data: [],
      })

      const handler = jest.fn()
      ratesAtom.observe(handler)

      ratesMonitor.start()
      await advanceTimers(0)
      await advanceTimers(debounceInterval)

      expect(handler).toHaveBeenLastCalledWith({
        EUR: {
          BTC: expect.objectContaining({
            invalid: true,
            price: 0,
            priceUSD: 0,
            change24: 0,
            volume24: 0,
            cap: 0,
          }),
          ETH: expect.objectContaining({
            invalid: true,
            price: 0,
            priceUSD: 0,
            change24: 0,
            volume24: 0,
            cap: 0,
          }),
        },
      })
    })
  })
})
