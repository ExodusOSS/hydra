import { setup } from '../utils.js'

describe('getPriceWithFallback', () => {
  it('return function to get asset historical price from selected assetName and time with fallback', () => {
    const { store, selectors, emitMarketHistory } = setup()

    const CURRENT_HOUR = 1_658_361_600_000
    const SEVEN_HOURS_AGO = CURRENT_HOUR - 7 * 60 * 60 * 1000
    const MANY_HOURS_AGO = CURRENT_HOUR - 70 * 60 * 60 * 1000
    expect(
      selectors.marketHistory.getPriceWithFallback(store.getState())(
        'bitcoin',
        CURRENT_HOUR,
        'hourly'
      )
    ).toEqual(null)

    emitMarketHistory({
      data: {
        USD: {
          hourly: {
            bitcoin: new Map([[SEVEN_HOURS_AGO, 100_000]]),
          },
        },
      },
    })

    expect(
      selectors.marketHistory.getPriceWithFallback(store.getState())(
        'bitcoin',
        CURRENT_HOUR,
        'hourly'
      )
    ).toEqual(100_000)
    expect(
      selectors.marketHistory.getPriceWithFallback(store.getState())(
        'bitcoin',
        MANY_HOURS_AGO,
        'hourly'
      )
    ).toEqual(null)
  })
})
