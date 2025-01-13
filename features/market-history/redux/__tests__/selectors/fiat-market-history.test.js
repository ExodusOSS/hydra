import { setup } from '../utils'

describe('fiat-market-history', () => {
  it('return market history for active currency', () => {
    const { store, selectors, emitMarketHistory } = setup()

    expect(selectors.marketHistory.fiatMarketHistory(store.getState())).toEqual({})

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

    expect(selectors.marketHistory.fiatMarketHistory(store.getState())).toEqual({
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
    })
  })
})
