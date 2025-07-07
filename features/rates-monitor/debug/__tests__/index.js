import { createInMemoryAtom } from '@exodus/atoms'

import ratesDebugDefinition from '../index.js'

const USD_BTC_INITIAL_DATA = {
  price: 30_000,
  priceUSD: 30_000,
  cap: 10_000_000,
  change24: 4,
  volume24: 1_000_000,
}

const INITIAL_VALUE = { USD: { BTC: USD_BTC_INITIAL_DATA } }

describe('ratesMonitorDebug', () => {
  let debugApi
  let ratesAtom

  beforeEach(() => {
    ratesAtom = createInMemoryAtom({ defaultValue: INITIAL_VALUE })
    debugApi = ratesDebugDefinition.factory({ ratesAtom })
  })

  it('should throw if currency not provided', async () => {
    await expect(debugApi.rates.set({ assetTicker: 'BTC', price: 1000 })).rejects.toEqual(
      new Error('you must pass currency')
    )
  })

  it('should throw if assetTicker not provided', async () => {
    await expect(debugApi.rates.set({ currency: 'USD', price: 1000 })).rejects.toEqual(
      new Error('you must pass assetTicker')
    )
  })

  it('should throw if currency not loaded', async () => {
    await expect(
      debugApi.rates.set({ currency: 'EUR', assetTicker: 'BTC', price: 1000 })
    ).rejects.toEqual(new Error('EUR rates not loaded. switch to it first.'))
  })

  it('should mock price', async () => {
    await debugApi.rates.set({ currency: 'USD', assetTicker: 'BTC', price: 1000 })

    await expect(ratesAtom.get()).resolves.toEqual({
      USD: { BTC: { ...USD_BTC_INITIAL_DATA, price: 1000 } },
    })
  })

  it('should mock priceUSD', async () => {
    await debugApi.rates.set({ currency: 'USD', assetTicker: 'BTC', priceUSD: 1000 })

    await expect(ratesAtom.get()).resolves.toEqual({
      USD: { BTC: { ...USD_BTC_INITIAL_DATA, priceUSD: 1000 } },
    })
  })

  it('should mock cap', async () => {
    await debugApi.rates.set({ currency: 'USD', assetTicker: 'BTC', cap: 1000 })

    await expect(ratesAtom.get()).resolves.toEqual({
      USD: { BTC: { ...USD_BTC_INITIAL_DATA, cap: 1000 } },
    })
  })

  it('should mock change24', async () => {
    await debugApi.rates.set({ currency: 'USD', assetTicker: 'BTC', change24: 50 })

    await expect(ratesAtom.get()).resolves.toEqual({
      USD: { BTC: { ...USD_BTC_INITIAL_DATA, change24: 50 } },
    })
  })

  it('should mock volume24', async () => {
    await debugApi.rates.set({ currency: 'USD', assetTicker: 'BTC', volume24: 50_000_000 })

    await expect(ratesAtom.get()).resolves.toEqual({
      USD: { BTC: { ...USD_BTC_INITIAL_DATA, volume24: 50_000_000 } },
    })
  })
})
