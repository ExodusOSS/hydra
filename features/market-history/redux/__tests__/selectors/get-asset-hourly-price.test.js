import { setup } from '../utils.js'

describe('get-asset-hourly-price', () => {
  it('return function to get asset historical price from selected time', () => {
    const { store, selectors, emitMarketHistory } = setup()

    expect(
      selectors.marketHistory.getAssetHourlyPrice('bitcoin')(store.getState())(
        new Date(1_658_361_600_000)
      )
    ).toEqual(null)

    emitMarketHistory({
      data: {
        USD: {
          hourly: {
            bitcoin: {
              1_658_361_600_000: 100_000,
            },
          },
        },
      },
    })

    expect(
      selectors.marketHistory.getAssetHourlyPrice('bitcoin')(store.getState())(
        new Date(1_658_361_600_000)
      )
    ).toEqual(100_000)
  })

  it('uses rate for current hour', () => {
    const { store, selectors, emitRates, START_OF_HOUR } = setup()

    expect(
      selectors.marketHistory.getAssetHourlyPrice('bitcoin')(store.getState())(
        new Date(START_OF_HOUR)
      )
    ).toEqual(null)

    emitRates({
      USD: {
        BTC: {
          price: 100,
          priceUSD: 100,
        },
      },
    })

    expect(
      selectors.marketHistory.getAssetHourlyPrice('bitcoin')(store.getState())(
        new Date(START_OF_HOUR)
      )
    ).toEqual(100)
  })
})
