import { setup } from '../utils.js'

describe('prices-by-asset-nane', () => {
  it('should return map of asset names with map of prices by currency', () => {
    const { store, selectors, emitRates, emitCurrencyChange } = setup()

    expect(selectors.rates.pricesByAssetName(store.getState())).toEqual({})

    emitRates({
      USD: {
        BTC: {
          price: 100,
          priceUSD: 100,
        },
      },
      EUR: {
        BTC: {
          price: 110,
          priceUSD: 100,
        },
      },
    })

    expect(selectors.rates.pricesByAssetName(store.getState())).toEqual({
      bitcoin: {
        USD: 100,
      },
    })

    emitCurrencyChange('EUR')

    expect(selectors.rates.pricesByAssetName(store.getState())).toEqual({
      bitcoin: {
        EUR: 110,
        USD: 100,
      },
    })

    emitCurrencyChange('NAN')

    expect(selectors.rates.pricesByAssetName(store.getState())).toEqual({})
  })
})
