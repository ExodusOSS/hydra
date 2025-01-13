import { http } from 'msw'

import createBinAuthHandlers from './bin-auth'
import feeHandlers from './fees'
import nftsHandlers from './nfts'
import pricingHandlers from './pricing'
import referralsHandlers from './referrals'
import remoteConfigHandlers from './remote-config'
import txLogMonitorsHandlers from './tx-log-monitors'
import { jsonResponse } from './utils'

const handlers = [
  ...referralsHandlers,
  ...remoteConfigHandlers,
  ...pricingHandlers,
  ...feeHandlers,
  ...nftsHandlers,
  ...txLogMonitorsHandlers,
  ...createBinAuthHandlers({ baseUrl: 'https://schrodinger-d.a.exodus.io/api' }),
  http.get('https://schrodinger-d.a.exodus.io/api/experiments', jsonResponse([])),
  http.get('https://schrodinger-d.a.exodus.io/api/variants', jsonResponse([])),
  http.get('https://crypto-news-s.a.exodus.io/news', jsonResponse([])),
  http.get(
    'https://exchange.exodus.io/v3/geolocation',
    jsonResponse({
      countryCode: 'US',
      countryName: 'United States',
      isProxy: false,
      regionCode: 'GOT',
      regionName: 'Gotham',
      timezoneName: 'GMT +02:00 (US/Gotham)',
      ip: '192.157.12.23',
      isAllowed: true,
    })
  ),
]

export default handlers
