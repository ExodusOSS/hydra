import { createInMemoryAtom } from '@exodus/atoms'
import type { Logger } from '@exodus/logger'

import type { RatesByCurrency } from '../../redux/types.js'
import ratesMonitorDefinition from '../index.js'

const createRatesMonitor = ratesMonitorDefinition.factory

describe('RatesMonitor currency and lifecycle isolation', () => {
  const assets = { bitcoin: { name: 'bitcoin', ticker: 'BTC' } }

  const createMonitor = () => {
    const currencyAtom = createInMemoryAtom({ defaultValue: 'EUR' })
    const assetsAtom = createInMemoryAtom({ defaultValue: { value: assets } })
    const ratesAssetNamesToMonitorAtom = createInMemoryAtom({ defaultValue: ['bitcoin'] })
    const ratesAtom = createInMemoryAtom<RatesByCurrency>({ defaultValue: {} })
    const pricingClient = {
      currentPrice: jest.fn(),
      ticker: jest.fn().mockResolvedValue({}),
      realTimePrice: jest.fn().mockResolvedValue({
        isModified: false,
        lastModified: undefined,
        entityTag: undefined,
        data: [],
      }),
    }
    const logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      log: jest.fn(),
    } as unknown as Logger
    const ratesMonitor = createRatesMonitor({
      currencyAtom,
      pricingClient,
      assetsAtom,
      ratesAssetNamesToMonitorAtom,
      logger,
      ratesAtom,
      errorTracking: { track: jest.fn() },
      config: {
        fetchInterval: 60_000,
        debounceInterval: 0,
        fetchRealTimePricesInterval: 60_000,
      },
    })

    return { currencyAtom, pricingClient, ratesAtom, ratesMonitor }
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('keeps concurrent slow fetches and cached rates isolated by currency', async () => {
    const euroResponse = createDeferred<CurrentPriceResponse>()
    const { currencyAtom, pricingClient, ratesAtom, ratesMonitor } = createMonitor()
    pricingClient.currentPrice.mockImplementation(({ fiatCurrency }) =>
      fiatCurrency === 'EUR'
        ? euroResponse.promise
        : Promise.resolve(
            createCurrentPriceResponse({
              fiatCurrency: 'USD',
              price: 20,
              usdPrice: 20,
            })
          )
    )

    const initialStart = ratesMonitor.start()
    await flushObservers()
    await currencyAtom.set('USD')
    await flushObservers()
    await ratesMonitor.update()

    expect(pricingClient.currentPrice).toHaveBeenCalledWith(
      expect.objectContaining({ fiatCurrency: 'USD' })
    )

    euroResponse.resolve(
      createCurrentPriceResponse({ fiatCurrency: 'EUR', price: 10, usdPrice: 11 })
    )
    await initialStart
    await flushObservers()

    const usdRates = await ratesAtom.get()
    expect(usdRates.USD?.BTC).toEqual(expect.objectContaining({ price: 20, priceUSD: 20 }))

    await currencyAtom.set('EUR')
    await ratesMonitor.update()
    expect(pricingClient.currentPrice).toHaveBeenCalledWith(
      expect.objectContaining({ fiatCurrency: 'EUR', lastModified: 'rates-v1' })
    )
    ratesMonitor.stop()
  })

  it('rejects responses from a stopped lifecycle after restart', async () => {
    const staleResponse = createDeferred<CurrentPriceResponse>()
    const staleRealTimeResponse = createDeferred<RealTimePriceResponse>()
    const { pricingClient, ratesAtom, ratesMonitor } = createMonitor()
    pricingClient.currentPrice
      .mockImplementationOnce(() => staleResponse.promise)
      .mockResolvedValue(
        createCurrentPriceResponse({ fiatCurrency: 'EUR', price: 20, usdPrice: 21 })
      )
    pricingClient.realTimePrice
      .mockImplementationOnce(() => staleRealTimeResponse.promise)
      .mockResolvedValue({
        isModified: true,
        lastModified: 'real-time-v2',
        entityTag: 'real-time-v2',
        data: [{ BTC: { EUR: 200 } }],
      })

    const staleStart = ratesMonitor.start()
    await flushObservers()
    ratesMonitor.stop()
    await ratesMonitor.start()

    staleResponse.resolve(
      createCurrentPriceResponse({ fiatCurrency: 'EUR', price: 10, usdPrice: 11 })
    )
    staleRealTimeResponse.resolve({
      isModified: true,
      lastModified: 'real-time-v1',
      entityTag: 'real-time-v1',
      data: [{ BTC: { EUR: 100 } }],
    })
    await staleStart
    await flushObservers()

    const restartedRates = await ratesAtom.get()
    expect(restartedRates.EUR?.BTC).toEqual(expect.objectContaining({ price: 200, priceUSD: 21 }))
    ratesMonitor.stop()
  })

  it('publishes retained currency rates when restart receives an unmodified response', async () => {
    const { pricingClient, ratesAtom, ratesMonitor } = createMonitor()
    pricingClient.currentPrice.mockResolvedValueOnce(
      createCurrentPriceResponse({ fiatCurrency: 'EUR', price: 10, usdPrice: 11 })
    )

    await ratesMonitor.start()
    ratesMonitor.stop()
    await ratesAtom.set({})
    pricingClient.currentPrice.mockResolvedValue({
      isModified: false,
      lastModified: 'rates-v1',
      data: {},
    })

    await ratesMonitor.start()
    await flushObservers()

    const retainedRates = await ratesAtom.get()
    expect(retainedRates.EUR?.BTC).toEqual(expect.objectContaining({ price: 10, priceUSD: 11 }))
    ratesMonitor.stop()
  })
})

const flushObservers = () => new Promise<void>((resolve) => setImmediate(resolve))

const createCurrentPriceResponse = ({
  fiatCurrency,
  price,
  usdPrice,
}: {
  fiatCurrency: string
  price: number
  usdPrice: number
}): CurrentPriceResponse => ({
  isModified: true,
  lastModified: 'rates-v1',
  data: { BTC: { [fiatCurrency]: price, USD: usdPrice } },
})

const createDeferred = <T>() => {
  let resolveDeferred!: (value: T) => void
  const promise = new Promise<T>((resolve) => {
    resolveDeferred = resolve
  })
  return { promise, resolve: resolveDeferred }
}

type CurrentPriceResponse = {
  isModified: boolean
  lastModified: string | undefined
  data: Record<string, Record<string, number>>
}

type RealTimePriceResponse = {
  isModified: boolean
  lastModified: string | undefined
  entityTag: string | undefined
  data: Record<string, Record<string, number>>[]
}
