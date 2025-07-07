import { http, HttpResponse } from 'msw'

import { jsonResponse } from './utils.js'

const crossProduct = ({ from, to, value }) => {
  return Object.fromEntries(
    from.map((key) => [key, Object.fromEntries(to.map((toKey) => [toKey, value]))])
  )
}

const getPairs = (request) => {
  const url = new URL(request.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  return { from: from?.split(','), to: to?.split(',') }
}

const invalidPairs = ({ from, to }) => {
  const body = {
    invalidParameters: [],
  }

  if (!from) {
    body.invalidParameters.push('"assets.from" must be an array')
  }

  if (!to) {
    body.invalidParameters.push('"assets.to" must be an array')
  }

  const response = HttpResponse.json(body)
  response.status = 400

  return response
}

const pricingHandlers = [
  http.get('https://pricing-s.a.exodus.io/staking/rewards', jsonResponse([])),
  http.get('https://pricing-s.a.exodus.io/real-time-pricing', jsonResponse([])),
  http.get('https://pricing-s.a.exodus.io/current-price', ({ request }) => {
    const { from, to } = getPairs(request)

    if (!from || !to) {
      return invalidPairs({ from, to })
    }

    return HttpResponse.json(
      crossProduct({
        from,
        to,
        value: 9686.555_264_161_114,
      })
    )
  }),
  http.get('https://pricing-s.a.exodus.io/ticker', ({ request }) => {
    const { from, to } = getPairs(request)

    if (!from || !to) {
      return invalidPairs({ from, to })
    }

    return HttpResponse.json(
      crossProduct({
        from,
        to,
        value: {
          mc: 577_463_971_401.0068,
          v24h: 18_081_365_503.395_86,
          c24h: 1.678_705_971_243_530_6,
        },
      })
    )
  }),
  http.get('https://pricing-s.a.exodus.io/historical-price', ({ request }) => {
    const { from, to } = getPairs(request)

    if (!from || !to) {
      return invalidPairs({ from, to })
    }

    return HttpResponse.json(
      crossProduct({
        from,
        to,
        value: [],
      })
    )
  }),
]

export default pricingHandlers
