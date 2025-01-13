import { setup } from '../utils'

describe('asset-rate', () => {
  it('return memoized by assetName function that return selector with asset rate', () => {
    const { store, selectors, emitRates } = setup()

    expect(selectors.rates.assetRate('bitcoin')(store.getState())).toEqual(undefined)

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

    expect(selectors.rates.assetRate('bitcoin')(store.getState())).toEqual({
      price: 100,
      priceUSD: 100,
    })
  })
})
