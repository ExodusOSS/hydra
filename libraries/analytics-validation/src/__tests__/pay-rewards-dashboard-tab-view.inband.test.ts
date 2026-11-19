import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsDashboardTabView',
    properties: {
      ...commonProps,
      tab: 'points',
      entry_point: 'pay_home_card',
    },
  },
  {
    event: 'PayRewardsDashboardTabView',
    properties: {
      ...commonProps,
      tab: 'store',
      entry_point: 'send_invitation',
    },
  },
  {
    event: 'PayRewardsDashboardTabView',
    properties: {
      ...commonProps,
      tab: 'benefits',
      entry_point: 'dashboard_info',
    },
  },
]

describe('PayRewardsDashboardTabView', () => {
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
    it('The main schema validates "PayRewardsDashboardTabView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsDashboardTabView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsDashboardTabView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  const validProperties = fixtures[0]!.properties

  it.each([
    ['tab', 'wishlist'],
    ['entry_point', 'deep_link'],
  ])('Should reject invalid %s value', (property, value) => {
    expect(() =>
      validate({
        event: 'PayRewardsDashboardTabView',
        properties: { ...validProperties, [property]: value },
      })
    ).toThrow()
  })
})
