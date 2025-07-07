import { http } from 'msw'

import { ADDRESS, BASE_URL, TEST_NFTS, TEST_TXS } from '../../fixtures/nfts.js'
import { jsonResponse } from './utils.js'

const nftsHandlers = [
  http.get(`${BASE_URL}/ethereum/${ADDRESS}/nfts`, jsonResponse(TEST_NFTS)),
  http.get(`${BASE_URL}/ethereum/${ADDRESS}/transactions`, jsonResponse(TEST_TXS)),
  http.get(`${BASE_URL}/ethereum/collection-stats`, jsonResponse({})),
]

export default nftsHandlers
