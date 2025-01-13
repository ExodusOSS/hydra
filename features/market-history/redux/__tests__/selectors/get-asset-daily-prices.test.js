import { setup } from '../utils'

describe('get-asset-daily-prices', () => {
  it('return daily prices for active currency for selected assetName', () => {
    const { store, selectors, emitMarketHistory } = setup()

    expect(selectors.marketHistory.getAssetDailyPrices(store.getState())('bitcoin')).toEqual(
      undefined
    )

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

    expect(selectors.marketHistory.getAssetDailyPrices(store.getState())('bitcoin')).toEqual({
      1_658_361_600_000: 100_000,
    })
  })
})
