import { setup } from '../utils'

describe('create-asset-hourly-prices-loading', () => {
  it('return false if prices are not available yet', () => {
    const { store, selectors, emitMarketHistory } = setup()

    expect(
      selectors.marketHistory.createAssetHourlyMarketHistoryLoading('bitcoin')(store.getState())
    ).toEqual(true)

    emitMarketHistory({
      data: {
        USD: {
          hourly: {
            bitcoin: {
              [new Date('2022-07-21T00:00:00.000Z').valueOf()]: 100_000,
            },
          },
        },
      },
    })

    expect(
      selectors.marketHistory.createAssetHourlyMarketHistoryLoading('bitcoin')(store.getState())
    ).toEqual(false)
  })
})
