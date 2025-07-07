import { http } from 'msw'

import config from '../../config.js'
import createBinAuthHandlers from './bin-auth.js'
import { jsonResponse, statusResponse } from './utils.js'

const kycServerUrl = 'https://kyc-d.a.exodus.io'
const baseUrl = config.referrals.API_URL
const token =
  '188c79d7dddf72e3964a5a488de643f6470ca4cacb66dc8a8a7d49b67e71aded81af6f104e71a9ad7d1ad8705ab17c389d0e3db7cc1368a837232cbe415f0752b7bf4487e0676cf7d185ae03f14033ec5e607e5bee79016b8254a9ea45b83043deadeb509369112d921889f795bf7675ecfa252aa91820cb205b713b1ba02636df92d9857edeff4e8e05b9b4e6a1d13a6e499fb9cb02b1bf985cda6795738c9f716026'

const referralsHandlers = [
  ...createBinAuthHandlers({ baseUrl: kycServerUrl }),
  ...createBinAuthHandlers({ baseUrl }),

  http.get(`${kycServerUrl}/api/v1/users/me`, jsonResponse({ provider: 'xopay', status: 'none' })),
  http.post(`${kycServerUrl}/api/request-token`, jsonResponse({ success: true, token })),
  http.get(
    `${baseUrl}/api/wallet`,
    jsonResponse({
      data: {
        algorand: {},
        ethereum: {},
      },
    })
  ),
  http.post(`${baseUrl}/api/wallet`, statusResponse(204)),
  http.post(`${baseUrl}/api/add-kyc`, jsonResponse({ success: true })),
]

export default referralsHandlers
