import { setup } from '../utils'

describe('get-asset-hourly-prices', () => {
  it('return hourly prices for active currency for selected assetName', () => {
    const { store, selectors, emitMarketHistory } = setup()

    expect(selectors.marketHistory.getAssetHourlyPrices(store.getState())('usdcoin')).toEqual(
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

    expect(selectors.marketHistory.getAssetHourlyPrices(store.getState())('usdcoin')).toEqual({
      1_658_610_000_000: 1,
    })
  })
})
