import { setup } from '../utils.js'

describe('loading', () => {
  it('should return loading selectors', () => {
    const { store, selectors, emitMarketHistory } = setup()

    expect(selectors.marketHistory.hourlyLoading(store.getState())).toEqual(true)
    expect(selectors.marketHistory.dailyLoading(store.getState())).toEqual(true)
    expect(selectors.marketHistory.loadingMap(store.getState())).toEqual({
      dailyLoading: true,
      hourlyLoading: true,
      minutelyLoading: true,
    })

    // .start() scaffolds out empty data structures before it loads real data
    emitMarketHistory({
      data: {
        USD: {
          daily: Object.create(null),
          hourly: Object.create(null),
          minutely: Object.create(null),
        },
      },
    })

    expect(selectors.marketHistory.hourlyLoading(store.getState())).toEqual(true)
    expect(selectors.marketHistory.dailyLoading(store.getState())).toEqual(true)
    expect(selectors.marketHistory.loadingMap(store.getState())).toEqual({
      dailyLoading: true,
      hourlyLoading: true,
      minutelyLoading: true,
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

    expect(selectors.marketHistory.hourlyLoading(store.getState())).toEqual(false)
    expect(selectors.marketHistory.dailyLoading(store.getState())).toEqual(false)
    expect(selectors.marketHistory.loadingMap(store.getState())).toEqual({
      dailyLoading: false,
      hourlyLoading: false,
      minutelyLoading: true,
    })
  })
})
