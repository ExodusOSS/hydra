import rates from './_rate_fixtures.json' with { type: 'json' }

interface RateSide {
  fromSide: string
  toSide: string
}

export interface RateFixture {
  id: number
  rate: string
  from: string
  to: string
  conversion: RateSide
  conversionByRate: RateSide
}

export default rates as RateFixture[]
