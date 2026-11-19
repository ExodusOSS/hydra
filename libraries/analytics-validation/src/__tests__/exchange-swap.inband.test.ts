import { commonProps, validate } from './mainschema.js'

const baseProperties = {
  ...commonProps,
  is_cross_portfolio: true,
  portfolio_from_account_source: 'exodus',
  portfolio_to_account_source: 'exodus',
  user_amount_from_usd: 100,
}

const fixtures = [
  {
    event: 'ExchangeSwap',
    properties: baseProperties,
  },
  {
    event: 'ExchangeSwap',
    properties: { ...baseProperties, rewards_points_estimate: 42 },
  },
  {
    event: 'ExchangeSwap',
    properties: { ...baseProperties, rewards_points_estimate: null },
  },
]

describe('ExchangeSwap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ExchangeSwap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ExchangeSwap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ExchangeSwap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ExchangeSwap" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, user_amount_from_usd: false },
        })
      ).toThrow()
    })
  })

  it.each([
    ['rewards_points_estimate', '42'],
    ['rewards_points_estimate', true],
  ])('Should reject invalid %s value', (property, value) => {
    expect(() =>
      validate({
        event: 'ExchangeSwap',
        properties: { ...baseProperties, [property]: value },
      })
    ).toThrow()
  })
})
