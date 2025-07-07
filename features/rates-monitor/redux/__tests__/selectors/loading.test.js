import { setup } from '../utils.js'

describe('loading', () => {
  it('should return loading state', () => {
    const { store, selectors, emitRates } = setup()

    expect(selectors.rates.loading(store.getState())).toEqual(true)

    emitRates({
      USD: {
        BTC: {
          price: 100,
          priceUSD: 100,
        },
      },
    })

    expect(selectors.rates.loading(store.getState())).toEqual(false)
  })
})
