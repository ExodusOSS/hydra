import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsTermsView',
    properties: {
      ...commonProps,
      entry_point: 'wallet_banner',
    },
  },
  {
    event: 'PayRewardsTermsView',
    properties: {
      ...commonProps,
      entry_point: 'cash_banner',
    },
  },
  {
    event: 'PayRewardsTermsView',
    properties: {
      ...commonProps,
      entry_point: 'profile',
    },
  },
]

describe('PayRewardsTermsView', () => {
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
    it('The main schema validates "PayRewardsTermsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsTermsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsTermsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it.each([
    ['entry_point', 'deep_link'],
    ['entry_point', 1],
  ])('Should reject invalid %s value', (property, value) => {
    expect(() =>
      validate({
        event: 'PayRewardsTermsView',
        properties: { ...commonProps, [property]: value },
      })
    ).toThrow()
  })
})
