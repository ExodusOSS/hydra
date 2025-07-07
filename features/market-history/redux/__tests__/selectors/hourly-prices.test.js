import { setup } from '../utils.js'

describe('hourly-prices', () => {
  it('return hourly prices for active currency', () => {
    const { store, selectors, emitMarketHistory } = setup()

    expect(selectors.marketHistory.hourlyPrices(store.getState())).toEqual({})

    emitMarketHistory({
      data: {
        USD: {
          daily: {
            bitcoin: {
              1_658_361_600_000: 100_000,
            },
          },
          hourly: {
            usdcoin: {
              1_658_610_000_000: 1,
            },
          },
        },
      },
    })

    expect(selectors.marketHistory.hourlyPrices(store.getState())).toEqual({
      usdcoin: {
        1_658_610_000_000: 1,
      },
    })
  })
})
