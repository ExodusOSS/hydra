import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsDashboardView',
    properties: {
      ...commonProps,
      entry_point: 'onboarding',
      points_total: 500,
      points_pending: 20,
      can_redeem: false,
    },
  },
  {
    event: 'PayRewardsDashboardView',
    properties: {
      ...commonProps,
      entry_point: 'pay_home_card',
      points_total: 12_000,
      points_pending: 0,
      can_redeem: true,
    },
  },
  {
    event: 'PayRewardsDashboardView',
    properties: {
      ...commonProps,
      entry_point: 'profile',
      points_total: 500,
      points_pending: 20,
      can_redeem: false,
    },
  },
  {
    event: 'PayRewardsDashboardView',
    properties: {
      ...commonProps,
      entry_point: 'send_invitation',
      points_total: 0,
      points_pending: 0,
      can_redeem: false,
      welcome_bonus_points: 500,
    },
  },
  {
    event: 'PayRewardsDashboardView',
    properties: {
      ...commonProps,
      entry_point: 'dashboard_info',
      points_total: 500,
      welcome_bonus_points: null,
    },
  },
]

describe('PayRewardsDashboardView', () => {
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
    it('The main schema validates "PayRewardsDashboardView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsDashboardView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsDashboardView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  const validProperties = fixtures[0]!.properties

  it.each([
    ['entry_point', 'deep_link'],
    ['points_total', '500'],
    ['points_pending', null],
    ['can_redeem', 'yes'],
    ['welcome_bonus_points', -1],
  ])('Should reject invalid %s value', (property, value) => {
    expect(() =>
      validate({
        event: 'PayRewardsDashboardView',
        properties: { ...validProperties, [property]: value },
      })
    ).toThrow()
  })
})
