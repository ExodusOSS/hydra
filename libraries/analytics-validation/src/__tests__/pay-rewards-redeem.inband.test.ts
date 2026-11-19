import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsRedeem',
    properties: {
      ...commonProps,
      success: true,
      points: 1000,
      amount_usd: 10,
      error_type: null,
    },
  },
  {
    event: 'PayRewardsRedeem',
    properties: {
      ...commonProps,
      success: false,
      points: null,
      amount_usd: null,
      error_type: 'insufficient_points',
    },
  },
  {
    event: 'PayRewardsRedeem',
    properties: {
      ...commonProps,
      success: false,
      points: null,
      amount_usd: null,
      error_type: 'network',
    },
  },
]

describe('PayRewardsRedeem', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayRewardsRedeem" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsRedeem" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsRedeem" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  const validProperties = fixtures[0]!.properties

  it.each([
    ['success', 'true'],
    ['points', '1000'],
    ['amount_usd', '10'],
    ['error_type', 'timeout'],
    ['error_type', false],
  ])('Should reject invalid %s value', (property, value) => {
    expect(() =>
      validate({
        event: 'PayRewardsRedeem',
        properties: { ...validProperties, [property]: value },
      })
    ).toThrow()
  })
})
