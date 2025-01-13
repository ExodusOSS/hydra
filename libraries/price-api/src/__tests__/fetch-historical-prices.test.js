import test from 'tape'
import { fetchHistoricalPrices } from '../index'

test('fetchHistoricalPrices returns fetched data + cached items', async (t) => {
  const api = () => {
    return {
      BTC: {
        USD: [
          { time: 1000, close: 10, open: 9 },
          { time: 1001, close: 11, open: 10 },
        ],
      },
    }
  }
  const assetTickers = ['BTC']
  const fiatTicker = 'USD'
  const granularity = 'day'
  const cache = {
    BTC: [[999999, { close: 9 }]],
  }
  const getCacheFromStorage = (assetTicker) => {
    return cache[assetTicker]
  }
  const ignoreInvalidSymbols = false

  const { historicalPricesMap, fetchedPricesMap } = await fetchHistoricalPrices({
    api,
    assetTickers,
    fiatTicker,
    granularity,
    getCacheFromStorage,
    ignoreInvalidSymbols,
  })

  t.deepEqual(
    [...historicalPricesMap.get('BTC')],
    [
      [999999, { close: 9 }],
      [1000000, { close: 10 }],
      [1001000, { close: 11 }],
    ]
  )

  t.deepEqual(
    [...fetchedPricesMap.get('BTC')],
    [
      [999999, { close: 9 }],
      [1000000, { close: 10 }],
      [1001000, { close: 11 }],
    ]
  )

  // needs tape dependency update
  // t.deepEqual(
  //   result,
  //   new Map([
  //     [
  //       'BTC',
  //       new Map([
  //         [999999, { close: 91 }],
  //         [1000000, { close: 10 }],
  //         [1001000, { close: 11 }],
  //       ]),
  //     ],
  //   ])
  // )
  t.end()
})
