import { http } from 'msw'

import { jsonResponse } from './utils.js'

const txLogMonitorsHandlers = [
  http.post('https://bitcoin-s.a.exodus.io/insight/addrs/txs', jsonResponse({ items: [] })),
  http.get(
    'https://bitcoin-s.a.exodus.io/insight/v2/fees',
    jsonResponse({
      fastestFee: 8,
      halfHourFee: 8,
      hourFee: 8,
      economyFee: 2,
      minimumFee: 7,
      mempoolFeeRate: {
        fastestFee: 8,
        halfHourFee: 8,
        hourFee: 8,
        economyFee: 2,
        minimumFee: 1,
      },
      source: 'FEE_RATE_API',
      nextBlockMinimumFee: 7,
    })
  ),
]

export default txLogMonitorsHandlers
