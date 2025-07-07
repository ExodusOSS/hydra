import { setup } from '../utils.js'

describe('get-hourly-price', () => {
  it('return function to get asset historical price from selected assetName and time', () => {
    const { store, selectors, emitMarketHistory } = setup()

    expect(
      selectors.marketHistory.getHourlyPrice(store.getState())(
        'bitcoin',
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
      selectors.marketHistory.getHourlyPrice(store.getState())(
        'bitcoin',
        new Date(1_658_361_600_000)
      )
    ).toEqual(100_000)
  })
})
