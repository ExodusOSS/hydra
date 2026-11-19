import { setup } from '../utils.js'

describe('asset-price', () => {
  it('return memoized by assetName function that return selector with asset price', () => {
    const { store, selectors, emitRates } = setup()

    expect(selectors.rates.assetPrice('bitcoin')(store.getState())).toEqual(undefined)

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

    expect(selectors.rates.assetPrice('bitcoin')(store.getState())).toEqual(100)
  })
})
