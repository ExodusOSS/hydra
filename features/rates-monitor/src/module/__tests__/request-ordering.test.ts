import { createInMemoryAtom } from '@exodus/atoms'
import type { Logger } from '@exodus/logger'

import type { RatesByCurrency } from '../../redux/types.js'
import ratesMonitorDefinition from '../index.js'

const createRatesMonitor = ratesMonitorDefinition.factory

describe('RatesMonitor request ordering', () => {
  it('keeps the newest applied result per ticker while accepting unaffected older results', async () => {
    const olderCurrentPrice = createDeferred<CurrentPriceResponse>()
    const olderTicker = createDeferred<TickerResponse>()
    const { addOverlappingAssets, pricingClient, ratesAtom, ratesMonitor } = createMonitor()
    pricingClient.currentPrice
      .mockImplementationOnce(() => olderCurrentPrice.promise)
      .mockResolvedValueOnce(currentPriceResponse({ BTC: 20, DOGE: 30 }))
    pricingClient.ticker.mockImplementationOnce(() => olderTicker.promise).mockResolvedValueOnce({})

    const start = ratesMonitor.start()
    await flushObservers()
    await addOverlappingAssets()
    await flushObservers()

    olderCurrentPrice.resolve(currentPriceResponse({ BTC: 10, ETH: 11 }))
    olderTicker.resolve({})
    await start
    await flushObservers()

    const rates = await ratesAtom.get()
    expect(rates.EUR).toEqual(
      expect.objectContaining({
        BTC: expect.objectContaining({ price: 20 }),
        DOGE: expect.objectContaining({ price: 30 }),
        ETH: expect.objectContaining({ price: 11 }),
      })
    )
    ratesMonitor.stop()
  })

  it.each(['current price failure', 'ticker failure', 'unmodified response'] as const)(
    'accepts an older success after a newer %s',
    async (newerOutcome) => {
      const olderCurrentPrice = createDeferred<CurrentPriceResponse>()
      const olderTicker = createDeferred<TickerResponse>()
      const { addOverlappingAssets, pricingClient, ratesAtom, ratesMonitor } = createMonitor()
      pricingClient.currentPrice.mockImplementationOnce(() => olderCurrentPrice.promise)
      pricingClient.ticker.mockImplementationOnce(() => olderTicker.promise)
      if (newerOutcome === 'current price failure') {
        pricingClient.currentPrice.mockRejectedValueOnce(new Error('current price failed'))
        pricingClient.ticker.mockResolvedValueOnce({})
      } else if (newerOutcome === 'ticker failure') {
        pricingClient.currentPrice.mockResolvedValueOnce(
          currentPriceResponse({ BTC: 20, DOGE: 30 })
        )
        pricingClient.ticker.mockRejectedValueOnce(new Error('ticker failed'))
      } else {
        pricingClient.currentPrice.mockResolvedValueOnce({
          isModified: false,
          lastModified: 'newer-unmodified',
          data: {},
        })
        pricingClient.ticker.mockResolvedValueOnce({})
      }

      const start = ratesMonitor.start()
      await flushObservers()
      await addOverlappingAssets()
      await flushObservers()
      olderCurrentPrice.resolve(currentPriceResponse({ BTC: 10, ETH: 11 }))
      olderTicker.resolve({})
      await start
      await flushObservers()

      const rates = await ratesAtom.get()
      expect(rates.EUR).toEqual(
        expect.objectContaining({
          BTC: expect.objectContaining({ price: 10 }),
          ETH: expect.objectContaining({ price: 11 }),
        })
      )
      ratesMonitor.stop()
    }
  )
})

const createMonitor = () => {
  const initialAssets = {
    bitcoin: { name: 'bitcoin', ticker: 'BTC' },
    ethereum: { name: 'ethereum', ticker: 'ETH' },
  }
  const currencyAtom = createInMemoryAtom({ defaultValue: 'EUR' })
  const assetsAtom = createInMemoryAtom({ defaultValue: { value: initialAssets } })
  const ratesAssetNamesToMonitorAtom = createInMemoryAtom({
    defaultValue: Object.keys(initialAssets),
  })
  const ratesAtom = createInMemoryAtom<RatesByCurrency>({ defaultValue: {} })
  const pricingClient = {
    currentPrice: jest.fn<Promise<CurrentPriceResponse>, [CurrentPriceRequest]>(),
    ticker: jest.fn<Promise<TickerResponse>, [TickerRequest]>(),
    realTimePrice: jest.fn().mockResolvedValue({
      isModified: false,
      lastModified: undefined,
      entityTag: undefined,
      data: [],
    }),
  }
  const ratesMonitor = createRatesMonitor({
    currencyAtom,
    pricingClient,
    assetsAtom,
    ratesAssetNamesToMonitorAtom,
    logger: createLogger(),
    ratesAtom,
    errorTracking: { track: jest.fn() },
    config: { fetchInterval: 60_000, debounceInterval: 0, fetchRealTimePricesInterval: 60_000 },
  })

  const addOverlappingAssets = async () => {
    const addedAssets = {
      ...initialAssets,
      bitcoinAlias: { name: 'bitcoinAlias', ticker: 'BTC' },
      dogecoin: { name: 'dogecoin', ticker: 'DOGE' },
    }
    await assetsAtom.set({ value: addedAssets })
    await ratesAssetNamesToMonitorAtom.set(Object.keys(addedAssets))
  }

  return { addOverlappingAssets, pricingClient, ratesAtom, ratesMonitor }
}

const currentPriceResponse = (prices: Record<string, number>): CurrentPriceResponse => ({
  isModified: true,
  lastModified: 'modified',
  data: Object.fromEntries(
    Object.entries(prices).map(([ticker, price]) => [ticker, { EUR: price, USD: price }])
  ),
})

const createLogger = () =>
  ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    log: jest.fn(),
  }) as unknown as Logger

const flushObservers = () => new Promise<void>((resolve) => setImmediate(resolve))

const createDeferred = <T>() => {
  let resolveDeferred!: (value: T) => void
  const promise = new Promise<T>((resolve) => {
    resolveDeferred = resolve
  })
  return { promise, resolve: resolveDeferred }
}

type CurrentPriceRequest = { assets: string[]; fiatCurrency: string; lastModified?: string }
type TickerRequest = { assets: string[]; fiatCurrency: string }
type CurrentPriceResponse = {
  isModified: boolean
  lastModified: string | undefined
  data: Record<string, Record<string, number>>
}
type TickerResponse = Record<string, Record<string, { c24h?: number; v24h?: number; mc?: number }>>
