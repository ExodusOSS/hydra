import { setup } from '../utils.js'

describe('get-is-rate-available', () => {
  it('should return function that takes assetName and returns if rate is available for it', () => {
    const { store, selectors, emitRates } = setup()

    expect(selectors.rates.getIsRateAvailable(store.getState())('bitcoin')).toEqual(false)
    expect(selectors.rates.getIsRateAvailable(store.getState())('ethereum')).toEqual(false)
    expect(selectors.rates.getIsRateAvailable(store.getState())('_usdcoin')).toEqual(false)

    emitRates({
      USD: {
        BTC: {
          price: 100,
          priceUSD: 100,
        },
      },
    })

    expect(selectors.rates.getIsRateAvailable(store.getState())('bitcoin')).toEqual(true)
    expect(selectors.rates.getIsRateAvailable(store.getState())('ethereum')).toEqual(false)
    expect(selectors.rates.getIsRateAvailable(store.getState())('_usdcoin')).toEqual(false)

    emitRates({
      USD: {
        BTC: {
          price: 100,
          priceUSD: 100,
        },
        ETH: {
          price: 100,
          priceUSD: 100,
        },
      },
    })

    expect(selectors.rates.getIsRateAvailable(store.getState())('bitcoin')).toEqual(true)
    expect(selectors.rates.getIsRateAvailable(store.getState())('ethereum')).toEqual(true)
    expect(selectors.rates.getIsRateAvailable(store.getState())('_usdcoin')).toEqual(false)

    emitRates({
      USD: {
        BTC: {
          price: 100,
          priceUSD: 100,
        },
        ETH: {
          price: 100,
          priceUSD: 100,
        },
        USDC: {
          price: 100,
          priceUSD: 100,
        },
      },
    })

    expect(selectors.rates.getIsRateAvailable(store.getState())('bitcoin')).toEqual(true)
    expect(selectors.rates.getIsRateAvailable(store.getState())('ethereum')).toEqual(true)
    expect(selectors.rates.getIsRateAvailable(store.getState())('_usdcoin')).toEqual(true)
    expect(selectors.rates.getIsRateAvailable(store.getState())('usdcoin_solana')).toEqual(false)

    emitRates({
      USD: {
        BTC: {
          price: 100,
          priceUSD: 100,
        },
        ETH: {
          price: 100,
          priceUSD: 100,
        },
        USDC: {
          price: 100,
          priceUSD: 100,
        },
        USDCSOL: {
          price: 100,
          priceUSD: 100,
        },
      },
    })

    expect(selectors.rates.getIsRateAvailable(store.getState())('usdcoin_solana')).toEqual(true)
  })
})
