import { http } from 'msw'

import { jsonResponse } from './utils.js'

export default function createBinAuthHandlers({ baseUrl }) {
  return [
    http.post(`${baseUrl}/auth/challenge`, jsonResponse({ challenge: 'ABC', success: true })),
    http.post(`${baseUrl}/auth/token`, jsonResponse({ token: 'ABC', success: true })),
    http.post(
      `${baseUrl}/api/v1/auth/challenge`,
      jsonResponse({ challenge: 'ABC', success: true })
    ),
    http.post(`${baseUrl}/api/v1/auth/token`, jsonResponse({ token: 'ABC', success: true })),
  ]
}
