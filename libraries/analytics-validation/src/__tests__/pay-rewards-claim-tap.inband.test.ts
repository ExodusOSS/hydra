import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsClaimTap',
    properties: {
      ...commonProps,
      entry_point: 'pay_home_card',
      points_total: 0,
      welcome_bonus_points: 500,
    },
  },
  {
    event: 'PayRewardsClaimTap',
    properties: {
      ...commonProps,
      entry_point: 'send_invitation',
      points_total: 12_000,
      welcome_bonus_points: null,
    },
  },
  {
    event: 'PayRewardsClaimTap',
    properties: {
      ...commonProps,
      entry_point: 'cash_banner',
    },
  },
]

describe('PayRewardsClaimTap', () => {
  it.each(['swap_fee', 'onboarding', 'send_invitation'])(
    'accepts the Rewards v2 %s entry point',
    (entryPoint) => {
      const event = {
        ...fixtures[0]!,
        properties: { ...fixtures[0]!.properties, entry_point: entryPoint },
      }
      expect(validate(event)).toEqual(event)
    }
  )

  fixtures.forEach((event) => {
    it('The main schema validates "PayRewardsClaimTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsClaimTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsClaimTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  const validProperties = fixtures[0]!.properties

  it.each([
    ['entry_point', 'deep_link'],
    ['points_total', -1],
    ['welcome_bonus_points', -1],
  ])('Should reject invalid %s value', (property, value) => {
    expect(() =>
      validate({
        event: 'PayRewardsClaimTap',
        properties: { ...validProperties, [property]: value },
      })
    ).toThrow()
  })
})
