import { setup } from '../utils.js'

describe('daily-prices', () => {
  it('return daily prices for active currency', () => {
    const { store, selectors, emitMarketHistory } = setup()

    expect(selectors.marketHistory.dailyPrices(store.getState())).toEqual({})

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

    expect(selectors.marketHistory.dailyPrices(store.getState())).toEqual({
      bitcoin: {
        1_658_361_600_000: 100_000,
      },
    })
  })
})
