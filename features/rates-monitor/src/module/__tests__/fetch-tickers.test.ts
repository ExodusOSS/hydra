import { createInMemoryAtom } from '@exodus/atoms'
import type { Logger } from '@exodus/logger'
import ms from 'ms'

import ratesApiDefinition from '../../api/index.js'
import { setup as setupRedux } from '../../redux/__tests__/utils.js'
import type { RatesByCurrency } from '../../redux/types.js'
import ratesMonitorDefinition from '../index.js'

const flush = () => new Promise(setImmediate)

const createResponse = (price = 12) => ({
  isModified: true,
  lastModified: 'modified',
  data: { BTC: { EUR: 20, USD: 25 }, REMOTE: { EUR: price, USD: 15 } },
})

const setup = ({ initialRates = {} }: { initialRates?: RatesByCurrency } = {}) => {
  const currencyAtom = createInMemoryAtom({ defaultValue: 'EUR' })
  const ratesAtom = createInMemoryAtom<RatesByCurrency>({ defaultValue: initialRates })
  const assetsAtom = createInMemoryAtom<{
    value: Record<string, { name: string; ticker: string }>
  }>({
    defaultValue: { value: { bitcoin: { name: 'bitcoin', ticker: 'BTC' } } },
  })
  const ratesAssetNamesToMonitorAtom = createInMemoryAtom({ defaultValue: ['bitcoin'] })
  const pricingClient = {
    currentPrice: jest.fn().mockResolvedValue(createResponse()),
    ticker: jest.fn().mockResolvedValue({
      REMOTE: { EUR: { c24h: -3, v24h: 200, mc: 300 } },
    }),
    realTimePrice: jest.fn().mockResolvedValue({ isModified: false }),
  }
  const logger = { warn: jest.fn(), info: jest.fn(), error: jest.fn() } as unknown as Logger
  const monitor = ratesMonitorDefinition.factory({
    currencyAtom,
    ratesAtom,
    assetsAtom,
    ratesAssetNamesToMonitorAtom,
    pricingClient,
    logger,
    errorTracking: { track: jest.fn() },
    config: {
      fetchInterval: ms('10m'),
      fetchRealTimePricesInterval: ms('10m'),
      debounceInterval: 1,
    },
  })
  const api = ratesApiDefinition.factory({ ratesMonitor: monitor })
  const start = async () => {
    const started = monitor.start()
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    await started
  }
  return {
    monitor,
    api,
    pricingClient,
    currencyAtom,
    ratesAtom,
    assetsAtom,
    ratesAssetNamesToMonitorAtom,
    start,
  }
}

describe('temporary pricing tickers', () => {
  let context: ReturnType<typeof setup>

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    context = setup()
    await context.start()
  })

  afterEach(() => {
    context.monitor.stop()
    jest.useRealTimers()
  })

  it('fetches uninstalled tickers through the public API and normal rates atom', async () => {
    await context.api.rates.fetchTickers(['REMOTE', 'REMOTE'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['REMOTE'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })
    expect(context.pricingClient.ticker).toHaveBeenLastCalledWith({
      assets: ['REMOTE'],
      fiatCurrency: 'EUR',
    })
    const rates = await context.ratesAtom.get()
    expect(rates.EUR?.REMOTE).toEqual({
      price: 12,
      priceUSD: 15,
      change24: -3,
      volume24: 200,
      cap: 300,
      invalid: false,
    })
    const { value: assets } = await context.assetsAtom.get()
    expect(Object.keys(assets)).toEqual(['bitcoin'])
    expect(await context.ratesAssetNamesToMonitorAtom.get()).toEqual(['bitcoin'])
  })

  it('keeps Redux fiat rates consistent with canonical rates through expiry', async () => {
    const { store, selectors, emitRates, emitCurrencyChange } = setupRedux()
    emitCurrencyChange('EUR')
    const unsubscribe = context.ratesAtom.observe(emitRates)
    await context.api.rates.fetchTickers(['REMOTE'])
    await flush()
    const beforeExpiry = await context.ratesAtom.get()
    expect(selectors.rates.fiatRates(store.getState())).toEqual(beforeExpiry.EUR)
    await jest.advanceTimersByTimeAsync(ms('5m'))
    const afterExpiry = await context.ratesAtom.get()
    expect(selectors.rates.fiatRates(store.getState())).toEqual(afterExpiry.EUR)
    expect(selectors.rates.fiatRates(store.getState())).not.toHaveProperty('REMOTE')
    unsubscribe()
  })

  it('retains separate validators for alternating full polls and canonical subsets', async () => {
    context.pricingClient.currentPrice.mockResolvedValueOnce({
      ...createResponse(),
      lastModified: 'subset',
    })
    await context.api.rates.fetchTickers(['REMOTE', 'REMOTE'])
    context.pricingClient.currentPrice.mockResolvedValueOnce({
      ...createResponse(),
      lastModified: 'full',
    })
    const updated = context.monitor.update()
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    await updated
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    await context.api.rates.fetchTickers(['REMOTE'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['REMOTE'],
      fiatCurrency: 'EUR',
      lastModified: 'subset',
    })
    await context.monitor.update()
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC', 'REMOTE'],
      fiatCurrency: 'EUR',
      lastModified: 'full',
    })
    await context.api.rates.fetchTickers(['REMOTE', 'BTC', 'REMOTE'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC', 'REMOTE'],
      fiatCurrency: 'EUR',
      lastModified: 'full',
    })
  })

  it('keeps subset validators isolated by currency while retaining previous currencies', async () => {
    context.pricingClient.currentPrice.mockResolvedValueOnce({
      ...createResponse(),
      lastModified: 'eur-subset',
    })
    await context.api.rates.fetchTickers(['REMOTE'])
    await context.currencyAtom.set('USD')
    await flush()
    await jest.advanceTimersByTimeAsync(2)
    context.pricingClient.currentPrice.mockResolvedValueOnce({
      ...createResponse(),
      lastModified: 'usd-subset',
    })
    await context.api.rates.fetchTickers(['REMOTE'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['REMOTE'],
      fiatCurrency: 'USD',
      lastModified: undefined,
    })
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    await context.api.rates.fetchTickers(['REMOTE'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['REMOTE'],
      fiatCurrency: 'USD',
      lastModified: 'usd-subset',
    })
    await context.currencyAtom.set('EUR')
    await flush()
    await jest.advanceTimersByTimeAsync(2)
    await context.api.rates.fetchTickers(['REMOTE'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['REMOTE'],
      fiatCurrency: 'EUR',
      lastModified: 'eur-subset',
    })
  })

  it('prunes every context containing expired tickers but keeps normal asset validators', async () => {
    await context.api.rates.fetchTickers(['REMOTE'])
    await context.api.rates.fetchTickers(['BTC', 'REMOTE'])
    await context.currencyAtom.set('USD')
    await flush()
    await jest.advanceTimersByTimeAsync(2)
    await context.api.rates.fetchTickers(['REMOTE'])
    await jest.advanceTimersByTimeAsync(ms('5m'))
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    await context.api.rates.fetchTickers(['REMOTE'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['REMOTE'],
      fiatCurrency: 'USD',
      lastModified: undefined,
    })
    await context.currencyAtom.set('EUR')
    await flush()
    await jest.advanceTimersByTimeAsync(2)
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC', 'REMOTE'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })
    await context.api.rates.fetchTickers(['REMOTE'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['REMOTE'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })
    await context.api.rates.fetchTickers(['BTC'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC'],
      fiatCurrency: 'EUR',
      lastModified: 'modified',
    })
  })

  it('caps overlapping subset contexts and evicts the least recently used validator', async () => {
    const tickers = Array.from({ length: 6 }, (_, index) => `REMOTE${index}`)
    for (let combination = 1; combination <= 31; combination++) {
      await context.api.rates.fetchTickers(tickers.filter((_, index) => combination & (1 << index)))
    }
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    await context.api.rates.fetchTickers(['BTC'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC'],
      fiatCurrency: 'EUR',
      lastModified: 'modified',
    })
    context.pricingClient.currentPrice.mockResolvedValueOnce(createResponse())
    await context.api.rates.fetchTickers(['REMOTE5'])
    await context.api.rates.fetchTickers(['BTC'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC'],
      fiatCurrency: 'EUR',
      lastModified: 'modified',
    })
    await context.api.rates.fetchTickers(['REMOTE0'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['REMOTE0'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })
    await context.api.rates.fetchTickers(['REMOTE1'])
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['REMOTE1'],
      fiatCurrency: 'EUR',
      lastModified: 'modified',
    })
  })

  it('renews expiry from the last request even when prices are unmodified', async () => {
    await context.api.rates.fetchTickers(['REMOTE'])
    await jest.advanceTimersByTimeAsync(ms('4m'))
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    await context.api.rates.fetchTickers(['REMOTE'])
    await jest.advanceTimersByTimeAsync(ms('4m'))
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { REMOTE: { price: 12 } } })
    await jest.advanceTimersByTimeAsync(ms('1m'))
    await expect(context.ratesAtom.get()).resolves.not.toHaveProperty('EUR.REMOTE')
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { BTC: { price: 20 } } })
  })

  it('prunes all currency caches on expiry without a modified network response', async () => {
    await context.api.rates.fetchTickers(['REMOTE'])
    await context.currencyAtom.set('USD')
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    await context.api.rates.fetchTickers(['REMOTE'])
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    const calls = context.pricingClient.currentPrice.mock.calls.length
    await jest.advanceTimersByTimeAsync(ms('5m'))
    const rates = await context.ratesAtom.get()
    expect(rates.EUR?.REMOTE).toBeUndefined()
    expect(rates.USD?.REMOTE).toBeUndefined()
    expect(context.pricingClient.currentPrice).toHaveBeenCalledTimes(calls)
    await context.api.rates.fetchTickers(['REMOTE'])
    await expect(context.ratesAtom.get()).resolves.toMatchObject({
      USD: { REMOTE: { price: 0, invalid: true } },
    })
  })

  it('keeps a promoted ticker priced through expiry and failed or unmodified refreshes', async () => {
    await context.api.rates.fetchTickers(['REMOTE'])
    const prices: (number | undefined)[] = []
    const unsubscribe = context.ratesAtom.observe((rates) => {
      prices.push(rates.EUR?.REMOTE?.price)
    })
    context.pricingClient.currentPrice.mockClear()
    context.pricingClient.currentPrice.mockRejectedValueOnce(new Error('offline'))
    await context.assetsAtom.set({
      value: {
        bitcoin: { name: 'bitcoin', ticker: 'BTC' },
        remote: { name: 'remote', ticker: 'REMOTE' },
      },
    })
    await context.ratesAssetNamesToMonitorAtom.set(['bitcoin', 'remote'])
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    expect(context.pricingClient.currentPrice).not.toHaveBeenCalled()
    const updated = context.monitor.update()
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    await updated
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    await jest.advanceTimersByTimeAsync(ms('5m'))
    await context.monitor._updateInstant()
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { REMOTE: { price: 12 } } })
    expect(prices.every((price) => price === 12)).toBe(true)
    unsubscribe()
  })

  it('preserves temporary prices when a normal asset is added and in regular refreshes', async () => {
    await context.api.rates.fetchTickers(['REMOTE'])
    await context.assetsAtom.set({
      value: {
        bitcoin: { name: 'bitcoin', ticker: 'BTC' },
        other: { name: 'other', ticker: 'OTHER' },
      },
    })
    context.pricingClient.currentPrice.mockResolvedValueOnce({
      isModified: true,
      data: { OTHER: { EUR: 7, USD: 8 } },
    })
    await context.ratesAssetNamesToMonitorAtom.set(['bitcoin', 'other'])
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { REMOTE: { price: 12 } } })
    const updated = context.monitor.update()
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    await updated
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC', 'OTHER', 'REMOTE'],
      fiatCurrency: 'EUR',
      lastModified: undefined,
    })
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { REMOTE: { price: 12 } } })
  })

  it('isolates currency caches when a previous currency request finishes late', async () => {
    const delayed = createDeferred<ReturnType<typeof createResponse>>()
    context.pricingClient.currentPrice.mockReturnValueOnce(delayed.promise)
    const request = context.api.rates.fetchTickers(['REMOTE'])
    await flush()
    await context.currencyAtom.set('USD')
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC', 'REMOTE'],
      fiatCurrency: 'USD',
      lastModified: undefined,
    })
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ USD: { REMOTE: { price: 15 } } })
    delayed.resolve(createResponse(99))
    await request
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ USD: { REMOTE: { price: 15 } } })
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    await context.currencyAtom.set('EUR')
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { REMOTE: { price: 99 } } })
  })

  it('does not let an older response overwrite a newer request for the same ticker', async () => {
    const delayed = createDeferred<ReturnType<typeof createResponse>>()
    context.pricingClient.currentPrice.mockReturnValueOnce(delayed.promise)
    const older = context.api.rates.fetchTickers(['REMOTE'])
    await flush()
    context.pricingClient.currentPrice.mockResolvedValueOnce(createResponse(21))
    await context.api.rates.fetchTickers(['REMOTE'])
    delayed.resolve(createResponse(3))
    await older
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { REMOTE: { price: 21 } } })
  })

  it('accepts an older success when a newer API request fails', async () => {
    const delayed = createDeferred<ReturnType<typeof createResponse>>()
    context.pricingClient.currentPrice.mockReturnValueOnce(delayed.promise)
    const older = context.api.rates.fetchTickers(['REMOTE'])
    await flush()
    context.pricingClient.ticker.mockRejectedValueOnce(new Error('newer failed'))
    await expect(context.api.rates.fetchTickers(['REMOTE'])).rejects.toThrow('newer failed')
    delayed.resolve(createResponse(19))
    await older
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { REMOTE: { price: 19 } } })
  })

  it('does not resurrect an expired ticker when an in-flight request completes', async () => {
    const delayed = createDeferred<ReturnType<typeof createResponse>>()
    context.pricingClient.currentPrice.mockReturnValueOnce(delayed.promise)
    const request = context.api.rates.fetchTickers(['REMOTE'])
    await flush()
    await jest.advanceTimersByTimeAsync(ms('5m'))
    delayed.resolve(createResponse())
    await request
    await expect(context.ratesAtom.get()).resolves.not.toHaveProperty('EUR.REMOTE')
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    await context.api.rates.fetchTickers(['REMOTE'])
    await expect(context.ratesAtom.get()).resolves.toMatchObject({
      EUR: { REMOTE: { invalid: true } },
    })
  })

  it('rejects failed fetches without erasing cached prices and allows retry', async () => {
    await context.api.rates.fetchTickers(['REMOTE'])
    context.pricingClient.ticker.mockRejectedValueOnce(new Error('offline'))
    await expect(context.api.rates.fetchTickers(['REMOTE'])).rejects.toThrow('offline')
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { REMOTE: { price: 12 } } })
    await context.api.rates.fetchTickers(['REMOTE'])
    await expect(context.ratesAtom.get()).resolves.toMatchObject({
      EUR: { REMOTE: { invalid: false } },
    })
  })

  it('expires a failed initial request and does not publish an unvalidated price', async () => {
    context.pricingClient.currentPrice.mockRejectedValueOnce(new Error('offline'))
    await expect(context.api.rates.fetchTickers(['REMOTE'])).rejects.toThrow('offline')
    await expect(context.ratesAtom.get()).resolves.not.toHaveProperty('EUR.REMOTE')
    await jest.advanceTimersByTimeAsync(ms('5m'))
    context.pricingClient.currentPrice.mockClear()
    const updated = context.monitor.update()
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    await updated
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC'],
      fiatCurrency: 'EUR',
      lastModified: 'modified',
    })
  })

  it.each(['available', 'temporary'])(
    'retains upstream prices for a new %s ticker across 304 responses',
    async (kind) => {
      context.pricingClient.realTimePrice.mockResolvedValueOnce({
        isModified: true,
        lastModified: 'real-modified',
        entityTag: 'real-etag',
        data: [{ REMOTE: { EUR: 50 } }],
      })
      const updated = context.monitor.update()
      await flush()
      await jest.advanceTimersByTimeAsync(1)
      await updated
      await expect(context.ratesAtom.get()).resolves.not.toHaveProperty('EUR.REMOTE')

      if (kind === 'temporary') {
        await context.api.rates.fetchTickers(['REMOTE'])
      } else {
        await context.assetsAtom.set({
          value: {
            bitcoin: { name: 'bitcoin', ticker: 'BTC' },
            remote: { name: 'remote', ticker: 'REMOTE' },
          },
        })
        await context.ratesAssetNamesToMonitorAtom.set(['bitcoin', 'remote'])
      }

      await flush()
      await jest.advanceTimersByTimeAsync(1)
      const refreshed = context.monitor.update()
      await flush()
      await jest.advanceTimersByTimeAsync(1)
      await refreshed
      expect(context.pricingClient.realTimePrice).toHaveBeenLastCalledWith({
        fiatCurrency: 'EUR',
        ignoreInvalidSymbols: true,
        lastModified: 'real-modified',
        entityTag: 'real-etag',
      })
      await expect(context.ratesAtom.get()).resolves.toMatchObject({
        EUR: { REMOTE: { price: 50, isRealTime: true } },
      })

      await context.assetsAtom.set({
        value: {
          bitcoin: { name: 'bitcoin', ticker: 'BTC' },
          remote: { name: 'remote', ticker: 'REMOTE' },
        },
      })
      await context.ratesAssetNamesToMonitorAtom.set(['bitcoin', 'remote'])
      await jest.advanceTimersByTimeAsync(ms('5m'))
      await context.monitor._updateInstant()
      await expect(context.ratesAtom.get()).resolves.toMatchObject({
        EUR: { REMOTE: { price: 50, isRealTime: true } },
      })
    }
  )

  it('preserves current-price context and matching currency cache across stop and restart', async () => {
    context.monitor.stop()
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    await context.start()
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC'],
      fiatCurrency: 'EUR',
      lastModified: 'modified',
    })
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { BTC: { price: 20 } } })
    await context.currencyAtom.set('USD')
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC'],
      fiatCurrency: 'USD',
      lastModified: undefined,
    })
  })

  it('prunes real-time prices too, so an expired ticker cannot reuse a stale cache', async () => {
    await context.api.rates.fetchTickers(['REMOTE'])
    context.pricingClient.realTimePrice.mockResolvedValueOnce({
      isModified: true,
      entityTag: 'real-etag',
      lastModified: 'real-modified',
      data: [{ REMOTE: { EUR: 50 } }],
    })
    const updated = context.monitor.update()
    await flush()
    await jest.advanceTimersByTimeAsync(1)
    await updated
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { REMOTE: { price: 50 } } })
    await jest.advanceTimersByTimeAsync(ms('5m'))
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    await context.api.rates.fetchTickers(['REMOTE'])
    await expect(context.ratesAtom.get()).resolves.toMatchObject({
      EUR: { REMOTE: { price: 0, invalid: true } },
    })
    await context.monitor.update()
    expect(context.pricingClient.realTimePrice).toHaveBeenLastCalledWith({
      fiatCurrency: 'EUR',
      ignoreInvalidSymbols: true,
      lastModified: undefined,
      entityTag: undefined,
    })
  })

  it('prunes stored temporary rates after restart even when the server is unmodified', async () => {
    await context.api.rates.fetchTickers(['REMOTE'])
    context.monitor.stop()
    context.pricingClient.currentPrice.mockResolvedValue({ isModified: false })
    await context.start()
    await expect(context.ratesAtom.get()).resolves.not.toHaveProperty('EUR.REMOTE')
    await expect(context.ratesAtom.get()).resolves.toMatchObject({ EUR: { BTC: { price: 20 } } })
  })

  it('preserves persisted installed rates in a new monitor that starts offline', async () => {
    context.monitor.stop()
    context = setup({
      initialRates: {
        EUR: {
          BTC: { price: 20, priceUSD: 25, change24: 0, volume24: 0, cap: 0, invalid: false },
          REMOTE: {
            price: 12,
            priceUSD: 15,
            change24: 0,
            volume24: 0,
            cap: 0,
            invalid: false,
          },
        },
      },
    })
    context.pricingClient.currentPrice.mockRejectedValue(new Error('offline'))
    context.pricingClient.ticker.mockRejectedValue(new Error('offline'))
    await context.start()
    await expect(context.ratesAtom.get()).resolves.toEqual({
      EUR: {
        BTC: { price: 20, priceUSD: 25, change24: 0, volume24: 0, cap: 0, invalid: false },
      },
    })
  })

  it('uses existing validation for invalid remote prices', async () => {
    context.pricingClient.currentPrice.mockResolvedValue({
      isModified: true,
      data: { REMOTE: { EUR: Number.POSITIVE_INFINITY, USD: -1 } },
    })
    await context.api.rates.fetchTickers(['REMOTE'])
    await expect(context.ratesAtom.get()).resolves.toMatchObject({
      EUR: { REMOTE: { invalid: true, price: 0, priceUSD: 0 } },
    })
  })

  it('clears timers and temporary subscriptions on stop and rejects late results', async () => {
    await context.api.rates.fetchTickers(['REMOTE'])
    const delayed = createDeferred<ReturnType<typeof createResponse>>()
    context.pricingClient.currentPrice.mockReturnValueOnce(delayed.promise)
    const request = context.api.rates.fetchTickers(['REMOTE'])
    await flush()
    const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout')
    const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval')
    context.monitor.stop()
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)
    expect(clearIntervalSpy).toHaveBeenCalledTimes(2)
    clearTimeoutSpy.mockRestore()
    clearIntervalSpy.mockRestore()
    await context.start()
    delayed.resolve(createResponse(99))
    await request
    await expect(context.ratesAtom.get()).resolves.not.toHaveProperty('EUR.REMOTE')
    expect(context.pricingClient.currentPrice).toHaveBeenLastCalledWith({
      assets: ['BTC'],
      fiatCurrency: 'EUR',
      lastModified: 'modified',
    })
  })
})

function createDeferred<T>() {
  const deferred = { resolve: (_value: T) => {} }
  const promise = new Promise<T>((resolve) => {
    deferred.resolve = resolve
  })
  return { promise, resolve: deferred.resolve }
}
