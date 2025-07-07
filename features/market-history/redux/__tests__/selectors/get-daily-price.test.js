import { setup } from '../utils.js'

describe('get-daily-price', () => {
  it('return function to get asset historical price from selected assetName and time', () => {
    const { store, selectors, emitMarketHistory } = setup()

    expect(
      selectors.marketHistory.getDailyPrice(store.getState())(
        'bitcoin',
        new Date(1_658_361_600_000)
      )
    ).toEqual(null)

    emitMarketHistory({
      data: {
        USD: {
          daily: {
            bitcoin: {
              1_658_361_600_000: 100_000,
            },
          },
        },
      },
    })

    expect(
      selectors.marketHistory.getDailyPrice(store.getState())(
        'bitcoin',
        new Date(1_658_361_600_000)
      )
    ).toEqual(100_000)
  })

  it('fallback to current price if date is today', () => {
    const startOfHour = 1_658_372_400_000 // 03:00 21 Jul 2022
    const startOfHourTimeSelectorDefinition = {
      id: 'time.selectors.startOfHour',
      factory: () => (state) => startOfHour,
    }

    const { store, selectors, emitMarketHistory, emitRates } = setup({
      dependencies: [startOfHourTimeSelectorDefinition],
    })

    expect(
      selectors.marketHistory.getDailyPrice(store.getState())(
        'bitcoin',
        new Date(new Date(Date.UTC(2022, 6, 21, 6, 0, 0))) // 06:00 21 Jul 2022
      )
    ).toEqual(null)

    emitRates({
      USD: {
        BTC: {
          price: 500,
          priceUSD: 500,
        },
      },
    })

    emitMarketHistory({
      data: {
        USD: {
          daily: {
            bitcoin: {
              1_658_275_200_000: 400, // 00:00 20 Jul 2022
            },
          },
        },
      },
    })

    expect(
      selectors.marketHistory.getDailyPrice(store.getState())(
        'bitcoin',
        new Date(new Date(Date.UTC(2022, 6, 21, 6, 0, 0))) // 06:00 21 Jul 2022
      )
    ).toEqual(500)
  })
})
