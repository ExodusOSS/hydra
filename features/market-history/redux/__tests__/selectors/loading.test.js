import { setup } from '../utils'

describe('loading', () => {
  it('should return loading selectors', () => {
    const { store, selectors, emitMarketHistory } = setup()

    expect(selectors.marketHistory.loaded(store.getState())).toEqual(false)
    expect(selectors.marketHistory.hourlyLoading(store.getState())).toEqual(true)
    expect(selectors.marketHistory.dailyLoading(store.getState())).toEqual(true)
    expect(selectors.marketHistory.loadingMap(store.getState())).toEqual({
      dailyLoading: true,
      hourlyLoading: true,
    })

    emitMarketHistory({
      data: {
        USD: {
          daily: {
            bitcoin: {
              [new Date('2022-07-21T00:00:00.000Z').valueOf()]: 100_000,
            },
          },
          hourly: {
            usdcoin: {
              [new Date('2022-07-23T21:00:00.000Z').valueOf()]: 1,
            },
          },
        },
      },
    })

    expect(selectors.marketHistory.loaded(store.getState())).toEqual(true)
    expect(selectors.marketHistory.hourlyLoading(store.getState())).toEqual(false)
    expect(selectors.marketHistory.dailyLoading(store.getState())).toEqual(false)
    expect(selectors.marketHistory.loadingMap(store.getState())).toEqual({
      dailyLoading: false,
      hourlyLoading: false,
    })
  })
})
