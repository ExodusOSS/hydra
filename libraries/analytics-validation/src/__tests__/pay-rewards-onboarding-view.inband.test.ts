import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsOnboardingView',
    properties: {
      ...commonProps,
      step_name: 'intro',
      entry_point: 'wallet_banner',
      intro_variant: 'new_user',
      is_informational: false,
      resumed: false,
      credit_status: null,
      points: null,
    },
  },
  {
    event: 'PayRewardsOnboardingView',
    properties: {
      ...commonProps,
      step_name: 'join',
      entry_point: 'settings',
      intro_variant: 'existing_pay_user',
      is_informational: false,
      resumed: true,
      credit_status: null,
      points: null,
    },
  },
  {
    event: 'PayRewardsOnboardingView',
    properties: {
      ...commonProps,
      step_name: 'welcome_preview',
      entry_point: 'pay_home_card',
      intro_variant: 'new_user',
      is_informational: false,
      resumed: false,
      credit_status: 'estimated',
      points: 500,
    },
  },
  {
    event: 'PayRewardsOnboardingView',
    properties: {
      ...commonProps,
      step_name: 'benefits',
      entry_point: 'dashboard_info',
      intro_variant: 'existing_pay_user',
      is_informational: true,
    },
  },
  {
    event: 'PayRewardsOnboardingView',
    properties: {
      ...commonProps,
      step_name: 'intro',
      entry_point: 'profile',
      intro_variant: 'new_user',
      is_informational: false,
      resumed: false,
      credit_status: null,
      points: null,
    },
  },
  {
    event: 'PayRewardsOnboardingView',
    properties: {
      ...commonProps,
      step_name: 'intro',
      entry_point: 'send_invitation',
      intro_variant: 'new_user',
      is_informational: false,
      resumed: false,
      credit_status: null,
      points: null,
    },
  },
]

describe('PayRewardsOnboardingView', () => {
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
    it('The main schema validates "PayRewardsOnboardingView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsOnboardingView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsOnboardingView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  const validProperties = fixtures[0]!.properties

  it.each([
    ['step_name', 'dashboard'],
    ['entry_point', 'deep_link'],
    ['intro_variant', 'returning'],
    ['credit_status', 'pending'],
    ['is_informational', 'no'],
    ['resumed', 1],
    ['points', 'abc'],
  ])('Should reject invalid %s value', (property, value) => {
    expect(() =>
      validate({
        event: 'PayRewardsOnboardingView',
        properties: { ...validProperties, [property]: value },
      })
    ).toThrow()
  })
})
