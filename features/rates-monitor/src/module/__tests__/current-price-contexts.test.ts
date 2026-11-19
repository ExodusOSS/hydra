import { createInMemoryAtom } from '@exodus/atoms'
import type { Logger } from '@exodus/logger'

import type { RatesByCurrency } from '../../redux/types.js'
import ratesMonitorDefinition from '../index.js'

const createRatesMonitor = ratesMonitorDefinition.factory

describe('RatesMonitor current price contexts', () => {
  it('reuses canonical full and subset validators independently', async () => {
    const { addAssets, pricingClient, ratesMonitor } = createMonitor()
    await ratesMonitor.start()
    await addAssets([
      { name: 'bitcoinAlias', ticker: 'BTC' },
      { name: 'dogecoin', ticker: 'DOGE' },
    ])
    await flushObservers()
    await ratesMonitor.update()

    expect(pricingClient.currentPrice.mock.calls).toEqual(
      expect.arrayContaining([
        [expect.objectContaining({ assets: ['BTC', 'ETH'], lastModified: undefined })],
        [expect.objectContaining({ assets: ['BTC', 'DOGE'], lastModified: undefined })],
        [expect.objectContaining({ assets: ['BTC', 'DOGE', 'ETH'], lastModified: undefined })],
      ])
    )

    await ratesMonitor.update()
    expect(pricingClient.currentPrice).toHaveBeenLastCalledWith(
      expect.objectContaining({ assets: ['BTC', 'DOGE', 'ETH'], lastModified: 'context-3' })
    )
    ratesMonitor.stop()
  })

  it('isolates validators by currency', async () => {
    const { currencyAtom, pricingClient, ratesMonitor } = createMonitor()
    await ratesMonitor.start()
    await currencyAtom.set('USD')
    await flushObservers()
    await ratesMonitor.update()
    await currencyAtom.set('EUR')
    await flushObservers()
    await ratesMonitor.update()

    const usdCalls = pricingClient.currentPrice.mock.calls.filter(
      ([request]) => request.fiatCurrency === 'USD'
    )
    expect(usdCalls[0]?.[0].lastModified).toBeUndefined()
    expect(pricingClient.currentPrice).toHaveBeenLastCalledWith(
      expect.objectContaining({ fiatCurrency: 'EUR', lastModified: expect.any(String) })
    )
    ratesMonitor.stop()
  })

  it('touches reused validators and evicts the least recently used context above 32', async () => {
    const { pricingClient, ratesAssetNamesToMonitorAtom, ratesMonitor, setAssets } = createMonitor()
    await ratesMonitor.start()

    const leastRecentlyUsedAsset = { name: 'leastRecentlyUsed', ticker: 'LRU' }
    await setAssets([leastRecentlyUsedAsset])
    await ratesAssetNamesToMonitorAtom.set([leastRecentlyUsedAsset.name])
    await ratesMonitor.update()

    const initialAssets = [
      { name: 'bitcoin', ticker: 'BTC' },
      { name: 'ethereum', ticker: 'ETH' },
    ]
    await setAssets(initialAssets)
    await ratesAssetNamesToMonitorAtom.set(initialAssets.map(({ name }) => name))
    await ratesMonitor.update()

    for (let index = 1; index <= 31; index++) {
      const asset = { name: `asset${index}`, ticker: `T${index}` }
      await setAssets([asset])
      await ratesAssetNamesToMonitorAtom.set([asset.name])
      await ratesMonitor.update()
    }

    await setAssets(initialAssets)
    await ratesAssetNamesToMonitorAtom.set(initialAssets.map(({ name }) => name))
    await ratesMonitor.update()
    expect(pricingClient.currentPrice).toHaveBeenLastCalledWith(
      expect.objectContaining({ assets: ['BTC', 'ETH'], lastModified: expect.any(String) })
    )

    await setAssets([leastRecentlyUsedAsset])
    await ratesAssetNamesToMonitorAtom.set([leastRecentlyUsedAsset.name])
    await ratesMonitor.update()
    expect(pricingClient.currentPrice).toHaveBeenLastCalledWith(
      expect.objectContaining({ assets: ['LRU'], lastModified: undefined })
    )
    ratesMonitor.stop()
  })
})

const createMonitor = () => {
  let responseNumber = 0
  const initialAssets = [
    { name: 'bitcoin', ticker: 'BTC' },
    { name: 'ethereum', ticker: 'ETH' },
  ]
  const currencyAtom = createInMemoryAtom({ defaultValue: 'EUR' })
  const assetsAtom = createInMemoryAtom({ defaultValue: { value: toAssetRecord(initialAssets) } })
  const ratesAssetNamesToMonitorAtom = createInMemoryAtom({
    defaultValue: initialAssets.map(({ name }) => name),
  })
  const ratesAtom = createInMemoryAtom<RatesByCurrency>({ defaultValue: {} })
  const pricingClient = {
    currentPrice: jest.fn(async ({ assets, fiatCurrency }: CurrentPriceRequest) => ({
      isModified: true,
      lastModified: `context-${++responseNumber}`,
      data: Object.fromEntries(assets.map((ticker) => [ticker, { [fiatCurrency]: 1, USD: 1 }])),
    })),
    ticker: jest.fn().mockResolvedValue({}),
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

  const setAssets = async (assets: Asset[]) => assetsAtom.set({ value: toAssetRecord(assets) })
  const addAssets = async (assets: Asset[]) => {
    const allAssets = [...initialAssets, ...assets]
    await setAssets(allAssets)
    await ratesAssetNamesToMonitorAtom.set(allAssets.map(({ name }) => name))
  }

  return {
    addAssets,
    currencyAtom,
    pricingClient,
    ratesAssetNamesToMonitorAtom,
    ratesMonitor,
    setAssets,
  }
}

const toAssetRecord = (assets: Asset[]) =>
  Object.fromEntries(assets.map((asset) => [asset.name, asset]))

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

type Asset = { name: string; ticker: string }
type CurrentPriceRequest = { assets: string[]; fiatCurrency: string; lastModified?: string }
