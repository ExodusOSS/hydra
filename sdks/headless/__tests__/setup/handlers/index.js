import { http } from 'msw'

import createBinAuthHandlers from './bin-auth.js'
import feeHandlers from './fees.js'
import kycHandlers from './kyc.js'
import nftsHandlers from './nfts.js'
import pricingHandlers from './pricing.js'
import remoteConfigHandlers from './remote-config.js'
import txLogMonitorsHandlers from './tx-log-monitors.js'
import { jsonResponse } from './utils.js'

const handlers = [
  ...kycHandlers,
  ...remoteConfigHandlers,
  ...pricingHandlers,
  ...feeHandlers,
  ...nftsHandlers,
  ...txLogMonitorsHandlers,
  ...createBinAuthHandlers({ baseUrl: 'https://schrodinger-d.a.exodus-int.com/api' }),
  ...createBinAuthHandlers({ baseUrl: 'https://fiat.a.exodus.io/api' }),
  http.get('https://schrodinger-d.a.exodus-int.com/api/experiments', jsonResponse([])),
  http.get('https://schrodinger-d.a.exodus-int.com/api/variants', jsonResponse([])),
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
  http.get('https://fiat.a.exodus.io/api/v1/me', jsonResponse(null)),
  http.get('https://fiat.a.exodus.io/api/orders', jsonResponse([])),
  http.get('https://fiat.a.exodus.io/api/has-user-passed-kyc', jsonResponse(null)),
]

export default handlers
