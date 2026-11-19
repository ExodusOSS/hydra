import { setup } from '../utils.js'

describe('fiat-rates', () => {
  it('should return rates for active currency', () => {
    const { store, selectors, emitRates } = setup()

    expect(selectors.rates.fiatRates(store.getState())).toEqual({})

    emitRates({
      USD: {
        BTC: {
          price: 100,
          priceUSD: 100,
        },
      },
    })

    expect(selectors.rates.fiatRates(store.getState())).toEqual({
      BTC: {
        price: 100,
        priceUSD: 100,
      },
    })
  })
})
