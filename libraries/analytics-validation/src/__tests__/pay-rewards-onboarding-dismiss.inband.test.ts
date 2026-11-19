import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsOnboardingDismiss',
    properties: {
      ...commonProps,
      step_name: 'intro',
      dismiss_method: 'back',
      entry_point: 'wallet_banner',
      intro_variant: 'new_user',
    },
  },
  {
    event: 'PayRewardsOnboardingDismiss',
    properties: {
      ...commonProps,
      step_name: 'join',
      dismiss_method: 'not_now',
      consent_toggled: true,
      entry_point: 'cash_banner',
      intro_variant: 'existing_pay_user',
    },
  },
  {
    event: 'PayRewardsOnboardingDismiss',
    properties: {
      ...commonProps,
      step_name: 'store',
      dismiss_method: 'close',
      entry_point: 'disable_sheet',
      intro_variant: 'new_user',
    },
  },
  {
    event: 'PayRewardsOnboardingDismiss',
    properties: {
      ...commonProps,
      step_name: 'intro',
      dismiss_method: 'back',
      entry_point: 'profile',
      intro_variant: 'new_user',
    },
  },
  {
    event: 'PayRewardsOnboardingDismiss',
    properties: {
      ...commonProps,
      step_name: 'dashboard',
      dismiss_method: 'back',
      entry_point: 'send_invitation',
      intro_variant: 'new_user',
    },
  },
]

describe('PayRewardsOnboardingDismiss', () => {
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
    it('The main schema validates "PayRewardsOnboardingDismiss" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsOnboardingDismiss" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsOnboardingDismiss" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  const validProperties = fixtures[1]!.properties

  it.each([
    ['step_name', 'points'],
    ['dismiss_method', 'timeout'],
    ['consent_toggled', 'yes'],
    ['entry_point', 'deep_link'],
    ['intro_variant', 'returning'],
  ])('Should reject invalid %s value', (property, value) => {
    expect(() =>
      validate({
        event: 'PayRewardsOnboardingDismiss',
        properties: { ...validProperties, [property]: value },
      })
    ).toThrow()
  })
})
